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
  | "alwaysOnInstruction"
  | "settings"
  | "hookConfig"
  | "mcpConfig"
  | "manifest";
  absolutePath: string;
  relativePath: string;
}

export interface FrontmatterData {
  name?: string;
  description?: string;
  agent?: string;
  tools?: string[] | string;
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
  validationReport?: string;
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
  includeCategories?: ImportCategory[];
  includePaths?: string[];
}

export type ImportCategory =
  | "agents"
  | "prompts"
  | "instructions"
  | "skills"
  | "settings"
  | "hooks"
  | "mcp"
  | "alwaysOn"
  | "manifest"
  | "readme";

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

export type ItemType =
  | "agent"
  | "prompt"
  | "instruction"
  | "skill"
  | "copilotInstructions";

export interface Item {
  type: ItemType;
  sourcePath: string;
  name: string;
  frontmatter?: FrontmatterData;
}

export interface Skill {
  name: string;
  rootPath: string;
  skillPath: string;
  assetPaths: string[];
}

export interface Collection {
  id: string;
  name: string;
  maturity: string;
  tags: string[];
  intendedStacks: string[];
  packRoots: string[];
  collections: string[];
  sourcePath?: string;
}

export interface RegistryGraph {
  rootPath: string;
  items: Item[];
  skills: Skill[];
  collections: Collection[];
  plugins: Collection;
  issues: Issue[];
}

export interface CollectionSchemaValidation {
  ok: boolean;
  collection?: Collection;
  issues: Issue[];
}

export interface RegistryGraphOptions {
  layout?: "canonical" | "workspace";
  includePluginsCollection?: boolean;
  strictCollections?: boolean;
}

export type ExportTarget = "workspace" | "profile";

export interface ExportManifestEntry {
  sourcePath: string;
  targetPath: string;
  itemType: ItemType | "skillAsset";
}

export interface ExportManifest {
  target: ExportTarget;
  collection?: string;
  entries: ExportManifestEntry[];
  collisions: Issue[];
}

export interface ExportBuilderOptions {
  includeCopilotInstructions?: boolean;
  collisionPolicy?: "error" | "first" | "last";
}

export interface Finding {
  code:
  | "MULTI_UNIT_FILE"
  | "STANDARDS_EMBEDDED"
  | "DUPLICATED_PROCEDURE"
  | "MANUAL_REVIEW";
  path: string;
  severity: Severity;
  message: string;
  confidence: "high" | "medium" | "low";
  details?: Record<string, unknown>;
}

export interface MigrationAction {
  oldPath: string;
  newPath: string;
  action: "split" | "extract-instruction" | "extract-skill" | "manual-review" | "keep";
  notes: string;
}

export interface MigrationPlan {
  findings: Finding[];
  actions: MigrationAction[];
  reorgPlanMarkdown: string;
  migrationMapCsv: string;
}

export interface ApplyMigrationOptions {
  rootPath: string;
  dryRun?: boolean;
  backup?: boolean;
}

export interface ApplyMigrationResult {
  ok: boolean;
  dryRun: boolean;
  backupPath?: string;
  filesWritten: string[];
  issues: Issue[];
}

export interface ValidationGateResult {
  id: "gate1" | "gate2" | "gate3" | "gate4" | "gate5";
  name: string;
  pass: boolean;
  details: string[];
}

export interface ValidationGateReport {
  ok: boolean;
  gates: ValidationGateResult[];
}
