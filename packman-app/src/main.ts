import { open, save } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";

const sourcePathLabel =
  document.querySelector<HTMLParagraphElement>("#source-path");
const targetPathLabel =
  document.querySelector<HTMLParagraphElement>("#target-path");
const output = document.querySelector<HTMLPreElement>("#output");
const strictToggle = document.querySelector<HTMLInputElement>("#strict-toggle");
const collisionMode =
  document.querySelector<HTMLSelectElement>("#collision-mode");
const collisionDecisions = document.querySelector<HTMLTextAreaElement>(
  "#collision-decisions",
);
const collisionSummary =
  document.querySelector<HTMLDivElement>("#collision-summary");

let sourcePath = "";
let targetPath = "";

interface CollisionRow {
  relativePath: string;
  availableActions: string[];
}

function extractCollisions(payload: unknown): CollisionRow[] {
  if (!payload || typeof payload !== "object") {
    return [];
  }

  const report = payload as {
    output?: { plans?: Array<{ collisions?: Array<unknown> }> };
  };
  const plans = report.output?.plans;
  if (!Array.isArray(plans)) {
    return [];
  }

  const rows: CollisionRow[] = [];
  for (const plan of plans) {
    if (!plan || !Array.isArray(plan.collisions)) {
      continue;
    }

    for (const collision of plan.collisions) {
      if (!collision || typeof collision !== "object") {
        continue;
      }

      const entry = collision as {
        relativePath?: unknown;
        availableActions?: unknown;
      };
      if (typeof entry.relativePath !== "string") {
        continue;
      }

      rows.push({
        relativePath: entry.relativePath,
        availableActions: Array.isArray(entry.availableActions)
          ? entry.availableActions.filter(
              (item): item is string => typeof item === "string",
            )
          : [],
      });
    }
  }

  return rows;
}

function renderCollisionSummary(payload: unknown): void {
  if (!collisionSummary) {
    return;
  }

  const rows = extractCollisions(payload);
  if (rows.length === 0) {
    collisionSummary.textContent = "No collisions in current plan.";
    return;
  }

  const header =
    "<table><thead><tr><th>Path</th><th>Actions</th></tr></thead><tbody>";
  const body = rows
    .map(
      (row) =>
        `<tr><td>${row.relativePath}</td><td>${row.availableActions.join(", ")}</td></tr>`,
    )
    .join("");
  const footer = "</tbody></table>";
  collisionSummary.innerHTML = `${header}${body}${footer}`;
}

function setOutput(payload: unknown): void {
  if (!output) {
    return;
  }

  output.textContent = JSON.stringify(payload, null, 2);
  renderCollisionSummary(payload);
}

async function pickDirectory(kind: "source" | "target"): Promise<void> {
  const selection = await open({
    directory: true,
    multiple: false,
    title:
      kind === "source"
        ? "Select source pack folder"
        : "Select install target folder",
  });

  if (!selection || Array.isArray(selection)) {
    return;
  }

  if (kind === "source") {
    sourcePath = selection;
    if (sourcePathLabel) {
      sourcePathLabel.textContent = sourcePath;
    }
  } else {
    targetPath = selection;
    if (targetPathLabel) {
      targetPathLabel.textContent = targetPath;
    }
  }
}

async function runGuarded<T>(operation: () => Promise<T>): Promise<void> {
  try {
    const result = await operation();
    setOutput(result);
  } catch (error) {
    setOutput({ error: String(error) });
  }
}

async function runPackman(command: string, args: string[]): Promise<unknown> {
  return invoke("run_packman", { command, args });
}

document
  .querySelector<HTMLButtonElement>("#pick-source")
  ?.addEventListener("click", () => {
    void pickDirectory("source");
  });

document
  .querySelector<HTMLButtonElement>("#pick-target")
  ?.addEventListener("click", () => {
    void pickDirectory("target");
  });

document
  .querySelector<HTMLButtonElement>("#save-decisions")
  ?.addEventListener("click", () => {
    void runGuarded(async () => {
      const decisionsRaw = collisionDecisions?.value?.trim();
      if (!decisionsRaw) {
        throw new Error("Collision decisions JSON is empty");
      }

      const parsed = JSON.parse(decisionsRaw) as unknown;
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error("Collision decisions must be a JSON object");
      }

      const destination = await save({
        title: "Save collision decisions",
        defaultPath: "collision-decisions.json",
        filters: [{ name: "JSON", extensions: ["json"] }],
      });

      if (!destination) {
        return { saved: false };
      }

      await writeTextFile(destination, `${JSON.stringify(parsed, null, 2)}\n`);
      return { saved: true, path: destination };
    });
  });

document
  .querySelector<HTMLButtonElement>("#load-decisions")
  ?.addEventListener("click", () => {
    void runGuarded(async () => {
      const selected = await open({
        directory: false,
        multiple: false,
        title: "Load collision decisions",
        filters: [{ name: "JSON", extensions: ["json"] }],
      });

      if (!selected || Array.isArray(selected)) {
        return { loaded: false };
      }

      const content = await readTextFile(selected);
      const parsed = JSON.parse(content) as unknown;
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error(
          "Loaded collision decisions file must contain a JSON object",
        );
      }

      if (collisionDecisions) {
        collisionDecisions.value = JSON.stringify(parsed, null, 2);
      }

      return {
        loaded: true,
        path: selected,
        keys: Object.keys(parsed as Record<string, unknown>).length,
      };
    });
  });

document
  .querySelector<HTMLButtonElement>("#validate-btn")
  ?.addEventListener("click", () => {
    void runGuarded(async () => {
      if (!sourcePath) {
        throw new Error("Select source folder first");
      }

      const args = [sourcePath];
      if (strictToggle?.checked) {
        args.push("--strict");
      }
      if (targetPath) {
        args.push("--target", targetPath);
      }
      args.push("--suite", "--json");
      return runPackman("validate", args);
    });
  });

document
  .querySelector<HTMLButtonElement>("#normalize-preview-btn")
  ?.addEventListener("click", () => {
    void runGuarded(async () => {
      if (!sourcePath) {
        throw new Error("Select source folder first");
      }

      return runPackman("normalize", [sourcePath, "--json"]);
    });
  });

document
  .querySelector<HTMLButtonElement>("#install-dry-run")
  ?.addEventListener("click", () => {
    void runGuarded(async () => {
      if (!sourcePath || !targetPath) {
        throw new Error("Select source and target folders first");
      }

      const mode = collisionMode?.value ?? "fail";
      const decisionsRaw = collisionDecisions?.value?.trim();

      const args = [
        sourcePath,
        "--target",
        "workspace",
        "--path",
        targetPath,
        "--suite",
        "--dry-run",
        "--on-collision",
        mode,
        "--json",
      ];

      if (decisionsRaw) {
        args.push("--collision-decisions-json", decisionsRaw);
      }

      return runPackman("install", args);
    });
  });

document
  .querySelector<HTMLButtonElement>("#install-plan")
  ?.addEventListener("click", () => {
    void runGuarded(async () => {
      if (!sourcePath || !targetPath) {
        throw new Error("Select source and target folders first");
      }

      const mode = collisionMode?.value ?? "fail";
      const decisionsRaw = collisionDecisions?.value?.trim();

      const args = [
        sourcePath,
        "--target",
        "workspace",
        "--path",
        targetPath,
        "--suite",
        "--dry-run",
        "--on-collision",
        mode,
        "--json",
      ];

      if (decisionsRaw) {
        args.push("--collision-decisions-json", decisionsRaw);
      }

      return runPackman("install", args);
    });
  });

document
  .querySelector<HTMLButtonElement>("#install-apply")
  ?.addEventListener("click", () => {
    void runGuarded(async () => {
      if (!sourcePath || !targetPath) {
        throw new Error("Select source and target folders first");
      }

      const mode = collisionMode?.value ?? "fail";
      const decisionsRaw = collisionDecisions?.value?.trim();

      const args = [
        sourcePath,
        "--target",
        "workspace",
        "--path",
        targetPath,
        "--suite",
        "--on-collision",
        mode,
        "--json",
      ];

      if (decisionsRaw) {
        args.push("--collision-decisions-json", decisionsRaw);
      }

      return runPackman("install", args);
    });
  });

document
  .querySelector<HTMLButtonElement>("#doctor-btn")
  ?.addEventListener("click", () => {
    void runGuarded(async () => {
      if (!targetPath) {
        throw new Error("Select target folder first");
      }

      return runPackman("doctor", [targetPath, "--json"]);
    });
  });

document
  .querySelector<HTMLButtonElement>("#readiness-btn")
  ?.addEventListener("click", () => {
    void runGuarded(async () => {
      if (!targetPath) {
        throw new Error("Select target folder first");
      }

      return runPackman("readiness", [targetPath, "--json"]);
    });
  });

document
  .querySelector<HTMLButtonElement>("#registry-btn")
  ?.addEventListener("click", () => {
    void runGuarded(async () => {
      if (!targetPath) {
        throw new Error("Select target folder first");
      }

      return runPackman("registry", [targetPath, "--json"]);
    });
  });

void invoke("set_persist_scopes", { enabled: false }).catch(() => {
  // no-op for first load if backend not ready
});
