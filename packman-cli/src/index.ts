#!/usr/bin/env node
import path from 'node:path';
import fs from 'node:fs';
import { promises as fsp } from 'node:fs';
import {
  buildCleanZip,
  createReport,
  doctorTarget,
  generateRegistry,
  installPacks,
  normalizePack,
  readinessReport,
  resolvePackSource,
  rollbackInstall,
  syncPackReadmes,
  summarizeIssues,
  validatePack,
} from '@packman/core';
import { Command } from 'commander';
import { printHeader, printIssues, printJson } from './format.js';

const program = new Command();
program.name('packman').description('Packman CLI for Copilot customization packs').version('0.1.0');

const invocationCwd = process.env.PACKMAN_INVOKE_CWD ?? process.env.INIT_CWD ?? process.cwd();

function findWorkspaceRoot(startDir: string): string {
  let current = startDir;

  while (true) {
    const marker = path.join(current, 'pnpm-workspace.yaml');
    if (fs.existsSync(marker)) {
      return current;
    }

    const parent = path.dirname(current);
    if (parent === current) {
      return startDir;
    }

    current = parent;
  }
}

const workspaceRoot = findWorkspaceRoot(process.cwd());

function resolveFromInvocation(inputPath: string): string {
  const direct = path.resolve(invocationCwd, inputPath);
  if (fs.existsSync(direct)) {
    return direct;
  }

  return path.resolve(workspaceRoot, inputPath);
}

async function parseCollisionDecisions(
  filePath?: string,
  inlineJson?: string,
): Promise<Record<string, 'fail' | 'skip' | 'overwrite' | 'rename'> | undefined> {
  if (!filePath && !inlineJson) {
    return undefined;
  }

  const raw = inlineJson ?? (await fsp.readFile(resolveFromInvocation(filePath as string), 'utf8'));
  const parsed = JSON.parse(raw) as unknown;
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('collision decisions must be a JSON object map of relativePath -> action');
  }

  const normalized: Record<string, 'fail' | 'skip' | 'overwrite' | 'rename'> = {};
  for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
    if (typeof value !== 'string' || !['fail', 'skip', 'overwrite', 'rename'].includes(value)) {
      throw new Error(`invalid collision decision for ${key}; expected fail|skip|overwrite|rename`);
    }

    normalized[key] = value as 'fail' | 'skip' | 'overwrite' | 'rename';
  }

  return normalized;
}

program
  .command('validate')
  .argument('<path>', 'pack path')
  .option('--strict', 'strict validation mode', false)
  .option('--target <targetPath>', 'optional target path for collision scan')
  .option('--suite', 'suite mode', false)
  .option('--auto-clean', 'strip macOS junk when input is a zip', false)
  .option('--json', 'emit machine-readable report', false)
  .action(async (inputPath, options) => {
    const started = Date.now();
    const absolutePath = resolveFromInvocation(inputPath);
    const resolved = await resolvePackSource(absolutePath, { autoCleanMacOSJunk: Boolean(options.autoClean) });
    const roots = resolved.roots;
    if (roots.length === 0) {
      const report = createReport(
        'validate',
        { path: absolutePath, strict: Boolean(options.strict), target: options.target, suite: Boolean(options.suite) },
        { ok: false, elapsedMs: Date.now() - started, parsedArtifactCount: 0, packRoots: roots },
        [
          {
            severity: 'error',
            code: 'NO_PACKS_FOUND',
            message: 'No pack roots found in provided source path',
            path: absolutePath,
          },
        ],
        started,
      );
      await resolved.cleanup();
      if (options.json) {
        printJson(report);
      } else {
        printHeader('Validate');
        console.log('ok: false');
        printIssues(report.issues);
      }
      process.exitCode = 1;
      return;
    }
    const aggregateIssues = [] as Awaited<ReturnType<typeof validatePack>>['issues'];
    let artifactCount = 0;
    let ok = true;

    try {
      for (const root of roots) {
        const result = await validatePack(root, {
          strict: Boolean(options.strict),
          targetPathForCollisionScan: options.target ? resolveFromInvocation(options.target) : undefined,
          suiteMode: Boolean(options.suite),
        });
        artifactCount += result.parsedArtifacts.length;
        aggregateIssues.push(...result.issues);
        ok = ok && result.ok;
      }
    } finally {
      await resolved.cleanup();
    }

    const report = createReport(
      'validate',
      { path: absolutePath, strict: Boolean(options.strict), target: options.target, suite: Boolean(options.suite) },
      {
        ok,
        elapsedMs: Date.now() - started,
        parsedArtifactCount: artifactCount,
        packRoots: roots,
      },
      aggregateIssues,
      started,
    );

    if (options.json) {
      printJson(report);
      return;
    }

    printHeader('Validate');
    console.log(`ok: ${ok}`);
    console.log(`packs: ${roots.length}`);
    console.log(`artifacts: ${artifactCount}`);
    console.log(`elapsedMs: ${Date.now() - started}`);
    printIssues(aggregateIssues);
    console.log(JSON.stringify({ summary: summarizeIssues(aggregateIssues) }));

    if (!ok) {
      process.exitCode = 1;
    }
  });

program
  .command('normalize')
  .argument('<path>', 'pack path')
  .option('--apply', 'apply normalize changes', false)
  .option('--auto-clean', 'strip macOS junk when input is a zip', false)
  .option('--json', 'emit machine-readable report', false)
  .action(async (inputPath, options) => {
    const started = Date.now();
    const absolutePath = resolveFromInvocation(inputPath);
    const resolved = await resolvePackSource(absolutePath, { autoCleanMacOSJunk: Boolean(options.autoClean) });
    const roots = resolved.roots;
    if (roots.length === 0) {
      const report = createReport(
        'normalize',
        { path: absolutePath, apply: Boolean(options.apply) },
        { ok: false, elapsedMs: Date.now() - started, changes: [], packRoots: roots },
        [
          {
            severity: 'error',
            code: 'NO_PACKS_FOUND',
            message: 'No pack roots found in provided source path',
            path: absolutePath,
          },
        ],
        started,
      );
      await resolved.cleanup();
      if (options.json) {
        printJson(report);
      } else {
        printHeader('Normalize');
        console.log('ok: false');
        printIssues(report.issues);
      }
      process.exitCode = 1;
      return;
    }
    const changes = [] as Awaited<ReturnType<typeof normalizePack>>['changes'];
    const issues = [] as Awaited<ReturnType<typeof normalizePack>>['issues'];
    let ok = true;

    try {
      for (const root of roots) {
        const result = await normalizePack(root, {
          apply: Boolean(options.apply),
          autoPrefixNamespaces: true,
        });
        ok = ok && result.ok;
        changes.push(...result.changes);
        issues.push(...result.issues);
      }
    } finally {
      await resolved.cleanup();
    }

    const report = createReport(
      'normalize',
      { path: absolutePath, apply: Boolean(options.apply) },
      {
        ok,
        elapsedMs: Date.now() - started,
        changes,
        packRoots: roots,
      },
      issues,
      started,
    );

    if (options.json) {
      printJson(report);
      return;
    }

    printHeader('Normalize');
    console.log(`ok: ${ok}`);
    console.log(`packs: ${roots.length}`);
    console.log(`changes: ${changes.length}`);
    for (const change of changes) {
      console.log(`- ${change.action}: ${change.fromPath ?? '(new)'} -> ${change.toPath}`);
    }
    printIssues(issues);
  });

program
  .command('readme-sync')
  .argument('<path>', 'pack or packs root path')
  .option('--apply', 'apply README updates', false)
  .option('--json', 'emit machine-readable report', false)
  .action(async (inputPath, options) => {
    const started = Date.now();
    const absolutePath = resolveFromInvocation(inputPath);
    const result = await syncPackReadmes(absolutePath, Boolean(options.apply));

    const report = createReport(
      'readme-sync',
      { path: absolutePath, apply: Boolean(options.apply) },
      result,
      result.issues,
      started,
    );

    if (options.json) {
      printJson(report);
      return;
    }

    printHeader('Readme Sync');
    console.log(`ok: ${result.ok}`);
    console.log(`packs: ${result.packRoots.length}`);
    console.log(`changes: ${result.changes.length}`);
    printIssues(result.issues);
  });

program
  .command('install')
  .argument('<packOrPacksDir>', 'pack path')
  .requiredOption('--target <workspace|global>', 'install target kind')
  .requiredOption('--path <targetPath>', 'target path')
  .option('--suite', 'suite mode', false)
  .option('--dry-run', 'preview install', false)
  .option('--on-collision <fail|skip|overwrite|rename>', 'collision behavior', 'fail')
  .option('--collision-decisions <jsonFile>', 'path to collision decisions JSON file')
  .option('--collision-decisions-json <json>', 'inline collision decisions JSON object')
  .option('--plan-out <filePath>', 'write install plans JSON to this file')
  .option('--auto-clean', 'strip macOS junk when input is a zip', false)
  .option('--json', 'emit machine-readable report', false)
  .action(async (sourcePath, options) => {
    const started = Date.now();
    const collisionDecisions = await parseCollisionDecisions(
      options.collisionDecisions,
      options.collisionDecisionsJson,
    );

    const result = await installPacks(resolveFromInvocation(sourcePath), {
      targetPath: resolveFromInvocation(options.path),
      targetType: options.target,
      suite: Boolean(options.suite),
      dryRun: Boolean(options.dryRun),
      collisionStrategy: options.onCollision,
      collisionDecisions,
      autoCleanMacOSJunk: Boolean(options.autoClean),
    });

    const report = createReport(
      'install',
      {
        sourcePath: resolveFromInvocation(sourcePath),
        target: options.target,
        path: resolveFromInvocation(options.path),
        suite: Boolean(options.suite),
        dryRun: Boolean(options.dryRun),
        onCollision: options.onCollision,
        collisionDecisions: options.collisionDecisions ?? options.collisionDecisionsJson,
        autoClean: Boolean(options.autoClean),
      },
      result,
      result.issues,
      started,
    );

    if (options.planOut) {
      const planPath = resolveFromInvocation(options.planOut);
      const payload = {
        generatedAt: new Date().toISOString(),
        input: report.input,
        plans: result.plans ?? [],
      };
      await fsp.mkdir(path.dirname(planPath), { recursive: true });
      await fsp.writeFile(planPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
    }

    if (options.json) {
      printJson(report);
      return;
    }

    printHeader('Install');
    console.log(`ok: ${result.ok}`);
    console.log(`dryRun: ${Boolean(options.dryRun)}`);
    console.log(`filesTouched: ${result.filesTouched.length}`);
    if (result.backupZipPath) {
      console.log(`backup: ${result.backupZipPath}`);
    }
    printIssues(result.issues);

    if (!result.ok) {
      process.exitCode = 1;
    }
  });

program
  .command('build')
  .argument('<packsdir>', 'source packs directory')
  .argument('<outZip>', 'output zip path')
  .option('--json', 'emit machine-readable report', false)
  .action(async (packsDir, outZip, options) => {
    const started = Date.now();
    const result = await buildCleanZip(resolveFromInvocation(packsDir), resolveFromInvocation(outZip));
    const report = createReport(
      'build',
      { packsDir: resolveFromInvocation(packsDir), outZip: resolveFromInvocation(outZip) },
      result,
      [],
      started,
    );

    if (options.json) {
      printJson(report);
      return;
    }

    printHeader('Build');
    console.log(`filesAdded: ${result.filesAdded}`);
    console.log(`outZipPath: ${result.outZipPath}`);
  });

program
  .command('doctor')
  .argument('<targetRepoOrDir>', 'target path')
  .option('--json', 'emit machine-readable report', false)
  .action(async (targetPath, options) => {
    const started = Date.now();
    const absoluteTargetPath = resolveFromInvocation(targetPath);
    const result = await doctorTarget(absoluteTargetPath);
    const report = createReport('doctor', { targetPath: absoluteTargetPath }, result, result.issues, started);

    if (options.json) {
      printJson(report);
      return;
    }

    printHeader('Doctor');
    console.log(`ok: ${result.ok}`);
    printIssues(result.issues);
    if (result.recommendations.length > 0) {
      console.log('Recommendations:');
      for (const item of result.recommendations) {
        console.log(`- ${item}`);
      }
    }

    if (!result.ok) {
      process.exitCode = 1;
    }
  });

program
  .command('readiness')
  .argument('<targetRepoOrDir>', 'target path')
  .option('--json', 'emit machine-readable report', false)
  .action(async (targetPath, options) => {
    const started = Date.now();
    const absoluteTargetPath = resolveFromInvocation(targetPath);
    const result = await readinessReport(absoluteTargetPath);
    const report = createReport('readiness', { targetPath: absoluteTargetPath }, result, result.issues, started);

    if (options.json) {
      printJson(report);
      return;
    }

    printHeader('Readiness');
    console.log(`ok: ${result.ok}`);
    printIssues(result.issues);
    console.log('Proposed patch:');
    console.log(JSON.stringify(result.proposedPatch, null, 2));

    if (!result.ok) {
      process.exitCode = 1;
    }
  });

program
  .command('registry')
  .argument('<targetRepoOrDir>', 'target path')
  .option('--json', 'emit machine-readable report', false)
  .action(async (targetPath, options) => {
    const started = Date.now();
    const absoluteTargetPath = resolveFromInvocation(targetPath);
    const result = await generateRegistry(absoluteTargetPath);
    const report = createReport('registry', { targetPath: absoluteTargetPath }, result, [], started);

    if (options.json) {
      printJson(report);
      return;
    }

    printHeader('Registry');
    console.log(`registryJson: ${result.registryJsonPath}`);
    console.log(`registryMd: ${result.registryMdPath}`);
  });

program
  .command('rollback')
  .requiredOption('--path <targetPath>', 'target path')
  .requiredOption('--backup <backupZipPath>', 'backup zip path')
  .option('--json', 'emit machine-readable report', false)
  .action(async (options) => {
    const started = Date.now();
    const result = await rollbackInstall(resolveFromInvocation(options.path), resolveFromInvocation(options.backup));
    const report = createReport(
      'rollback',
      { targetPath: resolveFromInvocation(options.path), backupZipPath: resolveFromInvocation(options.backup) },
      result,
      result.issues,
      started,
    );

    if (options.json) {
      printJson(report);
      return;
    }

    printHeader('Rollback');
    console.log(`ok: ${result.ok}`);
    console.log(`restored: ${result.filesTouched.length}`);
    printIssues(result.issues);
  });

program.parseAsync(process.argv);
