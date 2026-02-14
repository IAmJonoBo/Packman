import type {
  ExportManifest,
  Item,
  RegistryGraph,
  ValidationGateReport,
  ValidationGateResult,
} from "./types.js";

function isSorted(values: string[]): boolean {
  for (let index = 1; index < values.length; index += 1) {
    if (values[index - 1].localeCompare(values[index]) > 0) {
      return false;
    }
  }
  return true;
}

function validateItemShape(item: Item): string[] {
  const details: string[] = [];
  if (item.type === "agent" && !item.sourcePath.endsWith(".agent.md")) {
    details.push(`Agent item has invalid extension: ${item.sourcePath}`);
  }
  if (item.type === "prompt" && !item.sourcePath.endsWith(".prompt.md")) {
    details.push(`Prompt item has invalid extension: ${item.sourcePath}`);
  }
  if (
    item.type === "instruction" &&
    !item.sourcePath.endsWith(".instructions.md")
  ) {
    details.push(`Instruction item has invalid extension: ${item.sourcePath}`);
  }
  if (item.type === "skill" && !item.sourcePath.endsWith("/SKILL.md")) {
    details.push(`Skill item has invalid SKILL path: ${item.sourcePath}`);
  }

  if (
    ["agent", "prompt", "instruction", "skill"].includes(item.type) &&
    (!item.frontmatter || typeof item.frontmatter !== "object")
  ) {
    details.push(`Missing frontmatter metadata for ${item.type}: ${item.sourcePath}`);
  }

  return details;
}

function validateManifestShape(manifest: ExportManifest): string[] {
  const details: string[] = [];
  for (const entry of manifest.entries) {
    if (manifest.target === "workspace") {
      if (
        !entry.targetPath.startsWith(".github/agents/") &&
        !entry.targetPath.startsWith(".github/prompts/") &&
        !entry.targetPath.startsWith(".github/instructions/") &&
        !entry.targetPath.startsWith(".github/skills/") &&
        entry.targetPath !== ".github/copilot-instructions.md"
      ) {
        details.push(
          `Workspace export has invalid target path '${entry.targetPath}'`,
        );
      }
    } else if (
      !entry.targetPath.startsWith("agents/") &&
      !entry.targetPath.startsWith("prompts/") &&
      !entry.targetPath.startsWith("instructions/") &&
      !entry.targetPath.startsWith("skills/")
    ) {
      details.push(`Profile export has invalid target path '${entry.targetPath}'`);
    }
  }

  const orderedTargetPaths = manifest.entries.map((entry) => entry.targetPath);
  if (!isSorted(orderedTargetPaths)) {
    details.push(`Export '${manifest.target}' entries are not stably sorted`);
  }

  return details;
}

export function evaluateValidationGates(
  registry: RegistryGraph,
  manifests: ExportManifest[],
): ValidationGateReport {
  const gate1Details: string[] = [];
  for (const issue of registry.issues) {
    if (
      issue.code === "COLLECTION_REFERENCE_MISSING" ||
      issue.code === "COLLECTION_ID_DUPLICATE" ||
      issue.code === "COLLECTION_DESCRIPTOR_MISSING" ||
      issue.code === "COLLECTION_JSON_PARSE_FAILED" ||
      issue.code === "COLLECTION_PACKROOTS_REQUIRED" ||
      issue.code === "COLLECTION_ID_REQUIRED"
    ) {
      gate1Details.push(`${issue.code}: ${issue.message}`);
    }
  }

  const gate2Details: string[] = [];
  for (const manifest of manifests) {
    for (const collision of manifest.collisions) {
      if (collision.code === "EXPORT_TARGET_COLLISION") {
        gate2Details.push(collision.message);
      }
    }
  }

  const gate3Details: string[] = [];
  for (const skill of registry.skills) {
    if (!skill.skillPath.endsWith("/SKILL.md")) {
      gate3Details.push(`Skill missing SKILL.md: ${skill.skillPath}`);
    }
  }

  const gate4Details = registry.items.flatMap(validateItemShape);

  const gate5Details = manifests.flatMap(validateManifestShape);

  const gates: ValidationGateResult[] = [
    {
      id: "gate1",
      name: "All collection references resolve; no broken links",
      pass: gate1Details.length === 0,
      details: gate1Details,
    },
    {
      id: "gate2",
      name: "No filename collisions within export target",
      pass: gate2Details.length === 0,
      details: gate2Details,
    },
    {
      id: "gate3",
      name: "Every skill folder has SKILL.md",
      pass: gate3Details.length === 0,
      details: gate3Details,
    },
    {
      id: "gate4",
      name: "Items match extension/type and frontmatter requirements",
      pass: gate4Details.length === 0,
      details: gate4Details,
    },
    {
      id: "gate5",
      name: "Exports match expected shape and stable deterministic ordering",
      pass: gate5Details.length === 0,
      details: gate5Details,
    },
  ];

  return {
    ok: gates.every((gate) => gate.pass),
    gates,
  };
}

export function renderValidationReport(
  report: ValidationGateReport,
  manifests: ExportManifest[],
): string {
  const lines: string[] = [];
  lines.push("# VALIDATION_REPORT");
  lines.push("");
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push("");

  for (const gate of report.gates) {
    lines.push(`## ${gate.id.toUpperCase()} — ${gate.name}`);
    lines.push("");
    lines.push(`- status: ${gate.pass ? "PASS" : "FAIL"}`);
    if (gate.details.length === 0) {
      lines.push("- details: none");
    } else {
      lines.push("- details:");
      for (const detail of gate.details) {
        lines.push(`  - ${detail}`);
      }
    }
    lines.push("");
  }

  lines.push("## Export outputs");
  lines.push("");
  for (const manifest of manifests) {
    lines.push(
      `- ${manifest.target}${manifest.collection ? ` (${manifest.collection})` : ""}: ${manifest.entries.length} entries`,
    );
  }
  lines.push("");
  lines.push(`Overall: ${report.ok ? "PASS" : "FAIL"}`);

  return `${lines.join("\n")}\n`;
}
