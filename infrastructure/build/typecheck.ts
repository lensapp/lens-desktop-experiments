import path from "node:path";
import { execSync } from "node:child_process";
import glob from "fast-glob";

async function main() {
  const experimentsRoot = path.resolve(__dirname, "..", "..", "experiments");
  const tsconfigPaths = await glob("*/tsconfig.json", {
    cwd: experimentsRoot,
    ignore: ["_template/**"],
  });

  let hasErrors = false;

  for (const tsconfigPath of tsconfigPaths) {
    const experimentDir = path.join(experimentsRoot, path.dirname(tsconfigPath));
    const experimentName = path.dirname(tsconfigPath);

    console.log(`Type-checking: ${experimentName}`);

    try {
      execSync("npx tsc --noEmit", {
        cwd: experimentDir,
        stdio: "inherit",
      });
    } catch {
      hasErrors = true;
    }
  }

  if (hasErrors) {
    console.error("\nType-check failed for one or more experiments");
    process.exit(1);
  }

  console.log("\nAll experiments type-checked successfully");
}

main().catch((err) => {
  console.error("Type-check failed:", err);
  process.exit(1);
});
