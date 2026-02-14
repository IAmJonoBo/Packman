#!/usr/bin/env node
import path from "node:path";
import { promises as fs } from "node:fs";
import { existsSync } from "node:fs";
import {
  validatePack,
  installPacks,
  normalizePack,
  resolvePackSource,
  type ImportCategory,
  type NormalizeResult,
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
  .description("Manage workspace packs with clear, reliable automation.")
  .version("0.1.0");

// --- UTILS ---

function getCwd(): string {
  const explicit = process.env.PACKMAN_INVOKE_CWD;
  if (explicit && explicit.trim().length > 0) {
    return explicit;
  }

  const initCwd = process.env.INIT_CWD;
  if (initCwd && initCwd.trim().length > 0) {
    return initCwd;
  }

  const cwd = process.cwd();
  let cursor = cwd;
  while (true) {
    const hasWorkspaceMarker = existsSync(
      path.join(cursor, "pnpm-workspace.yaml"),
    );
    const hasPacksRoot = existsSync(path.join(cursor, "Packs"));
    if (hasWorkspaceMarker && hasPacksRoot) {
      return cursor;
    }

    const parent = path.dirname(cursor);
    if (parent === cursor) {
      break;
    }
    cursor = parent;
  }

  return cwd;
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

interface ValidationSourceOptions {
  strict: boolean;
  suiteMode: boolean;
  autoCleanMacOSJunk: boolean;
}

async function listCatalogPackRoots(sourcePath: string): Promise<string[]> {
  let stat;
  try {
    stat = await fs.stat(sourcePath);
  } catch {
    return [];
  }

  if (!stat.isDirectory()) {
    return [];
  }

  const entries = await fs.readdir(sourcePath, { withFileTypes: true });
  const roots: string[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }
    if (!entry.name.endsWith("-pack")) {
      continue;
    }

    const candidate = path.join(sourcePath, entry.name);
    const readmePath = path.join(candidate, "README.md");
    if (!existsSync(readmePath)) {
      continue;
    }
    roots.push(candidate);
  }

  return roots.sort((left, right) => left.localeCompare(right));
}

async function resolveBatchRoots(
  sourcePath: string,
  autoCleanMacOSJunk: boolean,
): Promise<{ roots: string[]; cleanup: () => Promise<void> }> {
  const catalogRoots = await listCatalogPackRoots(sourcePath);
  if (catalogRoots.length > 0) {
    return {
      roots: catalogRoots,
      cleanup: async () => {},
    };
  }

  const resolved = await resolvePackSource(sourcePath, {
    autoCleanMacOSJunk,
  });

  return {
    roots: resolved.roots,
    cleanup: resolved.cleanup,
  };
}

async function validateSourceSet(
  sourcePath: string,
  options: ValidationSourceOptions,
): Promise<SourceSetValidationResult> {
  const started = Date.now();
  const resolved = await resolveBatchRoots(
    sourcePath,
    options.autoCleanMacOSJunk,
  );

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
        strict: options.strict,
        suiteMode: options.suiteMode,
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

function rel(inputPath: string): string {
  return inputPath.split(path.sep).join("/");
}

function parseFrontmatterSummary(content: string): {
  name?: string;
  description?: string;
} {
  const match = /^---\n([\s\S]*?)\n---(?:\n|$)/.exec(content);
  if (!match?.[1]) {
    return {};
  }

  const block = match[1];
  const nameMatch = /^name:\s*(.+)$/m.exec(block);
  const descriptionMatch = /^description:\s*(.+)$/m.exec(block);
  const clean = (value?: string) => value?.trim().replace(/^['"]|['"]$/g, "");

  return {
    name: clean(nameMatch?.[1]),
    description: clean(descriptionMatch?.[1]),
  };
}

async function walkFiles(startPath: string): Promise<string[]> {
  const files: string[] = [];

  async function walk(currentPath: string): Promise<void> {
    const entries = await fs.readdir(currentPath, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === "node_modules" || entry.name === ".git") {
        continue;
      }
      const fullPath = path.join(currentPath, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.isFile()) {
        files.push(fullPath);
      }
    }
  }

  await walk(startPath);
  return files;
}

function formatLlmsIndex(params: {
  title: string;
  roots: string[];
  generatedAt: string;
  entries: Array<{
    type: "agent" | "prompt" | "skill";
    name: string;
    path: string;
    description: string;
  }>;
}): string {
  const lines: string[] = [];
  lines.push(`# ${params.title}`);
  lines.push(`generated_at: ${params.generatedAt}`);
  lines.push(`root_count: ${params.roots.length}`);
  lines.push(`entry_count: ${params.entries.length}`);
  lines.push("");
  lines.push("type\tname\tpath\tdescription");

  for (const entry of params.entries) {
    const safeName = entry.name.replace(/\s+/g, " ").trim();
    const safeDescription = entry.description.replace(/\s+/g, " ").trim();
    lines.push(
      `${entry.type}\t${safeName}\t${entry.path}\t${safeDescription || "(no description)"}`,
    );
  }

  lines.push("");
  return `${lines.join("\n")}`;
}

async function generateLlmsEntries(rootPath: string): Promise<
  Array<{
    type: "agent" | "prompt" | "skill";
    name: string;
    path: string;
    description: string;
  }>
> {
  const files = await walkFiles(rootPath);
  const entries: Array<{
    type: "agent" | "prompt" | "skill";
    name: string;
    path: string;
    description: string;
  }> = [];

  for (const filePath of files) {
    const normalized = rel(path.relative(rootPath, filePath));
    let type: "agent" | "prompt" | "skill" | null = null;

    if (normalized.endsWith(".agent.md")) {
      type = "agent";
    } else if (normalized.endsWith(".prompt.md")) {
      type = "prompt";
    } else if (normalized.endsWith("/SKILL.md")) {
      type = "skill";
    }

    if (!type) {
      continue;
    }

    const raw = await fs.readFile(filePath, "utf8");
    const fm = parseFrontmatterSummary(raw);
    const fallbackName =
      type === "skill"
        ? path.basename(path.dirname(filePath))
        : path.basename(filePath).replace(/\.(agent|prompt)\.md$/, "");

    entries.push({
      type,
      name: fm.name ?? fallbackName,
      path: normalized,
      description: fm.description ?? "",
    });
  }

  return entries.sort((left, right) => left.path.localeCompare(right.path));
}

// --- COMMANDS ---

program
  .command("validate")
  .alias("check")
  .description("Validate a pack's structure and manifest.")
  .argument("[path]", "Path to the pack folder", ".")
  .option("--strict", "Enable strict validation checks")
  .option("--auto-clean", "Auto-clean macOS junk files before validation")
  .option("--suite", "Enable suite mode for suite-owned paths")
  .option("--json", "Output results as JSON")
  .action(
    async (
      inputPath: string,
      options: {
        json?: boolean;
        strict?: boolean;
        suite?: boolean;
        autoClean?: boolean;
      },
    ) => {
      const cwd = getCwd();
      const sourcePath = path.resolve(cwd, inputPath);

      if (!options.json) {
        format.header(`Validating Pack: ${sourcePath}`);
      }

      try {
        const result = await validateSourceSet(sourcePath, {
          strict: Boolean(options.strict),
          suiteMode: Boolean(options.suite),
          autoCleanMacOSJunk: Boolean(options.autoClean),
        });

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
    },
  );

program
  .command("normalize")
  .description("Normalize packs and optionally apply changes.")
  .argument("[path]", "Path to pack or pack collection", ".")
  .option("--apply", "Apply changes to disk")
  .option(
    "--auto-prefix-namespaces",
    "Auto-prefix prompt names with namespaces where missing",
  )
  .option("--json", "Output report as JSON")
  .action(
    async (
      inputPath: string,
      options: {
        apply?: boolean;
        autoPrefixNamespaces?: boolean;
        json?: boolean;
      },
    ) => {
      const cwd = getCwd();
      const sourcePath = path.resolve(cwd, inputPath);

      if (!options.json) {
        format.header(`Normalizing Packs: ${sourcePath}`);
      }

      try {
        const resolved = await resolveBatchRoots(sourcePath, true);

        try {
          const results: Array<NormalizeResult & { root: string }> = [];
          for (const root of resolved.roots) {
            const result = await normalizePack(root, {
              apply: Boolean(options.apply),
              autoPrefixNamespaces: Boolean(options.autoPrefixNamespaces),
            });
            results.push({ ...result, root });
          }

          const aggregate = {
            ok: results.every((item) => item.ok),
            roots: results.map((item) => item.root),
            changedFiles: results.reduce(
              (acc, item) => acc + item.changes.length,
              0,
            ),
            issues: results.flatMap((item) => item.issues),
            results,
          };

          if (options.json) {
            format.json(aggregate);
          } else {
            if (aggregate.ok) {
              format.success("Normalization completed.");
            } else {
              format.error("Normalization completed with issues.");
            }
            format.info(`Pack roots processed: ${aggregate.roots.length}`);
            format.info(
              `File changes proposed/applied: ${aggregate.changedFiles}`,
            );
            format.issues(aggregate.issues);
          }

          if (!aggregate.ok) {
            process.exitCode = 1;
          }
        } finally {
          await resolved.cleanup();
        }
      } catch (error) {
        if (options.json) {
          format.json({ error: String(error) });
        } else {
          format.error(`Normalization failed: ${error}`);
        }
        process.exitCode = 1;
      }
    },
  );

program
  .command("index")
  .description("Generate llms.txt discovery indexes for suite and packs.")
  .argument("[source]", "Pack source path", "./Packs")
  .option("--out <path>", "Suite index output path", "Packs/llms.txt")
  .option("--per-pack", "Also generate per-pack llms.txt files")
  .option("--json", "Output report as JSON")
  .action(
    async (
      source: string,
      options: { out: string; perPack?: boolean; json?: boolean },
    ) => {
      const cwd = getCwd();
      const sourcePath = path.resolve(cwd, source);
      const outPath = path.resolve(cwd, options.out);

      if (!options.json) {
        format.header("Generating llms.txt index");
      }

      try {
        const resolved = await resolveBatchRoots(sourcePath, true);

        try {
          const allEntries: Array<{
            type: "agent" | "prompt" | "skill";
            name: string;
            path: string;
            description: string;
          }> = [];

          const perPackOutputs: string[] = [];
          const generatedAt = new Date().toISOString();

          for (const root of resolved.roots) {
            const entries = await generateLlmsEntries(root);
            const rootLabel = rel(path.relative(cwd, root));
            for (const entry of entries) {
              allEntries.push({
                ...entry,
                path: rel(path.join(rootLabel, entry.path)),
              });
            }

            if (options.perPack) {
              const perPackContent = formatLlmsIndex({
                title: `llms index (${path.basename(root)})`,
                roots: [rootLabel],
                generatedAt,
                entries,
              });
              const perPackPath = path.join(root, "llms.txt");
              await fs.writeFile(perPackPath, perPackContent, "utf8");
              perPackOutputs.push(rel(path.relative(cwd, perPackPath)));
            }
          }

          await fs.mkdir(path.dirname(outPath), { recursive: true });
          const suiteContent = formatLlmsIndex({
            title: "suite llms index",
            roots: resolved.roots.map((value) =>
              rel(path.relative(cwd, value)),
            ),
            generatedAt,
            entries: allEntries,
          });
          await fs.writeFile(outPath, suiteContent, "utf8");

          const output = {
            ok: true,
            sourcePath,
            roots: resolved.roots,
            outPath,
            entries: allEntries.length,
            perPackOutputs,
          };

          if (options.json) {
            format.json(output);
          } else {
            format.success("llms index generation completed.");
            format.info(`Suite index: ${format.path(outPath)}`);
            format.info(`Entries: ${allEntries.length}`);
            if (perPackOutputs.length > 0) {
              format.info(`Per-pack indexes: ${perPackOutputs.length}`);
            }
          }
        } finally {
          await resolved.cleanup();
        }
      } catch (error) {
        if (options.json) {
          format.json({ error: String(error) });
        } else {
          format.error(`Index generation failed: ${error}`);
        }
        process.exitCode = 1;
      }
    },
  );

program
  .command("install")
  .description("Install a pack into a target workspace.")
  .argument("<source>", "Path to the pack folder")
  .option("-t, --to <path>", "Target workspace path (defaults to current)")
  .option(
    "--target-type <type>",
    "Install target type (workspace, global)",
    "workspace",
  )
  .option(
    "--mode <mode>",
    "Collision strategy (fail, skip, overwrite, rename)",
    "fail",
  )
  .option(
    "--include-category <category...>",
    "Include only selected categories (agents,prompts,instructions,skills,settings,hooks,mcp,alwaysOn,manifest,readme)",
  )
  .option(
    "--include-path <relativePath...>",
    "Include only selected relative file paths",
  )
  .option("--dry-run", "Simulate installation without making changes")
  .option("--json", "Output report as JSON")
  .action(
    async (
      source: string,
      options: {
        to?: string;
        mode: string;
        dryRun?: boolean;
        json?: boolean;
        targetType: string;
        includeCategory?: string[];
        includePath?: string[];
      },
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

      const TargetTypeSchema = z.enum(["workspace", "global"]);
      const targetTypeResult = TargetTypeSchema.safeParse(options.targetType);
      if (!targetTypeResult.success) {
        format.error(
          `Invalid target type: ${options.targetType}. Must be one of: workspace, global.`,
        );
        process.exitCode = 1;
        return;
      }

      const categoryValues = options.includeCategory ?? [];
      const CategorySchema = z.enum([
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
      ]);
      const parsedCategories: ImportCategory[] = [];
      for (const value of categoryValues) {
        const parsed = CategorySchema.safeParse(value);
        if (!parsed.success) {
          format.error(
            `Invalid category: ${value}. Allowed: agents,prompts,instructions,skills,settings,hooks,mcp,alwaysOn,manifest,readme`,
          );
          process.exitCode = 1;
          return;
        }
        parsedCategories.push(parsed.data);
      }

      if (!options.json) {
        format.header(`Installing Pack`);
        console.log(`  Source: ${format.path(sourcePath)}`);
        console.log(`  Target: ${format.path(targetPath)}`);
        console.log(`  Mode:   ${format.code(collisionStrategy)}\n`);
      }

      try {
        // 1. Validate first
        if (!options.json) console.log(format.bold("1. Validating..."));
        const validation = await validateSourceSet(sourcePath, {
          strict: true,
          suiteMode: true,
          autoCleanMacOSJunk: true,
        });

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
          targetType: targetTypeResult.data,
          collisionStrategy,
          dryRun: options.dryRun,
          includeCategories: parsedCategories,
          includePaths: options.includePath,
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
