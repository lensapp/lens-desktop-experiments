import path from "node:path";
import fs from "node:fs";
import glob from "fast-glob";
import { buildExperiment } from "./esbuild.config";

async function main() {
  const args = process.argv.slice(2);
  const experimentNameIndex = args.indexOf("--experiment");
  const specificExperiment = experimentNameIndex !== -1 ? args[experimentNameIndex + 1] : undefined;

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
    console.log(`\nBuilding experiment: ${experiment.name}`);
    await buildExperiment({ experimentDir: experiment.dir });
    console.log(`Built: ${experiment.name}`);
  }

  console.log(`\nAll experiments built successfully (${experiments.length})`);
}

main().catch((err) => {
  console.error("Build failed:", err);
  process.exit(1);
});
