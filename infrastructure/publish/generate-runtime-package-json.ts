import fs from "node:fs";
import path from "node:path";
import glob from "fast-glob";

async function main() {
  const experimentsRoot = path.resolve(__dirname, "..", "..", "experiments");
  const packageJsonPaths = await glob("*/package.json", {
    cwd: experimentsRoot,
    ignore: ["_template/**"],
  });

  for (const p of packageJsonPaths) {
    const fullPath = path.join(experimentsRoot, p);
    const pkg = JSON.parse(fs.readFileSync(fullPath, "utf8"));
    const experimentDir = path.dirname(fullPath);

    if (!pkg.experiment) {
      console.warn(`Skipping ${p}: no experiment metadata`);
      continue;
    }

    const distDir = path.join(experimentDir, "dist");

    if (!fs.existsSync(distDir)) {
      console.warn(`Skipping ${p}: dist/ not found (run build first)`);
      continue;
    }

    const runtimePackageJson = {
      name: pkg.name,
      version: pkg.version,
      main: "./index.js",
    };

    const outputPath = path.join(distDir, "package.json");
    fs.writeFileSync(outputPath, JSON.stringify(runtimePackageJson, null, 2), "utf8");
    console.log(`Generated: ${outputPath}`);
  }
}

main().catch((err) => {
  console.error("Runtime package.json generation failed:", err);
  process.exit(1);
});