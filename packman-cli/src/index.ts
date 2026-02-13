#!/usr/bin/env node
import path from "node:path";
import {
  validatePack,
  installPacks,
  resolvePackSource,
  type Issue,
  type InstallOptions,
  type ValidationResult,
} from "@packman/core";
import { Command } from "commander";
import { format } from "./format.js";
import ora from "ora";
import { z } from "zod";

const program = new Command();

program
  .name("packman")
  .description("Manage your dev tools and packs with cyberpunk precision.")
  .version("0.1.0");

// --- UTILS ---

function getCwd(): string {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return (
    process.env.PACKMAN_INVOKE_CWD ?? process.env.INIT_CWD ?? process.cwd()
  );
}

/**
 * Helper to wrap async actions with proper error handling and spinners.
 */
async function runWithSpinner<T>(
  title: string,
  action: () => Promise<T>,
): Promise<T> {
  const spinner = ora(title).start();
  try {
    const result = await action();
    spinner.succeed();
    return result;
  } catch (error) {
    spinner.fail();
    throw error;
  }
}

interface SourceSetValidationResult extends ValidationResult {
  roots: string[];
}

async function validateSourceSet(
  sourcePath: string,
): Promise<SourceSetValidationResult> {
  const started = Date.now();
  const resolved = await resolvePackSource(sourcePath, {
    autoCleanMacOSJunk: true,
  });

  try {
    if (resolved.roots.length === 0) {
      const issues: Issue[] = [
        {
          severity: "error",
          code: "NO_PACKS_FOUND",
          message: "No pack roots found in provided source path",
          path: sourcePath,
        },
      ];

      return {
        ok: false,
        issues,
        parsedArtifacts: [],
        elapsedMs: Date.now() - started,
        roots: [],
      };
    }

    const issues: Issue[] = [];
    const parsedArtifacts: ValidationResult["parsedArtifacts"] = [];

    for (const root of resolved.roots) {
      const result = await validatePack(root, {
        strict: true,
        suiteMode: true,
      });
      issues.push(...result.issues);
      parsedArtifacts.push(...result.parsedArtifacts);
    }

    const ok = !issues.some((issue) => issue.severity === "error");
    return {
      ok,
      issues,
      parsedArtifacts,
      elapsedMs: Date.now() - started,
      roots: resolved.roots,
    };
  } finally {
    await resolved.cleanup();
  }
}

// --- COMMANDS ---

program
  .command("validate")
  .alias("check")
  .description("Validate a pack's structure and manifest.")
  .argument("[path]", "Path to the pack folder", ".")
  .option("--json", "Output results as JSON")
  .action(async (inputPath: string, options: { json?: boolean }) => {
    const cwd = getCwd();
    const sourcePath = path.resolve(cwd, inputPath);

    if (!options.json) {
      format.header(`Validating Pack: ${sourcePath}`);
    }

    try {
      const result = await validateSourceSet(sourcePath);

      if (options.json) {
        format.json({
          ...result,
          rootCount: result.roots.length,
          roots: result.roots,
        });
        return;
      }

      if (result.roots.length > 1) {
        format.info(
          `Discovered ${result.roots.length} pack roots from source.`,
        );
      }

      if (result.ok) {
        format.success(`Pack valid!`);
        // We could look up the manifest artifact if we really wanted the name
        // const manifest = result.parsedArtifacts.find(a => a.type === 'manifest');
      } else {
        format.error("Validation failed with issues:");
        format.issues(result.issues);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        process.exitCode = 1;
      }
    } catch (error) {
      if (options.json) {
        format.json({ error: String(error) });
      } else {
        format.error(`Fatal validation error: ${error}`);
      }
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      process.exitCode = 1;
    }
  });

program
  .command("install")
  .description("Install a pack into a target workspace.")
  .argument("<source>", "Path to the pack folder")
  .option("-t, --to <path>", "Target workspace path (defaults to current)")
  .option(
    "--mode <mode>",
    "Collision strategy (fail, skip, overwrite, rename)",
    "fail",
  )
  .option("--dry-run", "Simulate installation without making changes")
  .option("--json", "Output report as JSON")
  .action(
    async (
      source: string,
      options: { to?: string; mode: string; dryRun?: boolean; json?: boolean },
    ) => {
      const cwd = getCwd();
      const sourcePath = path.resolve(cwd, source);
      const targetPath = options.to ? path.resolve(cwd, options.to) : cwd;

      // Parse mode using Zod
      const ModeSchema = z.enum(["fail", "skip", "overwrite", "rename"]);
      const modeResult = ModeSchema.safeParse(options.mode);

      if (!modeResult.success) {
        format.error(
          `Invalid mode: ${options.mode}. Must be one of: fail, skip, overwrite, rename.`,
        );
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        process.exitCode = 1;
        return;
      }
      const collisionStrategy = modeResult.data; // as CollisionStrategy

      if (!options.json) {
        format.header(`Installing Pack`);
        console.log(`  Source: ${format.path(sourcePath)}`);
        console.log(`  Target: ${format.path(targetPath)}`);
        console.log(`  Mode:   ${format.code(collisionStrategy)}\n`);
      }

      try {
        // 1. Validate first
        if (!options.json) console.log(format.bold("1. Validating..."));
        const validation = await validateSourceSet(sourcePath);

        if (!validation.ok) {
          if (options.json) {
            format.json({
              error: "Validation failed",
              issues: validation.issues,
            });
          } else {
            format.error("Pack validation failed. Aborting install.");
            format.issues(validation.issues);
          }
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          process.exitCode = 1;
          return;
        }

        // 2. Install (or Dry Run)
        if (!options.json) {
          console.log(
            format.bold(
              options.dryRun ? "2. Simulating Install..." : "2. Installing...",
            ),
          );
        }

        const installOpts: InstallOptions = {
          targetPath: targetPath,
          targetType: "workspace", // Defaulting to workspace for now
          collisionStrategy,
          dryRun: options.dryRun,
        };

        if (options.dryRun) {
          await runWithSpinner("Simulating installation logic", async () => {
            const res = await installPacks(sourcePath, installOpts);
            if (options.json) {
              format.json(res);
            } else {
              if (res.ok) format.success("Dry run completed. No changes made.");
              else {
                format.error("Dry run reported issues.");
                format.issues(res.issues);
              }
            }
          });
        } else {
          await runWithSpinner("Installing pack files", async () => {
            const res = await installPacks(sourcePath, installOpts);
            if (options.json) {
              format.json(res);
            } else {
              if (res.ok) format.success("Pack installed successfully!");
              else {
                format.error("Install completed with issues.");
                format.issues(res.issues);
              }
            }
          });
        }
      } catch (error) {
        if (options.json) {
          format.json({ error: String(error) });
        } else {
          format.error(`Installation failed: ${error}`);
        }
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        process.exitCode = 1;
      }
    },
  );

program
  .command("doctor")
  .description("Check system health and prerequisites.")
  .argument("[path]", "Target path to check", ".")
  .action(async (pathInput) => {
    format.header("System Doctor");

    const check = async (label: string, task: () => Promise<boolean>) => {
      const spinner = ora(label).start();
      try {
        const ok = await task();
        if (ok) spinner.succeed(label);
        else spinner.fail(label);
        return ok;
      } catch (e) {
        spinner.fail(`${label} (${e})`);
        return false;
      }
    };

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await check("Node.js Environment", async () => !!process.versions.node);
    await check("Tauri Environment", async () => {
      // Mock check
      return true;
    });

    console.log("");
    format.info("Doctor check complete.");
  });

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
program.parseAsync(process.argv);
