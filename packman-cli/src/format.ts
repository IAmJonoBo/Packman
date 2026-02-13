import chalk from "chalk";
import { Issue } from "@packman/core";

export const format = {
  success: (msg: string) => console.log(`${chalk.green("✔")} ${msg}`),
  error: (msg: string) => console.error(`${chalk.red("✖")} ${msg}`),
  warning: (msg: string) => console.warn(`${chalk.yellow("⚠")} ${msg}`),
  info: (msg: string) => console.log(`${chalk.blue("ℹ")} ${msg}`),

  // Highlight variants
  path: (p: string) => chalk.cyan.underline(p),
  code: (c: string) => chalk.magenta(c),
  bold: (t: string) => chalk.bold(t),

  // Issue formatter
  issues: (issues: Issue[]) => {
    if (issues.length === 0) return;

    console.log("");
    issues.forEach((issue) => {
      const icon =
        issue.severity === "error" ? chalk.red("✖") : chalk.yellow("⚠");
      const loc = issue.path ? ` ${chalk.cyan(issue.path)}` : "";
      console.log(`  ${icon} ${issue.message}${loc}`);
    });
    console.log("");
  },

  // Header for sections
  header: (title: string) => {
    console.log(`\n${chalk.bold.underline(title)}\n`);
  },

  json: (data: unknown) => {
    console.log(JSON.stringify(data, null, 2));
  },
};
