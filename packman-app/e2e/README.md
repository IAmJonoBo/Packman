# Tauri E2E (WebdriverIO + tauri-driver)

This project uses **official Tauri WebDriver automation** with:

- `tauri-driver`
- `WebdriverIO`

## What is covered

`e2e/kitchen-sink.e2e.spec.mjs` validates release-readiness by covering:

- UI shell/control presence checks
- guardrail error paths (missing required source/target inputs)
- end-to-end command flow with realistic paths:
  - validate
  - normalize preview
  - install plan (dry-run)
  - install dry-run
  - doctor
  - readiness
  - registry
- output JSON health checks (no `error` payloads)
- collision summary rendering presence

## Run locally

From `packman-app`:

```bash
pnpm run test:e2e
```

This command:

1. ensures `tauri-driver` is installed,
2. builds the debug Tauri app binary,
3. starts `tauri-driver` on port `4444`,
4. runs `wdio` against the app binary.

## Platform caveat

If `tauri-driver` prints `not supported on this platform`, the suite cannot execute on that host.
Run the same command on a supported local/CI runner.
