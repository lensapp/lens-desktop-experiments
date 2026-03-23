import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import glob from "fast-glob";

interface ArtifactInfo {
  file: string;
  sha256: string;
  sig: string;
}

interface ExperimentManifestEntry {
  id: string;
  name: string;
  description: string;
  version: string;
  terminationUtcDateTime: string;
  artifact: ArtifactInfo;
}

function sha256(filePath: string): string {
  const content = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(content).digest("hex");
}

async function main() {
  const experimentsRoot = path.resolve(__dirname, "..", "..", "experiments");
  const packageJsonPaths = await glob("*/package.json", {
    cwd: experimentsRoot,
    ignore: ["_template/**"],
  });

  const experiments: ExperimentManifestEntry[] = [];

  for (const p of packageJsonPaths) {
    const fullPath = path.join(experimentsRoot, p);
    const pkg = JSON.parse(fs.readFileSync(fullPath, "utf8"));
    const experimentDir = path.dirname(fullPath);

    if (!pkg.experiment) {
      console.warn(`Skipping ${p}: no experiment metadata`);
      continue;
    }

    const { id, name, description, terminationUtcDateTime } = pkg.experiment;
    const bundleName = `${id}-${pkg.version}.js`;
    const bundlePath = path.join(experimentDir, "dist", "index.js");

    if (!fs.existsSync(bundlePath)) {
      throw new Error(`Bundle not found: ${bundlePath}`);
    }

    experiments.push({
      id,
      name,
      description,
      version: pkg.version,
      terminationUtcDateTime,
      artifact: {
        file: bundleName,
        sha256: sha256(bundlePath),
        sig: `${bundleName}.sig`,
      },
    });

    console.log(`Added: ${id}@${pkg.version}`);
  }

  const distDir = path.resolve(__dirname, "..", "..", "dist");
  fs.mkdirSync(distDir, { recursive: true });

  const manifestPath = path.join(distDir, "manifest.json");
  fs.writeFileSync(manifestPath, JSON.stringify({ experiments }, null, 2), "utf8");
  console.log(`\nManifest written: ${manifestPath} (${experiments.length} experiment(s))`);
}

main().catch((err) => {
  console.error("Manifest generation failed:", err);
  process.exit(1);
});