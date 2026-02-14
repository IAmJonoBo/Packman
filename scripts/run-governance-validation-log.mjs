import { promises as fs } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const artifactsDir = path.join(root, "artifacts");
const validationLogPath = path.join(artifactsDir, "validation.log");

const checks = [
  {
    label: "manifest-owned-paths",
    command: "pnpm",
    args: ["run", "governance:manifest-owned-paths"],
  },
  {
    label: "suite-inventory",
    command: "pnpm",
    args: ["run", "governance:suite-inventory"],
  },
  {
    label: "install-links-report",
    command: "pnpm",
    args: ["run", "governance:install-links-report"],
  },
  {
    label: "suite-index",
    command: "pnpm",
    args: ["run", "governance:suite-index"],
  },
  {
    label: "route-ownership",
    command: "pnpm",
    args: ["run", "governance:routes"],
  },
];

function hr() {
  return "=".repeat(80);
}

function rel(inputPath) {
  return inputPath.split(path.sep).join("/");
}

function nowIso() {
  return new Date().toISOString();
}

function runCheck(check) {
  const startedAt = Date.now();
  const result = spawnSync(check.command, check.args, {
    cwd: root,
    encoding: "utf8",
  });
  const elapsedMs = Date.now() - startedAt;
  const exitCode = result.status ?? 1;
  return {
    ...check,
    elapsedMs,
    exitCode,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
  };
}

function renderReport(results) {
  const lines = [];
  lines.push(hr());
  lines.push("Packman Governance Validation Log");
  lines.push(`Generated: ${nowIso()}`);
  lines.push(`Workspace: ${root}`);
  lines.push(hr());
  lines.push("");

  const failed = results.filter((item) => item.exitCode !== 0);
  lines.push(`Checks: ${results.length}`);
  lines.push(`Passed: ${results.length - failed.length}`);
  lines.push(`Failed: ${failed.length}`);
  lines.push("");

  for (const item of results) {
    lines.push(hr());
    lines.push(`Check: ${item.label}`);
    lines.push(`Command: ${item.command} ${item.args.join(" ")}`);
    lines.push(`Exit code: ${item.exitCode}`);
    lines.push(`Elapsed: ${item.elapsedMs} ms`);
    lines.push("-- STDOUT --");
    lines.push(item.stdout.trim() ? item.stdout.trim() : "<empty>");
    lines.push("-- STDERR --");
    lines.push(item.stderr.trim() ? item.stderr.trim() : "<empty>");
    lines.push("");
  }

  lines.push(hr());
  lines.push(failed.length === 0 ? "RESULT: PASS" : "RESULT: FAIL");
  lines.push(hr());
  lines.push("");

  return `${lines.join("\n")}`;
}

async function main() {
  await fs.mkdir(artifactsDir, { recursive: true });

  const results = checks.map((check) => runCheck(check));
  const report = renderReport(results);
  await fs.writeFile(validationLogPath, report, "utf8");

  const failed = results.filter((item) => item.exitCode !== 0);
  console.log("Governance validation run complete:");
  console.log(`- ${rel(path.relative(root, validationLogPath))}`);
  console.log(`- checks: ${results.length}`);
  console.log(`- failed: ${failed.length}`);

  if (failed.length > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
