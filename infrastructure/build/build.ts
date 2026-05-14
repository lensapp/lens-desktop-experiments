import { loadExperiments, requireChannel } from "../experiments";
import { buildExperiment } from "./esbuild.config";

async function main() {
  const args = process.argv.slice(2);
  const experimentNameIndex = args.indexOf("--experiment");
  const specificExperiment = experimentNameIndex !== -1 ? args[experimentNameIndex + 1] : undefined;

  const allExperiments = await loadExperiments();

  let experiments = allExperiments;
  if (specificExperiment) {
    experiments = allExperiments.filter((e) => e.name === specificExperiment);
    if (experiments.length === 0) {
      console.error(`Experiment not found: ${specificExperiment}`);
      process.exit(1);
    }
  } else if (process.env.CHANNEL) {
    const channel = requireChannel(process.env.CHANNEL);
    experiments = allExperiments.filter((e) => e.channels.includes(channel));
    if (experiments.length === 0) {
      console.error(`No experiments match channel "${channel}"`);
      process.exit(1);
    }
    console.log(`Channel "${channel}": building ${experiments.length} experiment(s)`);
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
