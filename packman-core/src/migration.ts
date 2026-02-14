import path from "node:path";
import { promises as fs } from "node:fs";
import fg from "fast-glob";
import { exists, readText, writeText } from "./fs-utils.js";
import type {
  ApplyMigrationOptions,
  ApplyMigrationResult,
  Finding,
  Issue,
  MigrationAction,
  MigrationPlan,
} from "./types.js";

function toPosix(input: string): string {
  return input.split(path.sep).join("/");
}

function csvEscape(value: string): string {
  if (value.includes(",") || value.includes("\n") || value.includes('"')) {
    return `"${value.replaceAll('"', '""')}"`;
  }
  return value;
}

function makeIssue(
  severity: Issue["severity"],
  code: string,
  message: string,
  filePath?: string,
): Issue {
  return {
    severity,
    code,
    message,
    path: filePath,
  };
}

function classifyContentFinding(filePath: string, content: string): Finding[] {
  const findings: Finding[] = [];
  const frontmatterSeparators = content.match(/^---\s*$/gm)?.length ?? 0;
  if (frontmatterSeparators >= 4) {
    findings.push({
      code: "MULTI_UNIT_FILE",
      path: filePath,
      severity: "warning",
      message: "File appears to contain multiple units and should be split",
      confidence: "medium",
      details: { frontmatterSeparators },
    });
  }

  if (
    /(definition of done|always-on|repository instructions|non-negotiables)/i.test(
      content,
    )
  ) {
    findings.push({
      code: "STANDARDS_EMBEDDED",
      path: filePath,
      severity: "info",
      message:
        "Repository-level standards appear embedded; consider extraction to copilot-instructions",
      confidence: "low",
    });
  }

  return findings;
}

function extractProcedureSignature(content: string): string | undefined {
  const lines = content
    .split(/\r?\n/g)
    .map((line) => line.trim())
    .filter(Boolean);
  const bullets = lines.filter((line) => line.startsWith("- "));
  if (bullets.length < 3) return undefined;
  return bullets.slice(0, 6).join("|").toLowerCase();
}

export async function analyzeRepo(rootPath: string): Promise<Finding[]> {
  const patterns = [
    "agents/**/*.agent.md",
    "prompts/**/*.prompt.md",
    "instructions/**/*.instructions.md",
    ".github/agents/**/*.agent.md",
    ".github/prompts/**/*.prompt.md",
    ".github/instructions/**/*.instructions.md",
  ];

  const files = await fg(patterns, {
    cwd: rootPath,
    absolute: true,
    dot: true,
    onlyFiles: true,
  });

  const findings: Finding[] = [];
  const procedureSignatures = new Map<string, string[]>();

  for (const absolutePath of files.sort((left, right) => left.localeCompare(right))) {
    const relativePath = toPosix(path.relative(rootPath, absolutePath));
    const content = await readText(absolutePath);
    findings.push(...classifyContentFinding(relativePath, content));

    const signature = extractProcedureSignature(content);
    if (signature) {
      const owners = procedureSignatures.get(signature) ?? [];
      owners.push(relativePath);
      procedureSignatures.set(signature, owners);
    }
  }

  for (const [signature, owners] of procedureSignatures.entries()) {
    if (owners.length < 2) continue;
    for (const owner of owners) {
      findings.push({
        code: "DUPLICATED_PROCEDURE",
        path: owner,
        severity: "info",
        message:
          "Reusable procedure appears duplicated across files; consider extracting to a skill",
        confidence: "medium",
        details: {
          duplicateCount: owners.length,
          signature,
        },
      });
    }
  }

  return findings.sort((left, right) => {
    const byPath = left.path.localeCompare(right.path);
    if (byPath !== 0) return byPath;
    return left.code.localeCompare(right.code);
  });
}

function findingToAction(finding: Finding): MigrationAction {
  if (finding.code === "MULTI_UNIT_FILE") {
    return {
      oldPath: finding.path,
      newPath: finding.path,
      action: "split",
      notes: "Split overloaded file into one unit per file (manual confirmation required)",
    };
  }

  if (finding.code === "STANDARDS_EMBEDDED") {
    return {
      oldPath: finding.path,
      newPath: "instructions/copilot-instructions.md",
      action: "extract-instruction",
      notes:
        "Extract stable repo-wide standards into copilot-instructions and keep agent/prompt focused",
    };
  }

  if (finding.code === "DUPLICATED_PROCEDURE") {
    return {
      oldPath: finding.path,
      newPath: "skills/<new-skill>/SKILL.md",
      action: "extract-skill",
      notes: "Promote duplicated procedures/checklists to a reusable skill",
    };
  }

  return {
    oldPath: finding.path,
    newPath: finding.path,
    action: "manual-review",
    notes: finding.message,
  };
}

export function planMigration(findings: Finding[]): MigrationPlan {
  const actions = findings.map(findingToAction);

  const lines: string[] = [];
  lines.push("# REORG_PLAN");
  lines.push("");
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push("");
  lines.push("## Findings");
  lines.push("");
  if (findings.length === 0) {
    lines.push("- No migration findings detected.");
  } else {
    for (const finding of findings) {
      lines.push(
        `- [${finding.severity}] ${finding.code} — ${finding.path} (${finding.confidence})`,
      );
      lines.push(`  - ${finding.message}`);
    }
  }
  lines.push("");
  lines.push("## Planned actions");
  lines.push("");
  lines.push("| old_path | new_path | action | notes |");
  lines.push("|---|---|---|---|");
  for (const action of actions) {
    lines.push(
      `| ${action.oldPath} | ${action.newPath} | ${action.action} | ${action.notes} |`,
    );
  }

  const csvLines = ["old_path,new_path,action,notes"];
  for (const action of actions) {
    csvLines.push(
      [action.oldPath, action.newPath, action.action, action.notes]
        .map(csvEscape)
        .join(","),
    );
  }

  return {
    findings,
    actions,
    reorgPlanMarkdown: `${lines.join("\n")}\n`,
    migrationMapCsv: `${csvLines.join("\n")}\n`,
  };
}

async function backupSources(
  rootPath: string,
  actions: MigrationAction[],
): Promise<string | undefined> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupRoot = path.join(rootPath, ".packman-migration-backup", timestamp);
  await fs.mkdir(backupRoot, { recursive: true });

  const copied: string[] = [];
  for (const action of actions) {
    const sourceAbsolute = path.join(rootPath, action.oldPath);
    if (!(await exists(sourceAbsolute))) continue;
    const targetAbsolute = path.join(backupRoot, action.oldPath);
    await fs.mkdir(path.dirname(targetAbsolute), { recursive: true });
    await fs.copyFile(sourceAbsolute, targetAbsolute);
    copied.push(action.oldPath);
  }

  await writeText(
    path.join(backupRoot, "backup-manifest.json"),
    `${JSON.stringify({ copied }, null, 2)}\n`,
  );

  return toPosix(path.relative(rootPath, backupRoot));
}

export async function applyMigration(
  plan: MigrationPlan,
  options: ApplyMigrationOptions,
): Promise<ApplyMigrationResult> {
  const dryRun = options.dryRun ?? true;
  const backup = options.backup ?? false;
  const rootPath = options.rootPath;
  const issues: Issue[] = [];
  const filesWritten: string[] = [];

  let backupPath: string | undefined;
  if (!dryRun && backup) {
    backupPath = await backupSources(rootPath, plan.actions);
  }

  if (!dryRun) {
    const reorgPlanPath = path.join(rootPath, "REORG_PLAN.md");
    const migrationCsvPath = path.join(rootPath, "MIGRATION_MAP.csv");
    await writeText(reorgPlanPath, plan.reorgPlanMarkdown);
    await writeText(migrationCsvPath, plan.migrationMapCsv);
    filesWritten.push(
      toPosix(path.relative(rootPath, reorgPlanPath)),
      toPosix(path.relative(rootPath, migrationCsvPath)),
    );

    for (const action of plan.actions) {
      if (action.action !== "manual-review") {
        issues.push(
          makeIssue(
            "info",
            "MIGRATION_ACTION_PENDING",
            `Planned action '${action.action}' requires explicit manual or future automated handler`,
            action.oldPath,
          ),
        );
      }
    }
  } else {
    issues.push(
      makeIssue(
        "info",
        "MIGRATION_DRY_RUN",
        "Dry-run enabled; no files were changed",
      ),
    );
  }

  return {
    ok: !issues.some((entry) => entry.severity === "error"),
    dryRun,
    backupPath,
    filesWritten,
    issues,
  };
}
