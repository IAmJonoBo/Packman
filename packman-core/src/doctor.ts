import path from "node:path";
import fg from "fast-glob";
import { parseFrontmatter } from "./frontmatter.js";
import { readText, exists } from "./fs-utils.js";
import { hasErrors } from "./report.js";
import { SUITE_OWNED_PATH_PREFIXES } from "./artifact-policy.js";
import type { DoctorResult, Issue } from "./types.js";

export async function doctorTarget(targetPath: string): Promise<DoctorResult> {
  const started = Date.now();
  const issues: Issue[] = [];
  const recommendations: string[] = [];

  const suiteOwnedPaths = [...SUITE_OWNED_PATH_PREFIXES];
  for (const suitePath of suiteOwnedPaths) {
    const absolutePath = path.join(targetPath, suitePath);
    if (await exists(absolutePath)) {
      issues.push({
        severity: "info",
        code: "SUITE_OWNED_PRESENT",
        message: `Detected suite-owned file: ${suitePath}`,
        path: suitePath,
      });
    }
  }

  const promptFiles = await fg(".github/prompts/**/*.prompt.md", {
    cwd: targetPath,
    absolute: true,
    dot: true,
  });
  const promptNameMap = new Map<string, string[]>();

  for (const promptFile of promptFiles) {
    const raw = await readText(promptFile);
    const parsed = parseFrontmatter(raw);
    if (typeof parsed.frontmatter.name !== "string") {
      continue;
    }

    const list = promptNameMap.get(parsed.frontmatter.name) ?? [];
    list.push(path.relative(targetPath, promptFile));
    promptNameMap.set(parsed.frontmatter.name, list);
  }

  for (const [name, paths] of promptNameMap.entries()) {
    if (paths.length > 1) {
      for (const filePath of paths) {
        issues.push({
          severity: "error",
          code: "PROMPT_DUPLICATE_NAME",
          message: `Duplicate prompt name across target: ${name}`,
          path: filePath,
        });
      }
    }
  }

  const agentFiles = await fg(".github/agents/**/*.agent.md", {
    cwd: targetPath,
    absolute: true,
    dot: true,
  });
  const agentNameMap = new Map<string, string[]>();

  for (const agentFile of agentFiles) {
    const raw = await readText(agentFile);
    const parsed = parseFrontmatter(raw);
    if (typeof parsed.frontmatter.name !== "string") {
      continue;
    }

    const list = agentNameMap.get(parsed.frontmatter.name) ?? [];
    list.push(path.relative(targetPath, agentFile));
    agentNameMap.set(parsed.frontmatter.name, list);
  }

  for (const [name, paths] of agentNameMap.entries()) {
    if (paths.length > 1) {
      for (const filePath of paths) {
        issues.push({
          severity: "error",
          code: "AGENT_DUPLICATE_NAME",
          message: `Duplicate agent name across target: ${name}`,
          path: filePath,
        });
      }
    }
  }

  const instructionFiles = await fg(
    ".github/instructions/**/*.instructions.md",
    {
      cwd: targetPath,
      absolute: true,
      dot: true,
    },
  );

  const applyToMap = new Map<string, string[]>();
  for (const instructionFile of instructionFiles) {
    const raw = await readText(instructionFile);
    const parsed = parseFrontmatter(raw);
    const applyTo =
      typeof parsed.frontmatter.applyTo === "string"
        ? parsed.frontmatter.applyTo
        : undefined;
    if (!applyTo) {
      continue;
    }

    const globs = applyTo
      .split(",")
      .map((glob) => glob.trim())
      .filter(Boolean);

    for (const glob of globs) {
      const list = applyToMap.get(glob) ?? [];
      list.push(path.relative(targetPath, instructionFile));
      applyToMap.set(glob, list);
    }
  }

  for (const [glob, owners] of applyToMap.entries()) {
    if (owners.length > 1) {
      issues.push({
        severity: "warning",
        code: "INSTRUCTION_APPLYTO_OVERLAP",
        message: `Multiple instruction files target applyTo glob: ${glob}`,
        details: { owners },
      });
    }
  }

  if (issues.some((issue) => issue.code === "PROMPT_DUPLICATE_NAME")) {
    recommendations.push(
      "Rename prompt names via namespace prefixes (e.g., sec:, qa:, brief:).",
    );
  }

  if (issues.some((issue) => issue.code === "AGENT_DUPLICATE_NAME")) {
    recommendations.push(
      "Rename colliding agent names and update prompt frontmatter references.",
    );
  }

  if (issues.some((issue) => issue.code === "INSTRUCTION_APPLYTO_OVERLAP")) {
    recommendations.push(
      "Define explicit ownership for overlapping applyTo globs.",
    );
  }

  recommendations.push(
    "Switch to suite mode when managing suite-owned files (copilot instructions, VS Code settings/MCP, hooks, or root always-on instruction files).",
  );
  recommendations.push(
    "Install suite harmoniser pack for explicit collision policies.",
  );

  return {
    ok: !hasErrors(issues),
    issues,
    recommendations,
    elapsedMs: Date.now() - started,
  };
}
