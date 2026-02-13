import { spawn } from "node:child_process";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appDir = path.resolve(__dirname, "..");
const appBinary = path.resolve(
  appDir,
  "src-tauri",
  "target",
  "debug",
  "packman-app",
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

async function ensureTauriDriver() {
  try {
    await spawnAndCollect("tauri-driver", ["--help"]);
  } catch {
    await spawnAndCollect("cargo", ["install", "tauri-driver", "--locked"]);
  }
}

async function main() {
  await ensureTauriDriver();
  await spawnAndCollect("cargo", ["build"], {
    cwd: path.resolve(appDir, "src-tauri"),
  });

  const driver = spawn("tauri-driver", ["--port", "4444"], {
    cwd: appDir,
    stdio: ["ignore", "pipe", "pipe"],
    env: {
      ...process.env,
      RUST_LOG: process.env.RUST_LOG ?? "tauri_driver=info",
      TAURI_AUTOMATION: "true",
    },
  });

  let driverLogs = "";
  driver.stdout?.on("data", (chunk) => {
    const text = String(chunk);
    driverLogs += text;
    process.stdout.write(text);
  });
  driver.stderr?.on("data", (chunk) => {
    const text = String(chunk);
    driverLogs += text;
    process.stderr.write(text);
  });

  const stopDriver = () => {
    if (!driver.killed) {
      driver.kill("SIGTERM");
    }
  };

  process.on("SIGINT", () => {
    stopDriver();
    process.exit(130);
  });
  process.on("SIGTERM", () => {
    stopDriver();
    process.exit(143);
  });

  try {
    await Promise.race([
      waitForPort(4444, "127.0.0.1", 30000),
      createEarlyExitPromise(driver, "tauri-driver"),
    ]);

    if (driverLogs.includes("not supported on this platform")) {
      throw new Error(
        "tauri-driver reported unsupported platform. Run this suite on a supported host/CI image.",
      );
    }

    await spawnAndCollect(
      "pnpm",
      ["exec", "wdio", "run", "./wdio.tauri.conf.mjs"],
      {
        cwd: appDir,
        env: {
          ...process.env,
          TAURI_E2E_APP_PATH: appBinary,
          TAURI_AUTOMATION: "true",
        },
      },
    );
  } finally {
    stopDriver();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
