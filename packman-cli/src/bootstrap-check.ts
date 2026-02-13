import chalk from "chalk";
import ora from "ora";
import { z } from "zod";

async function main() {
  console.log(chalk.green("✔ CLI Bootstrap Check Initiated"));

  const spinner = ora("Checking environment...").start();
  await new Promise((resolve) => setTimeout(resolve, 1000));
  spinner.succeed("Environment verified");

  const Schema = z.object({
    status: z.string(),
  });

  const data = Schema.parse({ status: "ready" });
  console.log(chalk.blue(`ℹ System status: ${data.status}`));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
