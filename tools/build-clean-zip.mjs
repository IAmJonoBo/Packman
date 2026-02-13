#!/usr/bin/env node
import path from 'node:path';
import process from 'node:process';
import { buildCleanZip } from '../packman-core/dist/build.js';

const [sourceDir, outZip] = process.argv.slice(2);
if (!sourceDir || !outZip) {
  console.error('Usage: node tools/build-clean-zip.mjs <packsdir> <out.zip>');
  process.exit(1);
}

const result = await buildCleanZip(path.resolve(sourceDir), path.resolve(outZip));
console.log(JSON.stringify(result, null, 2));
