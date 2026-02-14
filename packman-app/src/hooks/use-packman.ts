import { useState, useCallback, useEffect, useRef } from "react";
import { api } from "../lib/api";

const RECENT_TRIAL_WORKSPACES_KEY = "packman.recentTrialWorkspaces.v1";
const MAX_RECENT_TRIAL_WORKSPACES = 12;

export const AVAILABLE_IMPORT_CATEGORIES = [
  "agents",
  "prompts",
  "instructions",
  "skills",
  "settings",
  "hooks",
  "mcp",
  "alwaysOn",
  "manifest",
  "readme",
] as const;

export type ImportCategory = (typeof AVAILABLE_IMPORT_CATEGORIES)[number];

function normalizeRecentTrialWorkspaceList(paths: string[]): string[] {
  const unique = [...new Set(paths.filter((value) => value.length > 0))];
  return unique.slice(0, MAX_RECENT_TRIAL_WORKSPACES);
}

function readRecentTrialWorkspaces(): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(RECENT_TRIAL_WORKSPACES_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return normalizeRecentTrialWorkspaceList(
      parsed.filter((value): value is string => typeof value === "string"),
    );
  } catch {
    return [];
  }
}

function writeRecentTrialWorkspaces(paths: string[]): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    RECENT_TRIAL_WORKSPACES_KEY,
    JSON.stringify(normalizeRecentTrialWorkspaceList(paths)),
  );
}

interface PackmanAppE2EBridge {
  setSourcePath: (path: string | null) => void;
  setTargetPath: (path: string | null) => void;
  setMockResponse: (
    command: "validate" | "install" | "doctor" | "normalize",
    response: unknown,
  ) => void;
  reset: () => void;
  getState: () => {
    sourcePath: string | null;
    targetPath: string | null;
    mockedCommands: string[];
  };
}

declare global {
  interface Window {
    __PACKMAN_APP_E2E__?: PackmanAppE2EBridge;
  }
}

const e2eState: {
  sourcePath: string | null;
  targetPath: string | null;
  mockResponses: Partial<
    Record<"validate" | "install" | "doctor" | "normalize", unknown>
  >;
} = {
  sourcePath: null,
  targetPath: null,
  mockResponses: {},
};

if (typeof window !== "undefined" && !window.__PACKMAN_APP_E2E__) {
  window.__PACKMAN_APP_E2E__ = {
    setSourcePath: (path) => {
      e2eState.sourcePath = path;
    },
    setTargetPath: (path) => {
      e2eState.targetPath = path;
    },
    setMockResponse: (command, response) => {
      e2eState.mockResponses[command] = response;
    },
    reset: () => {
      e2eState.sourcePath = null;
      e2eState.targetPath = null;
      e2eState.mockResponses = {};
    },
    getState: () => ({
      sourcePath: e2eState.sourcePath,
      targetPath: e2eState.targetPath,
      mockedCommands: Object.keys(e2eState.mockResponses),
    }),
  };
}

export interface ValidationIssue {
  severity: "error" | "warning";
  code: string;
  message: string;
  path?: string;
}

interface CommandErrorOutput {
  ok: false;
  error: string;
  command: "install";
  action: "plan" | "apply";
}

interface CleanMacOsJunkResult {
  ok: boolean;
  removed?: string[];
  removedCount?: number;
  error?: string;
}

interface WorkspaceFileProbeResult {
  ok: boolean;
  exists?: boolean;
  path?: string;
  error?: string;
}

interface WorkspaceFileCreateResult {
  ok: boolean;
  created?: boolean;
  path?: string;
  error?: string;
}

function parseCommandFailure(
  value: unknown,
  sourcePath?: string | null,
): string | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as {
    ok?: unknown;
    error?: unknown;
    issues?: Array<{ severity?: string; message?: string; code?: string }>;
  };

  const issues = Array.isArray(candidate.issues) ? candidate.issues : [];
  const hasSuiteRequired = issues.some(
    (issue) => issue?.code === "SUITE_OWNED_PATHS_REQUIRE_SUITE_MODE",
  );
  if (hasSuiteRequired) {
    return "Suite-owned artifacts were detected (for example hooks, MCP config, or always-on instruction files). Run Normalize, then validate/install in suite mode or remove suite-owned paths from this pack.";
  }

  const hasManifestCoverageGap = issues.some(
    (issue) => issue?.code === "MANIFEST_OWNED_PATHS_COVERAGE",
  );
  if (hasManifestCoverageGap) {
    return "PACK_MANIFEST.json owned_paths does not cover all detected artifacts. Run Normalize to auto-fill owned_paths, then re-validate.";
  }

  const hasManifestIntentConflict = issues.some(
    (issue) => issue?.code === "MANIFEST_INTENT_PATH_CONFLICT",
  );
  if (hasManifestIntentConflict) {
    return "Manifest intended_install conflicts with suite-owned artifact paths. Update intended_install or remove suite-owned files, then re-validate.";
  }

  const hasCollisionFailSafe = issues.some(
    (issue) => issue?.code === "COLLISION_FAILSAFE",
  );
  if (hasCollisionFailSafe) {
    return "Install plan found collisions. Choose skip/overwrite/rename in Collision Strategy and regenerate the plan.";
  }

  const hasPackNotDetected = issues.some(
    (issue) => issue?.code === "PACK_NOT_DETECTED",
  );
  if (hasPackNotDetected && sourcePath) {
    const normalized = sourcePath.replace(/\\/g, "/").toLowerCase();
    const appearsToBeCatalogRoot =
      normalized.endsWith("/packs") || normalized.endsWith("/packs/");
    if (appearsToBeCatalogRoot) {
      return "No installable pack roots were discovered under this catalog path. Confirm pack directories include supported artifact roots such as .github/.claude/.agents/.vscode and optional AGENTS.md/CLAUDE.md files.";
    }

    return "No installable pack content was found in the selected source. Select a pack directory or a parent directory that contains one or more packs.";
  }

  if (typeof candidate.error === "string" && candidate.error.trim()) {
    return candidate.error;
  }

  if (candidate.ok === false) {
    const firstError = issues.find(
      (issue) => issue?.severity === "error" && issue.message,
    );
    if (firstError?.message) {
      return firstError.message;
    }
    if (issues.length > 0) {
      return issues
        .map((issue) => issue?.message)
        .filter((message): message is string => typeof message === "string")
        .join("; ");
    }
    return "Command failed";
  }

  return null;
}

export function usePackman() {
  const debugLog = useCallback((event: string, details?: unknown) => {
    if (details === undefined) {
      console.debug(`[Packman Debug] ${event}`);
      return;
    }
    console.debug(`[Packman Debug] ${event}`, details);
  }, []);

  const [sourcePath, setSourcePath] = useState<string | null>(
    () => e2eState.sourcePath,
  );
  const [targetPath, setTargetPath] = useState<string | null>(
    () => e2eState.targetPath,
  );
  const [workspaceParentPath, setWorkspaceParentPath] = useState<string | null>(
    null,
  );
  const [installTargetType, setInstallTargetType] = useState<
    "workspace" | "global"
  >("workspace");
  const [globalProfilePath, setGlobalProfilePath] = useState<string | null>(
    null,
  );
  const [selectedImportCategories, setSelectedImportCategories] = useState<
    ImportCategory[]
  >([...AVAILABLE_IMPORT_CATEGORIES]);
  const [selectedImportPaths, setSelectedImportPaths] = useState<string[]>([]);
  const [collisionStrategy, setCollisionStrategy] = useState<
    "fail" | "skip" | "overwrite" | "rename"
  >("fail");
  const [isBusy, setIsBusy] = useState(false);
  const [lastOutput, setLastOutput] = useState<unknown>(null);
  const [planOutput, setPlanOutput] = useState<unknown>(null);
  const [installOutput, setInstallOutput] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [recentTrialWorkspaces, setRecentTrialWorkspaces] = useState<string[]>(
    () => readRecentTrialWorkspaces(),
  );
  const recentTrialWorkspacesRef = useRef<string[]>(recentTrialWorkspaces);

  useEffect(() => {
    recentTrialWorkspacesRef.current = recentTrialWorkspaces;
  }, [recentTrialWorkspaces]);

  useEffect(() => {
    if (workspaceParentPath) {
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const defaultParent = await api.getDefaultWorkspaceParent();
        debugLog("Resolved default workspace parent", { defaultParent });
        if (!cancelled && defaultParent) {
          setWorkspaceParentPath(defaultParent);
        }
      } catch (error) {
        debugLog("Failed resolving default workspace parent", {
          error: String(error),
        });
        // ignore default path detection failures
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [debugLog, workspaceParentPath]);

  useEffect(() => {
    if (installTargetType !== "global" || globalProfilePath) {
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const resolvedPath = await api.getDefaultGlobalProfileRoot();
        if (!cancelled && resolvedPath) {
          setGlobalProfilePath(resolvedPath);
        }
      } catch (err) {
        if (!cancelled) {
          setError(String(err));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [globalProfilePath, installTargetType]);

  const pushRecentTrialWorkspace = useCallback((workspacePath: string) => {
    setRecentTrialWorkspaces((previous) => {
      const next = normalizeRecentTrialWorkspaceList([
        workspacePath,
        ...previous.filter((item) => item !== workspacePath),
      ]);
      recentTrialWorkspacesRef.current = next;
      writeRecentTrialWorkspaces(next);
      return next;
    });
  }, []);

  const dropRecentTrialWorkspace = useCallback((workspacePath: string) => {
    setRecentTrialWorkspaces((previous) => {
      const next = normalizeRecentTrialWorkspaceList(
        previous.filter((item) => item !== workspacePath),
      );
      recentTrialWorkspacesRef.current = next;
      writeRecentTrialWorkspaces(next);
      return next;
    });
  }, []);

  const pickSource = useCallback(async () => {
    if (e2eState.sourcePath) {
      setSourcePath(e2eState.sourcePath);
      return;
    }

    try {
      setIsBusy(true);
      const path = await api.pickDirectory("Select Source Pack");
      if (path) {
        setSourcePath(path);
        // Auto-validate on pick (optional, can be separate step)
        // await validatePack(path);
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setIsBusy(false);
    }
  }, []);

  const pickTarget = useCallback(async () => {
    if (e2eState.targetPath) {
      setTargetPath(e2eState.targetPath);
      return;
    }

    try {
      setIsBusy(true);
      const path = await api.pickDirectory(
        installTargetType === "global"
          ? "Select Global Profile Target"
          : "Select Target Workspace",
      );
      if (path) {
        if (installTargetType === "global") {
          setGlobalProfilePath(path);
        } else {
          setTargetPath(path);
        }
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setIsBusy(false);
    }
  }, [installTargetType]);

  const pickWorkspaceParent = useCallback(async () => {
    try {
      setIsBusy(true);
      const defaultParent =
        workspaceParentPath ?? (await api.getDefaultWorkspaceParent());
      const path = await api.pickDirectory(
        "Select Parent Folder for Trial Workspace",
        defaultParent,
      );
      if (path) {
        setWorkspaceParentPath(path);
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setIsBusy(false);
    }
  }, [workspaceParentPath]);

  const createTrialWorkspace = useCallback(async () => {
    if (e2eState.targetPath) {
      setTargetPath(e2eState.targetPath);
      return e2eState.targetPath;
    }

    if (!workspaceParentPath) {
      setError("Select a parent folder first");
      return null;
    }

    try {
      setIsBusy(true);
      setError(null);
      const path = await api.createTrialWorkspace(workspaceParentPath);
      setTargetPath(path);
      pushRecentTrialWorkspace(path);
      return path;
    } catch (err) {
      setError(String(err));
      return null;
    } finally {
      setIsBusy(false);
    }
  }, [pushRecentTrialWorkspace, workspaceParentPath]);

  const setTargetWorkspace = useCallback(
    (path: string | null) => {
      setTargetPath(path);
      if (path) {
        pushRecentTrialWorkspace(path);
      }
    },
    [pushRecentTrialWorkspace],
  );

  const openWorkspaceInFinder = useCallback(async (workspacePath: string) => {
    try {
      const workspaceProbe = (await api.probeWorkspaceFile(
        workspacePath,
      )) as WorkspaceFileProbeResult;
      await api.openPathInFileManager(
        workspaceProbe.ok && workspaceProbe.exists && workspaceProbe.path
          ? workspaceProbe.path
          : workspacePath,
      );
      return true;
    } catch (err) {
      setError(String(err));
      return false;
    }
  }, []);

  const cleanupTrialWorkspace = useCallback(
    async (workspacePath: string) => {
      try {
        setIsBusy(true);
        setError(null);
        await api.cleanupTrialWorkspace(workspacePath);
        dropRecentTrialWorkspace(workspacePath);
        if (targetPath === workspacePath) {
          setTargetPath(null);
        }
        return true;
      } catch (err) {
        setError(String(err));
        return false;
      } finally {
        setIsBusy(false);
      }
    },
    [dropRecentTrialWorkspace, targetPath],
  );

  const refreshRecentTrialWorkspaces = useCallback(async () => {
    const current = normalizeRecentTrialWorkspaceList(
      recentTrialWorkspacesRef.current,
    );
    const existing: string[] = [];
    for (const workspacePath of current) {
      try {
        const ok = await api.workspacePathExists(workspacePath);
        if (ok) {
          existing.push(workspacePath);
        }
      } catch {
        // ignore missing path checks
      }
    }
    const next = normalizeRecentTrialWorkspaceList(existing);
    recentTrialWorkspacesRef.current = next;
    setRecentTrialWorkspaces(next);
    writeRecentTrialWorkspaces(next);
  }, []);

  const validatePack = useCallback(async () => {
    if (!sourcePath) {
      setError("Select source folder first");
      return null;
    }

    try {
      setIsBusy(true);
      setError(null);

      const mockedValidation = e2eState.mockResponses.validate;
      if (mockedValidation !== undefined) {
        setLastOutput(mockedValidation);
        return mockedValidation;
      }

      const args = [sourcePath, "--json"];
      const result = await api.runPackmanCommand("validate", args);
      const failure = parseCommandFailure(result, sourcePath);
      if (failure) {
        setError(failure);
      }
      setLastOutput(result);
      return result;
      // Simplify error handling: check result structure if needed
    } catch (err) {
      setError(String(err));
      return null;
    } finally {
      setIsBusy(false);
    }
  }, [sourcePath]);

  const normalizePack = useCallback(async () => {
    if (!sourcePath) {
      setError("Select source folder first");
      return null;
    }

    try {
      setIsBusy(true);
      setError(null);

      const mockedNormalize = e2eState.mockResponses.normalize;
      if (mockedNormalize !== undefined) {
        setLastOutput(mockedNormalize);
        return mockedNormalize;
      }

      const args = [sourcePath, "--apply", "--json"];
      const result = await api.runPackmanCommand("normalize", args);
      const failure = parseCommandFailure(result, sourcePath);
      if (failure) {
        setError(failure);
      }
      setLastOutput(result);
      return result;
    } catch (err) {
      setError(String(err));
      return null;
    } finally {
      setIsBusy(false);
    }
  }, [sourcePath]);

  const cleanSourceMacOsJunk = useCallback(async () => {
    if (!sourcePath) {
      setError("Select source folder first");
      return null;
    }

    try {
      setIsBusy(true);
      setError(null);
      const result = (await api.cleanMacOsJunk(
        sourcePath,
      )) as CleanMacOsJunkResult;
      if (!result.ok) {
        const message =
          typeof result.error === "string" && result.error.length > 0
            ? result.error
            : "Failed to clean Apple junk files";
        setError(message);
      }
      setLastOutput(result);
      return result;
    } catch (err) {
      setError(String(err));
      return null;
    } finally {
      setIsBusy(false);
    }
  }, [sourcePath]);

  const createTargetWorkspaceFile = useCallback(async () => {
    if (!targetPath) {
      setError("No target workspace selected");
      return null;
    }

    try {
      setIsBusy(true);
      setError(null);
      const result = (await api.createWorkspaceFile(
        targetPath,
      )) as WorkspaceFileCreateResult;
      if (!result.ok) {
        const message =
          typeof result.error === "string" && result.error.length > 0
            ? result.error
            : "Failed to create workspace file";
        setError(message);
      }
      setLastOutput(result);
      return result;
    } catch (err) {
      setError(String(err));
      return null;
    } finally {
      setIsBusy(false);
    }
  }, [targetPath]);

  const probeTargetWorkspaceFile = useCallback(async () => {
    if (installTargetType === "global") {
      return {
        ok: true,
        exists: true,
        reason: "GLOBAL_TARGET",
      };
    }

    if (!targetPath) {
      return {
        ok: true,
        exists: false,
        reason: "NO_TARGET",
      };
    }

    try {
      return (await api.probeWorkspaceFile(
        targetPath,
      )) as WorkspaceFileProbeResult;
    } catch (err) {
      const message = String(err);
      setError(message);
      return {
        ok: false,
        exists: false,
        error: message,
      };
    }
  }, [installTargetType, targetPath]);

  const buildInstallError = useCallback(
    (action: "plan" | "apply", message: string): CommandErrorOutput => ({
      ok: false,
      error: message,
      command: "install",
      action,
    }),
    [],
  );

  const ensureTargetWorkspace = useCallback(async () => {
    if (installTargetType === "global") {
      if (globalProfilePath) {
        return globalProfilePath;
      }

      const resolvedPath = await api.getDefaultGlobalProfileRoot();
      setGlobalProfilePath(resolvedPath);
      return resolvedPath;
    }

    if (targetPath) {
      return targetPath;
    }

    if (e2eState.targetPath) {
      setTargetPath(e2eState.targetPath);
      return e2eState.targetPath;
    }

    const seededPath = await api.seedTrialWorkspace();
    setTargetPath(seededPath);
    pushRecentTrialWorkspace(seededPath);
    return seededPath;
  }, [
    globalProfilePath,
    installTargetType,
    pushRecentTrialWorkspace,
    targetPath,
  ]);

  const appendInstallSelectionArgs = useCallback(
    (args: string[]) => {
      args.push("--target-type", installTargetType);
      for (const category of selectedImportCategories) {
        args.push("--include-category", category);
      }
      for (const relativePath of selectedImportPaths) {
        args.push("--include-path", relativePath);
      }
    },
    [installTargetType, selectedImportCategories, selectedImportPaths],
  );

  const installPlan = useCallback(async () => {
    if (!sourcePath) {
      const message = "Select source folder first";
      const failure = buildInstallError("plan", message);
      setError(message);
      setPlanOutput(failure);
      return failure;
    }

    try {
      setIsBusy(true);
      setError(null);
      debugLog("Install plan requested", {
        sourcePath,
        targetPath,
        collisionStrategy,
      });
      const mockedInstall = e2eState.mockResponses.install;
      if (mockedInstall !== undefined) {
        debugLog("Install plan using mocked response");
        setPlanOutput(mockedInstall);
        return mockedInstall;
      }

      const resolvedTargetPath = await ensureTargetWorkspace();
      if (installTargetType === "workspace") {
        const workspaceProbe = (await api.probeWorkspaceFile(
          resolvedTargetPath,
        )) as WorkspaceFileProbeResult;
        if (!workspaceProbe.ok) {
          const message =
            workspaceProbe.error ??
            "Failed to inspect target workspace file state";
          const failure = buildInstallError("plan", message);
          setError(message);
          setPlanOutput(failure);
          return failure;
        }

        if (!workspaceProbe.exists) {
          const message =
            "No VS Code .code-workspace file found in target. Confirm to create one before generating a plan.";
          const failure = {
            ok: false,
            error: message,
            code: "WORKSPACE_FILE_MISSING",
            targetPath: resolvedTargetPath,
            action: "plan",
          };
          setError(message);
          setPlanOutput(failure);
          return failure;
        }
      }

      const args = [
        sourcePath,
        "--to",
        resolvedTargetPath,
        "--mode",
        collisionStrategy,
        "--dry-run",
        "--json",
      ];
      appendInstallSelectionArgs(args);
      const result = await api.runPackmanCommand("install", args);
      const failure = parseCommandFailure(result, sourcePath);
      if (failure) {
        setError(failure);
      }
      debugLog("Install plan result received", result);
      setPlanOutput(result);
      return result;
    } catch (err) {
      const message = String(err);
      const failure = buildInstallError("plan", message);
      setError(message);
      setPlanOutput(failure);
      return failure;
    } finally {
      setIsBusy(false);
    }
  }, [
    appendInstallSelectionArgs,
    buildInstallError,
    collisionStrategy,
    debugLog,
    ensureTargetWorkspace,
    installTargetType,
    sourcePath,
    targetPath,
  ]);

  const installApply = useCallback(async () => {
    if (!sourcePath) {
      const message = "Select source folder first";
      const failure = buildInstallError("apply", message);
      setError(message);
      setInstallOutput(failure);
      return failure;
    }

    try {
      setIsBusy(true);
      setError(null);
      debugLog("Install apply requested", {
        sourcePath,
        targetPath,
        collisionStrategy,
      });
      const resolvedTargetPath = await ensureTargetWorkspace();
      const args = [
        sourcePath,
        "--to",
        resolvedTargetPath,
        "--mode",
        collisionStrategy,
        "--json",
      ];
      appendInstallSelectionArgs(args);
      const mockedInstall = e2eState.mockResponses.install;
      if (mockedInstall !== undefined) {
        debugLog("Install apply using mocked response");
        setInstallOutput(mockedInstall);
        return mockedInstall;
      }
      const result = await api.runPackmanCommand("install", args);
      const failure = parseCommandFailure(result, sourcePath);
      if (failure) {
        setError(failure);
      }
      debugLog("Install apply result received", result);
      setInstallOutput(result);
      return result;
    } catch (err) {
      const message = String(err);
      const failure = buildInstallError("apply", message);
      setError(message);
      setInstallOutput(failure);
      return failure;
    } finally {
      setIsBusy(false);
    }
  }, [
    appendInstallSelectionArgs,
    buildInstallError,
    collisionStrategy,
    debugLog,
    ensureTargetWorkspace,
    sourcePath,
    targetPath,
  ]);

  const runDoctor = useCallback(async () => {
    try {
      setIsBusy(true);
      setError(null);
      const mockedDoctor = e2eState.mockResponses.doctor;
      if (mockedDoctor !== undefined) {
        setLastOutput(mockedDoctor);
        return mockedDoctor;
      }
      const result = await api.runPackmanCommand("doctor", ["."]);
      setLastOutput(result);
      return result;
    } catch (err) {
      setError(String(err));
      return null;
    } finally {
      setIsBusy(false);
    }
  }, []);

  return {
    sourcePath,
    targetPath,
    installTargetType,
    globalProfilePath,
    workspaceParentPath,
    collisionStrategy,
    selectedImportCategories,
    selectedImportPaths,
    isBusy,
    lastOutput,
    planOutput,
    installOutput,
    error,
    recentTrialWorkspaces,
    setInstallTargetType,
    setGlobalProfilePath,
    setSelectedImportCategories,
    setSelectedImportPaths,
    setCollisionStrategy,
    setTargetWorkspace,
    pickSource,
    pickTarget,
    pickWorkspaceParent,
    createTrialWorkspace,
    openWorkspaceInFinder,
    cleanupTrialWorkspace,
    refreshRecentTrialWorkspaces,
    validatePack,
    normalizePack,
    cleanSourceMacOsJunk,
    createTargetWorkspaceFile,
    probeTargetWorkspaceFile,
    installPlan,
    installApply,
    runDoctor,
  };
}
