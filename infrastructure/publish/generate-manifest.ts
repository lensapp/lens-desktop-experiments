import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { loadExperiments, requireChannel } from "../experiments";

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
  const channel = requireChannel(process.env.CHANNEL);
  const allExperiments = await loadExperiments();
  const selected = allExperiments.filter((e) => e.channels.includes(channel));

  if (selected.length === 0) {
    throw new Error(`No experiments match channel "${channel}" — refusing to publish an empty manifest.`);
  }

  const experiments: ExperimentManifestEntry[] = [];

  for (const { dir, pkg } of selected) {
    const { id, name, description, terminationUtcDateTime } = pkg.experiment as unknown as {
      id: string;
      name: string;
      description: string;
      terminationUtcDateTime: string;
    };
    const version = pkg.version as string;
    const sourceName = `${id}-${version}.js`;
    const bundlePath = path.join(dir, "dist", "index.js");
    const packageJsonName = `${id}-${version}.package.json`;
    const runtimePackageJsonPath = path.join(dir, "dist", "package.json");

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
      version,
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

    console.log(`Added: ${id}@${version}`);
  }

  const distDir = path.resolve(__dirname, "..", "..", "dist");
  fs.mkdirSync(distDir, { recursive: true });

  const manifestPath = path.join(distDir, "manifest.json");
  fs.writeFileSync(manifestPath, JSON.stringify({ experiments }, null, 2), "utf8");
  console.log(`\nManifest written: ${manifestPath} (${experiments.length} experiment(s), channel "${channel}")`);
}

main().catch((err) => {
  console.error("Manifest generation failed:", err);
  process.exit(1);
});
