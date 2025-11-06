import { generateKeyPairSync } from "crypto";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const KEYS_DIR = join(process.cwd(), "keys");

mkdirSync(KEYS_DIR, { recursive: true });

const { privateKey, publicKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: "spki",
    format: "pem",
  },
  privateKeyEncoding: {
    type: "pkcs8",
    format: "pem",
  },
});

const privateKeyPath = join(KEYS_DIR, "private-key.pem");
const publicKeyPath = join(KEYS_DIR, "public-key.pem");

writeFileSync(privateKeyPath, privateKey);
writeFileSync(publicKeyPath, publicKey);

console.log("✅ RSA key pair generated successfully!");
console.log(`📝 Private key: ${privateKeyPath}`);
console.log(`📝 Public key: ${publicKeyPath}`);
console.log(
  "\n⚠️  Keep the private key secure! Do not commit it to version control."
);
console.log("✅ The public key is safe to share (it's used for verification).");
