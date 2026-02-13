import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const appPath =
  process.env.TAURI_E2E_APP_PATH ??
  path.resolve(__dirname, "src-tauri", "target", "debug", "packman-app");

export const config = {
  runner: "local",
  specs: ["./e2e/**/*.spec.mjs"],
  maxInstances: 1,
  hostname: "127.0.0.1",
  port: 4444,
  path: "/",
  logLevel: "info",
  bail: 0,
  waitforTimeout: 20000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 2,
  framework: "mocha",
  mochaOpts: {
    ui: "bdd",
    timeout: 180000,
  },
  reporters: ["spec"],
  capabilities: [
    {
      "tauri:options": {
        application: appPath,
      },
    },
  ],
};
