import crypto from "node:crypto";

const { publicKey, privateKey } = crypto.generateKeyPairSync("ed25519", {
  publicKeyEncoding: { type: "spki", format: "pem" },
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
});

console.log("=== PUBLIC KEY (embed in monorepo for verification) ===\n");
console.log(publicKey);
console.log("=== PRIVATE KEY (store as EXPERIMENT_SIGNING_PRIVATE_KEY GitHub secret) ===\n");
console.log(privateKey);
