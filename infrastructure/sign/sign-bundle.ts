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

  const filePaths = await glob("*/dist/{*.js,package.json}", {
    cwd: experimentsRoot,
    ignore: ["_template/**"],
  });

  if (filePaths.length === 0) {
    console.error("No files found. Run `npm run build` and `npm run generate-package-json` first.");
    process.exit(1);
  }

  for (const filePath of filePaths) {
    const fullPath = path.join(experimentsRoot, filePath);
    const content = fs.readFileSync(fullPath);
    const signature = crypto.sign(null, content, privateKey);
    const sigPath = `${fullPath}.sig`;

    fs.writeFileSync(sigPath, signature.toString("base64"), "utf8");
    console.log(`Signed: ${filePath} → ${filePath}.sig`);
  }

  console.log(`\nSigned ${filePaths.length} file(s)`);
}

main().catch((err) => {
  console.error("Signing failed:", err);
  process.exit(1);
});