import { useState, useEffect } from "react";
import { AVAILABLE_IMPORT_CATEGORIES, usePackman } from "../hooks/use-packman";
import { Button } from "../ui/Button";
import { Card, CardContent } from "../ui/Card";
import { Input } from "../ui/Input";
import { PageLayout } from "../ui/layout/PageLayout";
import {
  FolderOpen,
  ArrowRight,
  CheckCircle2,
  FolderPlus,
  WandSparkles,
} from "lucide-react";
import { cn } from "../lib/utils";
import confetti from "canvas-confetti";
import { AnimatePresence, motion } from "framer-motion";

interface ImportWizardProps {
  onBack: () => void;
  onInstallComplete?: () => void;
}

type Step = "select" | "validate" | "config" | "plan" | "install";

type WizardIssue = {
  severity: "error" | "warning" | "info";
  code: string;
  message: string;
  path?: string;
};

const GLOBAL_CATEGORY_DESTINATIONS: Record<string, string> = {
  agents: ".github/agents",
  prompts: ".github/prompts",
  instructions: ".github/instructions",
  skills: ".github/skills",
  settings: ".vscode",
  hooks: ".github/hooks",
  mcp: ".vscode/mcp.json",
  alwaysOn: "(profile root)",
  manifest: "PACK_MANIFEST.json",
  readme: "README.md",
};

function getWorkspaceUid(
  workspacePath: string | null | undefined,
): string | null {
  if (!workspacePath) {
    return null;
  }

  const normalized = workspacePath.replace(/\\/g, "/");
  const leaf = normalized.split("/").filter(Boolean).pop();
  if (!leaf) {
    return null;
  }

  const match = /^packman-trial-(.+)$/.exec(leaf);
  return match?.[1] ?? leaf;
}

function hasMacOsJunkIssue(value: unknown): boolean {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as {
    issues?: Array<{ code?: string }>;
  };

  if (!Array.isArray(candidate.issues)) {
    return false;
  }

  return candidate.issues.some((issue) => issue?.code === "MACOS_JUNK");
}

export function ImportWizard({ onBack, onInstallComplete }: ImportWizardProps) {
  const extractIssues = (value: unknown): WizardIssue[] => {
    if (!value || typeof value !== "object") {
      return [];
    }

    const candidate = value as {
      issues?: Array<{
        severity?: "error" | "warning" | "info";
        code?: string;
        message?: string;
        path?: string;
      }>;
    };

    if (!Array.isArray(candidate.issues)) {
      return [];
    }

    return candidate.issues
      .filter(
        (
          issue,
        ): issue is Required<Pick<WizardIssue, "code" | "message">> &
          Omit<WizardIssue, "code" | "message"> =>
          typeof issue?.code === "string" && typeof issue?.message === "string",
      )
      .map((issue) => ({
        severity: issue.severity ?? "info",
        code: issue.code,
        message: issue.message,
        path: issue.path,
      }));
  };

  const issueGuidance = (issue: WizardIssue): string | null => {
    switch (issue.code) {
      case "MANIFEST_OWNED_PATHS_COVERAGE":
      case "MANIFEST_OWNED_PATHS_RECOMMENDED":
        return "Run Normalize to auto-fill manifest contract coverage, then re-run validation.";
      case "SUITE_OWNED_PATHS_REQUIRE_SUITE_MODE":
      case "MANIFEST_INTENT_PATH_CONFLICT":
        return "Use suite mode for suite-owned artifacts or adjust intended_install and owned paths.";
      case "COLLISION_FAILSAFE":
        return "File conflicts were found. Choose how conflicts should be handled and regenerate the plan.";
      case "MACOS_JUNK":
        return "Remove macOS temporary files and retry validation.";
      case "WORKSPACE_FILE_MISSING":
        return "Create a VS Code workspace file in the selected target folder, then regenerate the plan.";
      default:
        return null;
    }
  };

  const hasResultError = (value: unknown): boolean => {
    if (!value || typeof value !== "object") {
      return false;
    }

    const candidate = value as {
      error?: unknown;
      ok?: unknown;
      issues?: Array<{ severity?: string }>;
    };

    if (Boolean(candidate.error)) {
      return true;
    }

    if (candidate.ok === false) {
      return true;
    }

    if (Array.isArray(candidate.issues)) {
      return candidate.issues.some((issue) => issue?.severity === "error");
    }

    return false;
  };

  const [step, setStep] = useState<Step>("select");
  const [workspaceProbe, setWorkspaceProbe] = useState<{
    ok: boolean;
    exists?: boolean;
    path?: string;
    error?: string;
    reason?: string;
  } | null>(null);
  const {
    sourcePath,
    targetPath,
    installTargetType,
    globalProfilePath,
    workspaceParentPath,
    collisionStrategy,
    selectedImportCategories,
    selectedImportPaths,
    isBusy,
    pickSource,
    pickTarget,
    pickWorkspaceParent,
    createTrialWorkspace,
    validatePack,
    normalizePack,
    cleanSourceMacOsJunk,
    createTargetWorkspaceFile,
    probeTargetWorkspaceFile,
    installPlan,
    installApply,
    openWorkspaceInFinder,
    lastOutput,
    planOutput,
    installOutput,
    error,
    setInstallTargetType,
    setSelectedImportCategories,
    setSelectedImportPaths,
    setCollisionStrategy,
  } = usePackman();
  const [useFileLevelSelection, setUseFileLevelSelection] = useState(false);

  const steps: Step[] = ["select", "validate", "config", "plan", "install"];
  const currentStepIndex = steps.indexOf(step);

  useEffect(() => {
    if (step === "install") {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#7CFFCB", "#BBA7FF", "#FF4FD8", "#55D7FF"],
        disableForReducedMotion: true,
      });
    }
  }, [step]);

  useEffect(() => {
    if (step !== "install" || !onInstallComplete) {
      return;
    }

    const timeout = window.setTimeout(() => {
      onInstallComplete();
    }, 1400);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [onInstallComplete, step]);

  useEffect(() => {
    if (step !== "plan") {
      return;
    }

    let cancelled = false;
    void (async () => {
      const probe = await probeTargetWorkspaceFile();
      if (!cancelled) {
        setWorkspaceProbe(probe);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [probeTargetWorkspaceFile, step, targetPath]);

  const nextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setStep(steps[currentStepIndex + 1]);
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setStep(steps[currentStepIndex - 1]);
    } else {
      onBack();
    }
  };

  const planCollisions =
    (() => {
      const payload = planOutput as {
        plans?: Array<{ collisions?: unknown[] }>;
        output?: { plans?: Array<{ collisions?: unknown[] }> };
        data?: { plans?: Array<{ collisions?: unknown[] }> };
      } | null;
      const plans =
        payload?.plans ?? payload?.output?.plans ?? payload?.data?.plans;
      return plans?.flatMap((plan) => plan.collisions ?? [])?.length ?? 0;
    })() ?? 0;
  const touchedFiles =
    (() => {
      const payload = installOutput as {
        filesTouched?: string[];
        output?: { filesTouched?: string[] };
        data?: { filesTouched?: string[] };
      } | null;
      const files =
        payload?.filesTouched ??
        payload?.output?.filesTouched ??
        payload?.data?.filesTouched;
      return files?.length ?? 0;
    })() ?? 0;
  const backupZipPath =
    (() => {
      const payload = installOutput as {
        backupZipPath?: string;
        output?: { backupZipPath?: string };
        data?: { backupZipPath?: string };
      } | null;
      return (
        payload?.backupZipPath ??
        payload?.output?.backupZipPath ??
        payload?.data?.backupZipPath ??
        null
      );
    })() ?? null;
  const planReady =
    planOutput !== null &&
    planOutput !== undefined &&
    !hasResultError(planOutput);
  const workspaceUid = getWorkspaceUid(targetPath);
  const effectiveTargetPath =
    installTargetType === "global" ? globalProfilePath : targetPath;
  const shouldOfferMacOsJunkCleanup =
    hasMacOsJunkIssue(lastOutput) || hasMacOsJunkIssue(planOutput);
  const workspaceFileMissingPrompt =
    !!planOutput &&
    typeof planOutput === "object" &&
    (planOutput as { code?: string }).code === "WORKSPACE_FILE_MISSING";
  const sourceLooksLikeCatalogRoot =
    typeof sourcePath === "string" &&
    sourcePath.replace(/\\/g, "/").toLowerCase().endsWith("/packs");
  const validationHasPassed =
    lastOutput !== null &&
    lastOutput !== undefined &&
    !hasResultError(lastOutput) &&
    !hasMacOsJunkIssue(lastOutput);
  const workspaceFileExists =
    workspaceProbe?.ok === true && workspaceProbe.exists === true;
  const plannedRelativePaths =
    (() => {
      const payload = planOutput as {
        plans?: Array<{ operations?: Array<{ relativePath?: string }> }>;
        output?: {
          plans?: Array<{ operations?: Array<{ relativePath?: string }> }>;
        };
        data?: {
          plans?: Array<{ operations?: Array<{ relativePath?: string }> }>;
        };
      } | null;
      const plans =
        payload?.plans ?? payload?.output?.plans ?? payload?.data?.plans ?? [];
      const operationPaths = plans.flatMap((plan) =>
        (plan.operations ?? [])
          .map((operation) => operation.relativePath)
          .filter((value): value is string => typeof value === "string"),
      );
      return [...new Set(operationPaths)];
    })() ?? [];
  const validationIssues = extractIssues(lastOutput);
  const planIssues = extractIssues(planOutput);

  const runIssueQuickAction = async (
    issue: WizardIssue,
    scope: "validate" | "plan",
  ) => {
    if (
      issue.code === "MANIFEST_OWNED_PATHS_COVERAGE" ||
      issue.code === "MANIFEST_OWNED_PATHS_RECOMMENDED" ||
      issue.code === "SUITE_OWNED_PATHS_REQUIRE_SUITE_MODE" ||
      issue.code === "MANIFEST_INTENT_PATH_CONFLICT"
    ) {
      const normalized = await normalizePack();
      const normalizeFailed = hasResultError(normalized);
      if (!normalizeFailed) {
        await validatePack();
      }
      return;
    }

    if (issue.code === "MACOS_JUNK") {
      const cleaned = await cleanSourceMacOsJunk();
      const cleanFailed = hasResultError(cleaned);
      if (!cleanFailed) {
        await validatePack();
      }
      return;
    }

    if (issue.code === "WORKSPACE_FILE_MISSING") {
      const created = await createTargetWorkspaceFile();
      const failed = hasResultError(created);
      if (!failed) {
        const probe = await probeTargetWorkspaceFile();
        setWorkspaceProbe(probe);
        await installPlan();
      }
      return;
    }

    if (scope === "plan") {
      await installPlan();
      return;
    }

    await validatePack();
  };

  const quickActionLabel = (issue: WizardIssue, scope: "validate" | "plan") => {
    if (
      issue.code === "MANIFEST_OWNED_PATHS_COVERAGE" ||
      issue.code === "MANIFEST_OWNED_PATHS_RECOMMENDED" ||
      issue.code === "SUITE_OWNED_PATHS_REQUIRE_SUITE_MODE" ||
      issue.code === "MANIFEST_INTENT_PATH_CONFLICT"
    ) {
      return "Normalize + Revalidate";
    }

    if (issue.code === "MACOS_JUNK") {
      return "Auto-clean + Revalidate";
    }

    if (issue.code === "WORKSPACE_FILE_MISSING") {
      return "Create Workspace File + Retry";
    }

    return scope === "plan" ? "Regenerate Plan" : "Re-run Validation";
  };

  return (
    <PageLayout
      title="Import Pack"
      subtitle="Install a new pack into your workspace."
    >
      {/* Progress / Stepper (Simplified) */}
      <div
        className="flex items-center gap-2 mb-8 text-sm text-text-tertiary"
        data-testid="wizard-stepper"
        data-current-step={step}
        role="status"
        aria-live="polite"
        aria-label={`Import step ${currentStepIndex + 1} of ${steps.length}: ${step}`}
      >
        {steps.map((s, i) => (
          <div
            key={s}
            className={cn(
              "flex items-center gap-2",
              i <= currentStepIndex && "text-brand-primary",
            )}
          >
            <div
              className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center border",
                i < currentStepIndex
                  ? "bg-brand-primary border-brand-primary text-bg-app"
                  : i === currentStepIndex
                    ? "border-brand-primary text-brand-primary"
                    : "border-border-subtle",
              )}
            >
              {i < currentStepIndex ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                i + 1
              )}
            </div>
            <span className="capitalize">{s}</span>
            {i < steps.length - 1 && (
              <div className="w-8 h-[1px] bg-border-subtle" />
            )}
          </div>
        ))}
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="mb-4 flex justify-start">
          <Button
            variant="ghost"
            onClick={prevStep}
            data-testid="wizard-header-back"
            aria-label="Go back"
          >
            ← Back
          </Button>
        </div>

        {error && (
          <div className="sr-only" role="alert" aria-live="assertive">
            {error}
          </div>
        )}

        {/* Step Content */}
        <div className="min-h-[300px] relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ x: 10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -10, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {step === "select" && (
                <div className="space-y-6" data-testid="wizard-step-select">
                  <Card
                    data-testid="wizard-select-source-card"
                    className="border-dashed border-2 p-12 flex flex-col items-center justify-center gap-4 hover:border-brand-primary/50 transition-colors cursor-pointer"
                    onClick={pickSource}
                  >
                    <div className="w-16 h-16 rounded-full bg-bg-elevated flex items-center justify-center text-brand-primary">
                      <FolderOpen className="w-8 h-8" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-medium text-text-primary">
                        Select Pack Folder
                      </h3>
                      <p className="text-text-secondary">
                        Choose a specific pack directory (for example
                        <span className="font-mono">
                          {" "}
                          Packs/copilot-ux-agent-pack
                        </span>
                        ) or a parent catalog that contains multiple packs.
                      </p>
                      <p className="text-text-tertiary text-xs mt-1">
                        Packman can recursively discover pack roots when you
                        select a broader folder.
                      </p>
                    </div>
                  </Card>
                  {sourcePath && (
                    <div
                      className="flex items-center justify-between p-4 bg-bg-elevated rounded-md border border-brand-primary/30"
                      data-testid="wizard-selected-source"
                    >
                      <span className="text-text-primary font-mono text-sm">
                        {sourcePath}
                      </span>
                      <Button
                        size="sm"
                        onClick={nextStep}
                        data-testid="wizard-continue"
                        aria-label="Continue to validation step"
                      >
                        Continue <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  )}
                  <div className="flex justify-start">
                    <Button
                      variant="ghost"
                      onClick={onBack}
                      data-testid="wizard-select-back-home"
                    >
                      Back to Home
                    </Button>
                  </div>
                </div>
              )}

              {step === "validate" && (
                <div className="space-y-6" data-testid="wizard-step-validate">
                  <div className="text-center space-y-4">
                    <h3 className="text-xl font-medium">
                      Validating Pack Structure...
                    </h3>
                    <p className="text-text-secondary">
                      Checking manifest, assets, and integrity.
                    </p>
                  </div>

                  <div className="flex justify-center gap-3">
                    <Button
                      variant="ghost"
                      data-testid="wizard-validate-back"
                      onClick={prevStep}
                    >
                      Back
                    </Button>
                    <Button
                      variant="secondary"
                      data-testid="wizard-run-normalize"
                      onClick={async () => {
                        const normalized = await normalizePack();
                        const normalizeFailed = hasResultError(normalized);
                        if (!normalizeFailed) {
                          await validatePack();
                        }
                      }}
                      isLoading={isBusy}
                    >
                      Normalize Pack
                    </Button>
                    <Button
                      data-testid="wizard-run-validation"
                      onClick={async () => {
                        const result = await validatePack();
                        const hasError = hasResultError(result);
                        if (!hasError) {
                          nextStep();
                        }
                      }}
                      isLoading={isBusy}
                      aria-label="Run pack validation"
                    >
                      Run Validation
                    </Button>
                    {shouldOfferMacOsJunkCleanup && (
                      <Button
                        variant="secondary"
                        data-testid="wizard-auto-clean-macos-junk"
                        onClick={async () => {
                          const cleaned = await cleanSourceMacOsJunk();
                          const cleanFailed = hasResultError(cleaned);
                          if (!cleanFailed) {
                            await validatePack();
                          }
                        }}
                        isLoading={isBusy}
                      >
                        Remove macOS temp files
                      </Button>
                    )}
                  </div>

                  {error && (
                    <div
                      className="mt-4 p-4 bg-status-error/10 border border-status-error/40 rounded-md text-status-error text-sm"
                      data-testid="wizard-validation-error"
                    >
                      {error}
                    </div>
                  )}

                  {lastOutput !== null && lastOutput !== undefined && (
                    <div
                      className="mt-4 p-4 bg-bg-elevated rounded-md font-mono text-xs overflow-auto max-h-60 border border-border-subtle"
                      data-testid="wizard-validation-output"
                    >
                      <pre>{JSON.stringify(lastOutput, null, 2)}</pre>
                    </div>
                  )}

                  {validationIssues.length > 0 && (
                    <div
                      className="mt-4 p-4 rounded-md border border-border-subtle bg-bg-elevated space-y-3"
                      data-testid="wizard-validation-issues"
                    >
                      <p className="text-sm font-medium text-text-primary">
                        Detected Issues
                      </p>
                      <ul className="space-y-2 text-xs">
                        {validationIssues.map((issue, index) => (
                          <li
                            key={`${issue.code}-${index}`}
                            className="rounded border border-border-subtle p-2"
                          >
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-text-primary font-semibold">
                                {issue.code}
                              </span>
                              <span
                                className={cn(
                                  "px-2 py-0.5 rounded text-[10px] uppercase",
                                  issue.severity === "error"
                                    ? "bg-status-error/20 text-status-error"
                                    : issue.severity === "warning"
                                      ? "bg-status-warning/20 text-status-warning"
                                      : "bg-brand-info/20 text-brand-info",
                                )}
                              >
                                {issue.severity}
                              </span>
                            </div>
                            <p className="text-text-secondary mt-1">
                              {issue.message}
                            </p>
                            {issue.path && (
                              <p className="text-text-tertiary mt-1">
                                Path: {issue.path}
                              </p>
                            )}
                            {issueGuidance(issue) && (
                              <p className="text-brand-info mt-1">
                                Next step: {issueGuidance(issue)}
                              </p>
                            )}
                            <div className="mt-2">
                              <Button
                                size="sm"
                                variant="secondary"
                                isLoading={isBusy}
                                onClick={async () => {
                                  await runIssueQuickAction(issue, "validate");
                                }}
                                data-testid={`wizard-issue-action-${issue.code}-${index}`}
                              >
                                {quickActionLabel(issue, "validate")}
                              </Button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {step === "config" && (
                <div className="space-y-6" data-testid="wizard-step-config">
                  <h3 className="text-xl font-medium">
                    Workspace Configuration
                  </h3>
                  <div className="space-y-4">
                    <div className="block space-y-2">
                      <span className="text-text-secondary text-sm">
                        Source Pack Folder
                      </span>
                      <div className="flex gap-2">
                        <Input
                          value={sourcePath ?? ""}
                          readOnly
                          data-testid="wizard-source-workspace"
                        />
                        <Button variant="secondary" onClick={pickSource}>
                          Browse
                        </Button>
                      </div>
                    </div>

                    <label className="block space-y-2">
                      <span className="text-text-secondary text-sm">
                        Install Destination
                      </span>
                      <select
                        className="flex h-9 w-full rounded-md border border-border-subtle bg-bg-elevated px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-info text-text-primary"
                        value={installTargetType}
                        onChange={(event) => {
                          const nextTargetType = event.target.value as
                            | "workspace"
                            | "global";
                          setInstallTargetType(nextTargetType);
                        }}
                        data-testid="wizard-target-type"
                        aria-label="Choose install destination type"
                      >
                        <option value="workspace">Workspace</option>
                        <option value="global">Global Profile</option>
                      </select>
                    </label>

                    <div className="block space-y-2">
                      <span className="text-text-secondary text-sm">
                        {installTargetType === "global"
                          ? "Global Profile Path"
                          : "Target Workspace"}
                      </span>
                      <div className="flex gap-2">
                        <Input
                          value={effectiveTargetPath ?? ""}
                          readOnly
                          data-testid="wizard-target-workspace"
                          aria-label={
                            installTargetType === "global"
                              ? "Selected global profile path"
                              : "Selected target workspace path"
                          }
                        />
                        <Button variant="secondary" onClick={pickTarget}>
                          <FolderOpen className="w-4 h-4 mr-2" />
                          Select
                        </Button>
                      </div>
                    </div>

                    {installTargetType === "workspace" && (
                      <div className="block space-y-2">
                        <span className="text-text-secondary text-sm">
                          Trial Workspace (Recommended)
                        </span>
                        <div className="flex gap-2">
                          <Input
                            value={workspaceParentPath ?? ""}
                            readOnly
                            aria-label="Trial workspace parent path"
                          />
                          <Button
                            variant="secondary"
                            onClick={pickWorkspaceParent}
                            data-testid="wizard-pick-workspace-parent"
                            aria-label="Pick trial workspace parent folder"
                          >
                            <FolderOpen className="w-4 h-4 mr-2" />
                            Parent Folder
                          </Button>
                          <Button
                            variant="primary"
                            onClick={async () => {
                              const created = await createTrialWorkspace();
                              if (created) {
                                nextStep();
                              }
                            }}
                            isLoading={isBusy}
                            data-testid="wizard-create-trial-workspace"
                            aria-label="Create trial workspace and continue"
                          >
                            <FolderPlus className="w-4 h-4 mr-2" />
                            Create Trial & Continue
                          </Button>
                        </div>
                        <p className="text-xs text-text-tertiary">
                          Create a clean workspace target and continue directly
                          to plan generation.
                        </p>
                      </div>
                    )}

                    <fieldset className="block space-y-2">
                      <legend className="text-text-secondary text-sm">
                        Import Categories
                      </legend>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {AVAILABLE_IMPORT_CATEGORIES.map((category) => {
                          const checked =
                            selectedImportCategories.includes(category);
                          return (
                            <label
                              key={category}
                              className="flex items-center gap-2 rounded-md border border-border-subtle bg-bg-elevated px-2 py-1 text-xs text-text-primary"
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(event) => {
                                  const isChecked = event.target.checked;
                                  if (isChecked) {
                                    setSelectedImportCategories([
                                      ...selectedImportCategories,
                                      category,
                                    ]);
                                    return;
                                  }

                                  setSelectedImportCategories(
                                    selectedImportCategories.filter(
                                      (value) => value !== category,
                                    ),
                                  );
                                }}
                                aria-label={`Include ${category} category`}
                              />
                              <span className="capitalize">{category}</span>
                            </label>
                          );
                        })}
                      </div>
                    </fieldset>

                    <label className="block space-y-2">
                      <span className="text-text-secondary text-sm">
                        File Conflict Handling
                      </span>
                      <select
                        className="flex h-9 w-full rounded-md border border-border-subtle bg-bg-elevated px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-info text-text-primary"
                        data-testid="wizard-collision-strategy"
                        value={collisionStrategy}
                        onChange={(event) =>
                          setCollisionStrategy(
                            event.target.value as
                              | "fail"
                              | "skip"
                              | "overwrite"
                              | "rename",
                          )
                        }
                      >
                        <option value="fail">Stop and ask me to resolve</option>
                        <option value="skip">Keep existing file</option>
                        <option value="overwrite">Replace existing file</option>
                        <option value="rename">
                          Keep both (rename incoming)
                        </option>
                      </select>
                    </label>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      onClick={prevStep}
                      data-testid="wizard-config-back"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={nextStep}
                      data-testid="wizard-config-next"
                      disabled={!sourcePath}
                    >
                      Next: Dry Run
                    </Button>
                  </div>
                </div>
              )}

              {step === "plan" && (
                <div className="space-y-6" data-testid="wizard-step-plan">
                  <h3 className="text-xl font-medium">Installation Plan</h3>
                  <Card data-testid="wizard-plan-summary">
                    <CardContent className="p-6 space-y-4">
                      <div className="rounded-md border border-border-subtle p-3 bg-bg-elevated space-y-2">
                        <p className="text-sm text-text-primary font-medium">
                          Readiness Checklist
                        </p>
                        <ul className="space-y-1 text-xs text-text-secondary">
                          <li>
                            {sourcePath
                              ? sourceLooksLikeCatalogRoot
                                ? "✔ Source is catalog root (recursive pack discovery mode)."
                                : "✔ Source pack folder selected."
                              : "✖ Source pack folder not selected."}
                          </li>
                          <li>
                            {validationHasPassed
                              ? "✔ Validation passed (including manifest ownership checks when present)."
                              : "✖ Validation not complete or has blocking issues."}
                          </li>
                          <li>
                            {effectiveTargetPath
                              ? installTargetType === "global"
                                ? "✔ Global profile target selected."
                                : "✔ Target workspace selected/seeded."
                              : installTargetType === "global"
                                ? "ℹ Global profile target not selected. Packman will use the default profile path."
                                : "ℹ Target not selected (Packman will auto-seed one)."}
                          </li>
                          <li>
                            {workspaceProbe === null
                              ? "ℹ Checking workspace file..."
                              : installTargetType === "global"
                                ? "✔ Global profile target selected (workspace file not required)."
                                : workspaceFileExists
                                  ? "✔ VS Code workspace file detected."
                                  : workspaceProbe?.reason === "NO_TARGET"
                                    ? "ℹ Workspace file check deferred until target exists."
                                    : workspaceProbe?.ok === false
                                      ? `✖ Workspace file check failed: ${workspaceProbe.error ?? "unknown error"}`
                                      : "✖ No VS Code workspace file found in the target folder."}
                          </li>
                        </ul>
                        {!validationHasPassed && (
                          <div className="flex gap-2 pt-1">
                            <Button
                              variant="secondary"
                              size="sm"
                              isLoading={isBusy}
                              onClick={async () => {
                                const normalized = await normalizePack();
                                const normalizeFailed =
                                  hasResultError(normalized);
                                if (!normalizeFailed) {
                                  await validatePack();
                                }
                              }}
                              data-testid="wizard-checklist-run-normalize"
                            >
                              Normalize Pack
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              isLoading={isBusy}
                              onClick={async () => {
                                await validatePack();
                              }}
                              data-testid="wizard-checklist-run-validation"
                            >
                              Run Validation
                            </Button>
                            {shouldOfferMacOsJunkCleanup && (
                              <Button
                                variant="secondary"
                                size="sm"
                                isLoading={isBusy}
                                onClick={async () => {
                                  const cleaned = await cleanSourceMacOsJunk();
                                  const cleanFailed = hasResultError(cleaned);
                                  if (!cleanFailed) {
                                    await validatePack();
                                  }
                                }}
                                data-testid="wizard-checklist-auto-clean"
                              >
                                Remove macOS temp files
                              </Button>
                            )}
                          </div>
                        )}
                        {installTargetType === "workspace" &&
                          workspaceProbe !== null &&
                          workspaceProbe.ok &&
                          !workspaceProbe.exists &&
                          workspaceProbe.reason !== "NO_TARGET" && (
                            <div className="pt-1">
                              <Button
                                variant="secondary"
                                size="sm"
                                isLoading={isBusy}
                                onClick={async () => {
                                  const created =
                                    await createTargetWorkspaceFile();
                                  const failed = hasResultError(created);
                                  if (!failed) {
                                    const probe =
                                      await probeTargetWorkspaceFile();
                                    setWorkspaceProbe(probe);
                                  }
                                }}
                                data-testid="wizard-checklist-create-workspace-file"
                              >
                                Create VS Code Workspace File
                              </Button>
                            </div>
                          )}
                      </div>

                      {installTargetType === "global" && (
                        <div className="rounded-md border border-border-subtle p-3 bg-bg-elevated space-y-2">
                          <p className="text-sm text-text-primary font-medium">
                            Global Destination Preview
                          </p>
                          <p className="text-xs text-text-secondary">
                            Selected categories install into these profile
                            locations.
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                            {selectedImportCategories.map((category) => (
                              <div
                                key={category}
                                className="rounded border border-border-subtle p-2 bg-bg-panel"
                              >
                                <p className="text-text-primary capitalize">
                                  {category}
                                </p>
                                <p className="text-text-tertiary font-mono break-all">
                                  {GLOBAL_CATEGORY_DESTINATIONS[category] ??
                                    "(auto)"}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-4">
                        <div className="text-text-secondary text-sm">
                          Generate a dry-run plan to preview changes before
                          installation.
                        </div>
                        <Button
                          variant="secondary"
                          onClick={installPlan}
                          isLoading={isBusy}
                          data-testid="wizard-generate-plan"
                        >
                          <WandSparkles className="w-4 h-4 mr-2" />
                          Generate Plan
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="rounded-md border border-border-subtle p-3 bg-bg-elevated">
                          <p className="text-xs text-text-tertiary">Target</p>
                          <p className="text-sm text-text-primary break-all">
                            {effectiveTargetPath ?? "Not selected"}
                          </p>
                        </div>
                        <div className="rounded-md border border-border-subtle p-3 bg-bg-elevated">
                          <p className="text-xs text-text-tertiary">
                            Collision Mode
                          </p>
                          <p className="text-sm text-text-primary uppercase">
                            {collisionStrategy}
                          </p>
                        </div>
                        <div className="rounded-md border border-border-subtle p-3 bg-bg-elevated">
                          <p className="text-xs text-text-tertiary">
                            Plan Collisions
                          </p>
                          <p className="text-sm text-text-primary">
                            {planCollisions}
                          </p>
                        </div>
                      </div>

                      {!effectiveTargetPath && (
                        <div
                          className="p-3 rounded-md border border-brand-info/30 bg-brand-info/10 text-brand-info text-sm"
                          data-testid="wizard-seeded-target-hint"
                        >
                          {installTargetType === "global"
                            ? "No global profile path selected. Packman will use the default profile location for this platform."
                            : "No target selected. Packman will create a seeded trial workspace automatically when you generate a plan or execute install."}
                        </div>
                      )}

                      {planOutput !== null && planOutput !== undefined && (
                        <pre className="text-xs overflow-auto max-h-60 rounded-md border border-border-subtle p-3 bg-bg-elevated">
                          {JSON.stringify(planOutput, null, 2)}
                        </pre>
                      )}

                      {plannedRelativePaths.length > 0 && (
                        <div className="rounded-md border border-border-subtle p-3 bg-bg-elevated space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium text-text-primary">
                              File-level Selection
                            </p>
                            <label className="text-xs text-text-secondary flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={useFileLevelSelection}
                                onChange={(event) => {
                                  const enabled = event.target.checked;
                                  setUseFileLevelSelection(enabled);
                                  if (!enabled) {
                                    setSelectedImportPaths([]);
                                  } else {
                                    setSelectedImportPaths(
                                      plannedRelativePaths,
                                    );
                                  }
                                }}
                                aria-label="Enable file-level selection"
                              />
                              Choose individual files
                            </label>
                          </div>
                          {useFileLevelSelection && (
                            <div className="max-h-40 overflow-auto grid grid-cols-1 md:grid-cols-2 gap-1">
                              {plannedRelativePaths.map((relativePath) => {
                                const checked =
                                  selectedImportPaths.includes(relativePath);
                                return (
                                  <label
                                    key={relativePath}
                                    className="flex items-center gap-2 text-xs text-text-secondary"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={(event) => {
                                        setSelectedImportPaths((previous) => {
                                          if (event.target.checked) {
                                            return [...previous, relativePath];
                                          }
                                          return previous.filter(
                                            (value) => value !== relativePath,
                                          );
                                        });
                                      }}
                                      aria-label={`Include file ${relativePath}`}
                                    />
                                    <span className="font-mono break-all">
                                      {relativePath}
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}

                      {planIssues.length > 0 && (
                        <div
                          className="rounded-md border border-border-subtle p-3 bg-bg-elevated space-y-2"
                          data-testid="wizard-plan-issues"
                        >
                          <p className="text-sm font-medium text-text-primary">
                            Plan Issues
                          </p>
                          <ul className="space-y-2 text-xs">
                            {planIssues.map((issue, index) => (
                              <li
                                key={`${issue.code}-${index}`}
                                className="rounded border border-border-subtle p-2"
                              >
                                <p className="text-text-primary font-semibold">
                                  {issue.code}
                                </p>
                                <p className="text-text-secondary">
                                  {issue.message}
                                </p>
                                {issueGuidance(issue) && (
                                  <p className="text-brand-info mt-1">
                                    Next step: {issueGuidance(issue)}
                                  </p>
                                )}
                                <div className="mt-2">
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    isLoading={isBusy}
                                    onClick={async () => {
                                      await runIssueQuickAction(issue, "plan");
                                    }}
                                    data-testid={`wizard-plan-issue-action-${issue.code}-${index}`}
                                  >
                                    {quickActionLabel(issue, "plan")}
                                  </Button>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {workspaceFileMissingPrompt && (
                        <div className="p-3 rounded-md border border-status-warning/40 bg-status-warning/10 text-sm text-text-primary space-y-2">
                          <p>
                            No workspace file was found in the selected target.
                            Create a fresh VS Code workspace file now?
                          </p>
                          <div>
                            <Button
                              variant="secondary"
                              data-testid="wizard-create-workspace-file"
                              isLoading={isBusy}
                              onClick={async () => {
                                const created =
                                  await createTargetWorkspaceFile();
                                const failed = hasResultError(created);
                                if (!failed) {
                                  await installPlan();
                                }
                              }}
                            >
                              Create Workspace File & Retry Plan
                            </Button>
                          </div>
                        </div>
                      )}

                      {error && (
                        <div
                          className="p-3 bg-status-error/10 border border-status-error/40 rounded-md text-status-error text-sm"
                          data-testid="wizard-plan-error"
                        >
                          {error}
                        </div>
                      )}

                      <div className="p-3 rounded-md border border-border-subtle bg-bg-elevated text-xs text-text-secondary space-y-1">
                        <p className="text-text-primary font-medium">
                          Common snags and quick fixes
                        </p>
                        <p>
                          • Large source catalogs can slow validation and
                          planning. Selecting a specific pack folder is faster.
                        </p>
                        <p>
                          • If planning fails, ensure the target has a
                          `.code-workspace` file.
                        </p>
                        <p>
                          • If validation reports macOS junk files, remove temp
                          files and run validation again.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      onClick={prevStep}
                      data-testid="wizard-plan-back"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={async () => {
                        const result = await installApply();
                        const hasError = hasResultError(result);
                        if (!hasError) {
                          nextStep();
                        }
                      }}
                      variant="primary"
                      data-testid="wizard-execute-install"
                      disabled={!planReady}
                    >
                      Execute and Install
                    </Button>
                  </div>
                </div>
              )}

              {step === "install" && (
                <div
                  className="space-y-6 text-center py-12"
                  data-testid="wizard-step-install"
                >
                  <div className="w-16 h-16 rounded-full bg-status-success/20 text-status-success flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold">Installation Complete!</h3>
                  <p className="text-text-secondary">
                    Pack has been installed into your
                    {installTargetType === "global"
                      ? " global profile."
                      : " target workspace."}
                  </p>
                  <div
                    role="status"
                    aria-live="polite"
                    className="text-xs text-text-tertiary"
                  >
                    Successfully imported. Redirecting you now.
                  </div>

                  <div className="mx-auto max-w-2xl text-left rounded-md border border-border-subtle p-4 bg-bg-elevated">
                    <p className="text-sm text-text-secondary">
                      {installTargetType === "global"
                        ? "Global profile target"
                        : "Target workspace"}
                    </p>
                    <p className="text-sm text-text-primary break-all">
                      {effectiveTargetPath ?? "Unknown"}
                    </p>
                    <p className="mt-2 text-sm text-text-secondary">
                      Files touched: {touchedFiles}
                    </p>
                    <p className="mt-2 text-xs text-text-tertiary">
                      Workspace UID: {workspaceUid ?? "n/a"}
                    </p>
                    {backupZipPath && (
                      <p className="mt-2 text-xs text-text-tertiary break-all">
                        Safety backup: {backupZipPath}
                      </p>
                    )}
                  </div>

                  <div className="mx-auto max-w-2xl text-left rounded-md border border-brand-info/30 p-4 bg-brand-info/10 space-y-2">
                    <p className="text-sm font-medium text-text-primary">
                      What to do next
                    </p>
                    <ul className="text-sm text-text-secondary list-disc pl-5 space-y-1">
                      <li>
                        {installTargetType === "global"
                          ? "Open the profile folder to review installed files."
                          : "Open the target workspace in VS Code."}
                      </li>
                      <li>
                        Check installed artifacts under `.github`, `.claude`,
                        `.agents`, and `.vscode` in that target.
                      </li>
                      <li>
                        If VS Code was already open, reload the window once so
                        new prompts/instructions are picked up.
                      </li>
                      {backupZipPath && (
                        <li>
                          Keep the backup ZIP until you verify behavior, then
                          remove old backups when no longer needed.
                        </li>
                      )}
                    </ul>
                  </div>

                  {installOutput !== null && installOutput !== undefined && (
                    <pre className="mx-auto max-w-2xl text-xs overflow-auto max-h-60 rounded-md border border-border-subtle p-3 bg-bg-elevated">
                      {JSON.stringify(installOutput, null, 2)}
                    </pre>
                  )}

                  {error && (
                    <div
                      className="mx-auto max-w-2xl p-3 bg-status-error/10 border border-status-error/40 rounded-md text-status-error text-sm"
                      data-testid="wizard-install-error"
                    >
                      {error}
                    </div>
                  )}

                  <div className="pt-8 flex justify-center gap-4">
                    <Button
                      variant="secondary"
                      onClick={() => onBack()}
                      data-testid="wizard-back-home"
                    >
                      Back to Home
                    </Button>
                    <Button
                      onClick={() => {
                        if (effectiveTargetPath) {
                          void openWorkspaceInFinder(effectiveTargetPath);
                        }
                      }}
                      disabled={!effectiveTargetPath}
                      data-testid="wizard-open-workspace"
                    >
                      {installTargetType === "global"
                        ? "Open Profile Folder"
                        : "Open in VS Code"}
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </PageLayout>
  );
}
