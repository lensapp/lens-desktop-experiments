import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import glob from "fast-glob";

async function main() {
  const privateKeyPem = process.env.EXPERIMENT_SIGNING_PRIVATE_KEY;

  if (!privateKeyPem) {
    console.error("EXPERIMENT_SIGNING_PRIVATE_KEY environment variable is required");
    process.exit(1);
  }

  const privateKey = crypto.createPrivateKey(privateKeyPem);
  const experimentsRoot = path.resolve(__dirname, "..", "..", "experiments");

  const bundlePaths = await glob("*/dist/*.js", {
    cwd: experimentsRoot,
    ignore: ["_template/**"],
  });

  if (bundlePaths.length === 0) {
    console.error("No bundles found. Run `npm run build` first.");
    process.exit(1);
  }

  for (const bundlePath of bundlePaths) {
    const fullPath = path.join(experimentsRoot, bundlePath);
    const content = fs.readFileSync(fullPath);
    const signature = crypto.sign(null, content, privateKey);
    const sigPath = `${fullPath}.sig`;

    fs.writeFileSync(sigPath, signature.toString("base64"), "utf8");
    console.log(`Signed: ${bundlePath} → ${bundlePath}.sig`);
  }

  console.log(`\nSigned ${bundlePaths.length} bundle(s)`);
}

main().catch((err) => {
  console.error("Signing failed:", err);
  process.exit(1);
});