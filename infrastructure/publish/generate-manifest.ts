import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import glob from "fast-glob";

interface ArtifactInfo {
  source: string;
  sourceSha256: string;
  sourceSig: string;
  packageJson: string;
  packageJsonSha256: string;
  packageJsonSig: string;
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
    const sourceName = `${id}-${pkg.version}.js`;
    const bundlePath = path.join(experimentDir, "dist", "index.js");
    const packageJsonName = `${id}-${pkg.version}.package.json`;
    const runtimePackageJsonPath = path.join(experimentDir, "dist", "package.json");

    if (!fs.existsSync(bundlePath)) {
      throw new Error(`Bundle not found: ${bundlePath}`);
    }

    if (!fs.existsSync(runtimePackageJsonPath)) {
      throw new Error(`Runtime package.json not found: ${runtimePackageJsonPath} (run generate-package-json first)`);
    }

    experiments.push({
      id,
      name,
      description,
      version: pkg.version,
      terminationUtcDateTime,
      artifact: {
        source: sourceName,
        sourceSha256: sha256(bundlePath),
        sourceSig: `${sourceName}.sig`,
        packageJson: packageJsonName,
        packageJsonSha256: sha256(runtimePackageJsonPath),
        packageJsonSig: `${packageJsonName}.sig`,
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