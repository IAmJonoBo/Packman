import { spawn } from "node:child_process";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import { chromium } from "playwright";
import { runKitchenSinkE2E } from "../e2e/kitchen-sink.e2e.spec.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appDir = path.resolve(__dirname, "..");
const previewHost = "127.0.0.1";
const previewPort = 4173;
const previewUrl = `http://${previewHost}:${previewPort}`;
const sourcePackPath = path.resolve(
  appDir,
  "..",
  "Packs",
  "copilot-ux-agent-pack",
);
const scratchTargetPath = fs.mkdtempSync(
  path.join(os.tmpdir(), "packman-e2e-"),
);

function spawnAndCollect(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: appDir,
      stdio: "inherit",
      shell: false,
      ...options,
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(
        new Error(
          `${command} ${args.join(" ")} failed with exit code ${code ?? -1}`,
        ),
      );
    });
  });
}

function createEarlyExitPromise(child, processName) {
  return new Promise((_, reject) => {
    child.once("exit", (code) => {
      reject(
        new Error(
          `${processName} exited before becoming ready (exit code ${code ?? -1})`,
        ),
      );
    });
    child.once("error", (error) => {
      reject(error);
    });
  });
}

function waitForPort(port, host, timeoutMs) {
  const startedAt = Date.now();

  return new Promise((resolve, reject) => {
    const tick = () => {
      const socket = new net.Socket();
      socket.setTimeout(1000);

      socket.once("connect", () => {
        socket.destroy();
        resolve();
      });

      const retry = () => {
        socket.destroy();
        if (Date.now() - startedAt > timeoutMs) {
          reject(new Error(`Timed out waiting for ${host}:${port}`));
          return;
        }
        setTimeout(tick, 250);
      };

      socket.once("timeout", retry);
      socket.once("error", retry);
      socket.connect(port, host);
    };

    tick();
  });
}

async function main() {
  await spawnAndCollect("pnpm", ["run", "build"], {
    cwd: appDir,
  });

  const preview = spawn(
    "pnpm",
    [
      "exec",
      "vite",
      "preview",
      "--host",
      previewHost,
      "--port",
      String(previewPort),
      "--strictPort",
    ],
    {
      cwd: appDir,
      stdio: ["ignore", "pipe", "pipe"],
      env: {
        ...process.env,
      },
    },
  );

  let previewLogs = "";
  preview.stdout?.on("data", (chunk) => {
    const text = String(chunk);
    previewLogs += text;
    process.stdout.write(text);
  });
  preview.stderr?.on("data", (chunk) => {
    const text = String(chunk);
    previewLogs += text;
    process.stderr.write(text);
  });

  const stopPreview = () => {
    if (!preview.killed) {
      preview.kill("SIGTERM");
    }
  };

  process.on("SIGINT", () => {
    stopPreview();
    process.exit(130);
  });
  process.on("SIGTERM", () => {
    stopPreview();
    process.exit(143);
  });

  try {
    await Promise.race([
      waitForPort(previewPort, previewHost, 30000),
      createEarlyExitPromise(preview, "vite preview"),
    ]);

    if (/EADDRINUSE|address already in use/i.test(previewLogs)) {
      throw new Error(
        `Port ${previewPort} is already in use. Stop the existing process and retry.`,
      );
    }

    const browser = await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage();
      await runKitchenSinkE2E(page, {
        previewUrl,
        sourcePackPath,
        scratchTargetPath,
      });

      const hasHomeCards = await page
        .locator('[data-testid="home-actions"] [data-testid^="home-"]')
        .count();
      assert.ok(hasHomeCards >= 3, "expected home cards to render");
    } finally {
      await browser.close();
    }
  } finally {
    stopPreview();
    fs.rmSync(scratchTargetPath, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
