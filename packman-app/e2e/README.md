# App E2E (Playwright + Vite Preview)

This project uses a **Playwright browser smoke flow** with:

- `playwright`
- `vite preview`

## What is covered

`e2e/kitchen-sink.e2e.spec.mjs` validates the app shell and multi-page UI flow by covering:

- home screen rendering and primary action cards
- doctor page run-check output rendering and return-to-home behavior
- workspace manager create-trial success and guarded error behavior
- full import wizard progression across all steps:
  - select
  - validate (error + success)
  - config
  - plan
  - install
- step back/forward controls, disabled install gating, and completion return-to-home verification

For deterministic E2E behavior, the suite uses an app-internal `window.__PACKMAN_APP_E2E__` bridge to inject source path and mock validation responses.

## Run locally

From `packman-app`:

```bash
pnpm run test:e2e
```

This command:

1. builds the app,
2. starts `vite preview` on `127.0.0.1:4173`,
3. launches headless Chromium via Playwright,
4. runs the kitchen-sink UI smoke flow.

## Browser prerequisite

If Playwright browsers are not installed yet, run:

```bash
pnpm exec playwright install chromium
```
