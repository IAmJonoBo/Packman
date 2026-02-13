import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const workspaceRoot = path.resolve(process.cwd(), "..");
const sourcePackPath = path.resolve(
  workspaceRoot,
  "Packs",
  "copilot-ux-agent-pack",
);
const scratchTargetPath = fs.mkdtempSync(
  path.join(os.tmpdir(), "packman-e2e-"),
);

async function readOutputJson() {
  const output = await browser.$("#output");
  const text = await output.getText();
  return JSON.parse(text);
}

async function clickAndReadOutput(buttonSelector) {
  const output = await browser.$("#output");
  const previous = await output.getText();

  await (await browser.$(buttonSelector)).click();

  await browser.waitUntil(async () => (await output.getText()) !== previous, {
    timeout: 180000,
    interval: 250,
    timeoutMsg: `Output did not change for ${buttonSelector}`,
  });

  return readOutputJson();
}

describe("Packman Tauri kitchen-sink", () => {
  after(() => {
    fs.rmSync(scratchTargetPath, { recursive: true, force: true });
  });

  it("renders all primary controls", async () => {
    assert.equal(await (await browser.$("h1")).getText(), "Packman");

    const ids = [
      "#pick-source",
      "#validate-btn",
      "#normalize-preview-btn",
      "#pick-target",
      "#install-plan",
      "#install-dry-run",
      "#install-apply",
      "#doctor-btn",
      "#readiness-btn",
      "#registry-btn",
      "#output",
      "#collision-summary",
    ];

    for (const id of ids) {
      assert.equal(
        await (await browser.$(id)).isExisting(),
        true,
        `missing ${id}`,
      );
    }
  });

  it("enforces guardrails before required path inputs", async () => {
    await browser.execute(() => {
      window.__PACKMAN_E2E__?.resetPaths();
    });

    const validate = await clickAndReadOutput("#validate-btn");
    assert.match(String(validate.error), /Select source folder first/);

    const install = await clickAndReadOutput("#install-dry-run");
    assert.match(
      String(install.error),
      /Select source and target folders first/,
    );

    const doctor = await clickAndReadOutput("#doctor-btn");
    assert.match(String(doctor.error), /Select target folder first/);
  });

  it("runs a comprehensive release-readiness flow", async () => {
    await browser.execute(
      (source, target) => {
        window.__PACKMAN_E2E__?.setPaths(source, target);
      },
      sourcePackPath,
      workspaceRoot,
    );

    const strictToggle = await browser.$("#strict-toggle");
    await strictToggle.click();
    assert.equal(await strictToggle.isSelected(), true);

    const validate = await clickAndReadOutput("#validate-btn");
    assert.equal(Boolean(validate.error), false, JSON.stringify(validate));

    const normalize = await clickAndReadOutput("#normalize-preview-btn");
    assert.equal(Boolean(normalize.error), false, JSON.stringify(normalize));

    await browser.execute(
      (source, target) => {
        window.__PACKMAN_E2E__?.setPaths(source, target);
      },
      sourcePackPath,
      scratchTargetPath,
    );

    const collisionMode = await browser.$("#collision-mode");
    await collisionMode.selectByAttribute("value", "rename");

    const installPlan = await clickAndReadOutput("#install-plan");
    assert.equal(
      Boolean(installPlan.error),
      false,
      JSON.stringify(installPlan),
    );

    const installDryRun = await clickAndReadOutput("#install-dry-run");
    assert.equal(
      Boolean(installDryRun.error),
      false,
      JSON.stringify(installDryRun),
    );

    await browser.execute(
      (source, target) => {
        window.__PACKMAN_E2E__?.setPaths(source, target);
      },
      sourcePackPath,
      workspaceRoot,
    );

    const doctor = await clickAndReadOutput("#doctor-btn");
    assert.equal(Boolean(doctor.error), false, JSON.stringify(doctor));

    const readiness = await clickAndReadOutput("#readiness-btn");
    assert.equal(Boolean(readiness.error), false, JSON.stringify(readiness));

    const registry = await clickAndReadOutput("#registry-btn");
    assert.equal(Boolean(registry.error), false, JSON.stringify(registry));

    const collisionSummary = await (
      await browser.$("#collision-summary")
    ).getText();
    assert.ok(collisionSummary.length > 0);
  });
});
