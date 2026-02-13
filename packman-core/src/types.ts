export type Severity = "error" | "warning" | "info";

export interface Issue {
  severity: Severity;
  code: string;
  message: string;
  path?: string;
  details?: Record<string, unknown>;
}

export interface Artifact {
  type:
    | "prompt"
    | "instruction"
    | "agent"
    | "skill"
    | "copilotInstructions"
    | "settings"
    | "manifest";
  absolutePath: string;
  relativePath: string;
}

export interface FrontmatterData {
  name?: string;
  description?: string;
  agent?: string;
  tools?: string[];
  applyTo?: string;
  [key: string]: unknown;
}

export interface ParsedArtifact extends Artifact {
  frontmatter?: FrontmatterData;
  body?: string;
  raw?: string;
  parseError?: string;
}

export interface PackDetection {
  rootPath: string;
  artifacts: Artifact[];
  isPack: boolean;
  manifestPath?: string;
}

export interface ValidationOptions {
  strict?: boolean;
  targetPathForCollisionScan?: string;
  suiteMode?: boolean;
  allowedSubagents?: string[];
}

export interface ValidationResult {
  ok: boolean;
  issues: Issue[];
  parsedArtifacts: ParsedArtifact[];
  elapsedMs: number;
}

export interface NormalizeOptions {
  apply?: boolean;
  autoPrefixNamespaces?: boolean;
}

export interface FileChange {
  action: "create" | "update" | "rename";
  fromPath?: string;
  toPath: string;
  before?: string;
  after?: string;
}

export interface NormalizeResult {
  ok: boolean;
  issues: Issue[];
  changes: FileChange[];
  elapsedMs: number;
}

export interface ReadmeSyncResult {
  ok: boolean;
  issues: Issue[];
  changes: FileChange[];
  packRoots: string[];
  elapsedMs: number;
}

export interface InstallOptions {
  targetPath: string;
  targetType: "workspace" | "global";
  dryRun?: boolean;
  suite?: boolean;
  collisionStrategy?: "fail" | "skip" | "overwrite" | "rename";
  collisionDecisions?: Record<string, "fail" | "skip" | "overwrite" | "rename">;
  autoCleanMacOSJunk?: boolean;
}

export interface InstallCollision {
  relativePath: string;
  sourcePath: string;
  targetPath: string;
  sourcePreview: string;
  targetPreview: string;
  availableActions: Array<"skip" | "overwrite" | "rename">;
}

export interface InstallPlannedOperation {
  action: "create" | "update" | "merge" | "skip";
  relativePath: string;
  reason?: string;
}

export interface InstallPlan {
  sourceRoot: string;
  targetRoot: string;
  operations: InstallPlannedOperation[];
  collisions: InstallCollision[];
}

export interface InstallResult {
  ok: boolean;
  issues: Issue[];
  filesTouched: string[];
  backupZipPath?: string;
  plans?: InstallPlan[];
  elapsedMs: number;
}

export interface DoctorResult {
  ok: boolean;
  issues: Issue[];
  recommendations: string[];
  elapsedMs: number;
}

export interface RegistryResult {
  ok: boolean;
  registryJsonPath: string;
  registryMdPath: string;
  elapsedMs: number;
}

export interface ReadinessResult {
  ok: boolean;
  issues: Issue[];
  proposedPatch: Record<string, unknown>;
  elapsedMs: number;
}

export interface OperationReport<TPayload> {
  operation: string;
  startedAt: string;
  elapsedMs: number;
  input: Record<string, unknown>;
  output: TPayload;
  issues: Issue[];
}
