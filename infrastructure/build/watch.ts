import path from "node:path";
import glob from "fast-glob";
import { watchExperiment } from "./esbuild.config";

async function main() {
  const args = process.argv.slice(2);
  const specificExperiment = args[0];

  const experimentsRoot = path.resolve(__dirname, "..", "..", "experiments");
  const packageJsonPaths = await glob("*/package.json", {
    cwd: experimentsRoot,
    ignore: ["_template/**"],
  });

  const experiments = packageJsonPaths
    .map((p) => ({
      name: path.dirname(p),
      dir: path.join(experimentsRoot, path.dirname(p)),
    }))
    .filter((e) => !specificExperiment || e.name === specificExperiment);

  if (experiments.length === 0) {
    console.error(specificExperiment ? `Experiment not found: ${specificExperiment}` : "No experiments found");
    process.exit(1);
  }

  for (const experiment of experiments) {
    await watchExperiment({ experimentDir: experiment.dir });
  }

  console.log("\nWatching for changes. Press Ctrl+C to stop.");
}

main().catch((err) => {
  console.error("Watch failed:", err);
  process.exit(1);
});
