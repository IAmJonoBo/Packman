import assert from "node:assert/strict";

async function click(page, selector) {
  await page.locator(selector).click();
}

async function expectVisible(page, selector) {
  await page.locator(selector).waitFor();
}

async function seedBridge(page, sourcePackPath, scratchTargetPath) {
  await page.evaluate(
    ({ source, target }) => {
      window.__PACKMAN_APP_E2E__?.reset();
      window.__PACKMAN_APP_E2E__?.setSourcePath(source);
      window.__PACKMAN_APP_E2E__?.setTargetPath(target);
      window.__PACKMAN_APP_E2E__?.setMockResponse("doctor", {
        ok: true,
        command: "doctor",
        checks: ["node", "tauri", "python"],
      });
      window.__PACKMAN_APP_E2E__?.setMockResponse("validate", {
        error: "Validation failed (mock)",
      });
      window.__PACKMAN_APP_E2E__?.setMockResponse("install", {
        ok: true,
        filesTouched: [
          ".github/prompts/example.prompt.md",
          ".github/instructions/example.instructions.md",
        ],
        plans: [
          {
            collisions: [
              { relativePath: ".github/prompts/example.prompt.md" },
              { relativePath: ".github/instructions/example.instructions.md" },
            ],
          },
        ],
      });
    },
    { source: sourcePackPath, target: scratchTargetPath },
  );
}

async function assertHome(page) {
  await expectVisible(page, '[data-testid="home-actions"]');
  await expectVisible(page, '[data-testid="home-import-card"]');
  await expectVisible(page, '[data-testid="home-doctor-card"]');
  await expectVisible(page, '[data-testid="home-workspaces-card"]');
  assert.equal(await page.locator("h1").first().innerText(), "Packman");
}

async function runDoctorFlow(page) {
  await click(page, '[data-testid="home-doctor-card"]');
  await expectVisible(page, '[data-testid="doctor-page"]');
  assert.equal(await page.locator("h1").first().innerText(), "System Doctor");

  await click(page, '[data-testid="doctor-run-check"]');
  await expectVisible(page, '[data-testid="doctor-placeholder"] pre');
  const output = await page
    .locator('[data-testid="doctor-placeholder"]')
    .innerText();
  assert.match(output, /"command":\s*"doctor"/);

  await click(page, '[data-testid="doctor-back-home"]');
  await assertHome(page);
}

async function runWorkspaceFlow(page, scratchTargetPath) {
  await click(page, '[data-testid="app-nav-workspaces"]');
  await expectVisible(page, '[data-testid="workspace-manager-page"]');

  await page.evaluate(() => {
    window.__PACKMAN_APP_E2E__?.setTargetPath(null);
  });
  await click(page, '[data-testid="workspace-create-trial"]');
  await page.locator("text=Select a parent folder first").waitFor();

  await page.evaluate((target) => {
    window.__PACKMAN_APP_E2E__?.setTargetPath(target);
  }, scratchTargetPath);
  await click(page, '[data-testid="workspace-create-trial"]');
  await page
    .locator("text=Trial workspace created and selected as install target.")
    .waitFor();

  await click(page, "text=Dismiss");
  await click(page, '[data-testid="app-nav-home"]');
  await assertHome(page);
}

async function runImportFlow(page) {
  await click(page, '[data-testid="home-import-card"]');
  await expectVisible(page, '[data-testid="wizard-step-select"]');
  await click(page, '[data-testid="wizard-select-source-card"]');
  await expectVisible(page, '[data-testid="wizard-selected-source"]');
  await click(page, '[data-testid="wizard-continue"]');

  await expectVisible(page, '[data-testid="wizard-step-validate"]');
  await click(page, '[data-testid="wizard-run-validation"]');
  await expectVisible(page, '[data-testid="wizard-validation-output"]');
  const validationOutput = await page
    .locator('[data-testid="wizard-validation-output"]')
    .innerText();
  assert.match(validationOutput, /Validation failed \(mock\)/);

  await page.evaluate(() => {
    window.__PACKMAN_APP_E2E__?.setMockResponse("validate", {
      ok: true,
      command: "validate",
    });
  });
  await click(page, '[data-testid="wizard-run-validation"]');

  await expectVisible(page, '[data-testid="wizard-step-config"]');
  const sourceValue = await page
    .locator('[data-testid="wizard-source-workspace"]')
    .inputValue();
  const targetValue = await page
    .locator('[data-testid="wizard-target-workspace"]')
    .inputValue();
  assert.ok(sourceValue.length > 0, "expected source path to be populated");
  assert.ok(targetValue.length > 0, "expected target path to be populated");

  await click(page, '[data-testid="wizard-config-back"]');
  await expectVisible(page, '[data-testid="wizard-step-validate"]');
  await click(page, '[data-testid="wizard-run-validation"]');
  await expectVisible(page, '[data-testid="wizard-step-config"]');

  await page
    .locator('[data-testid="wizard-collision-strategy"]')
    .selectOption({ value: "overwrite" });
  await click(page, '[data-testid="wizard-config-next"]');

  await expectVisible(page, '[data-testid="wizard-step-plan"]');
  await expectVisible(page, '[data-testid="wizard-plan-summary"]');
  await expectVisible(page, '[data-testid="wizard-execute-install"][disabled]');
  await click(page, '[data-testid="wizard-generate-plan"]');

  await page
    .locator('[data-testid="wizard-execute-install"]:not([disabled])')
    .waitFor();
  await page.locator("text=Plan Collisions").waitFor();
  await page.locator("text=2").first().waitFor();
  await click(page, '[data-testid="wizard-execute-install"]');

  await expectVisible(page, '[data-testid="wizard-step-install"]');
  await page.locator("text=Files touched: 2").waitFor();
  await click(page, '[data-testid="wizard-back-home"]');
}

export async function runKitchenSinkE2E(page, options) {
  const { previewUrl, sourcePackPath, scratchTargetPath } = options;
  await page.goto(previewUrl, { waitUntil: "networkidle" });

  await seedBridge(page, sourcePackPath, scratchTargetPath);
  await assertHome(page);
  await runDoctorFlow(page);
  await runWorkspaceFlow(page, scratchTargetPath);
  await runImportFlow(page);
  await assertHome(page);
}
