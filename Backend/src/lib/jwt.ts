import jwt from "jsonwebtoken";
import { readFileSync } from "fs";
import { join } from "path";

const KEYS_DIR = join(process.cwd(), "keys");
const PRIVATE_KEY_PATH = join(KEYS_DIR, "private-key.pem");
const PUBLIC_KEY_PATH = join(KEYS_DIR, "public-key.pem");

let privateKey: string | null = null;
let publicKey: string | null = null;

function loadPrivateKey(): string {
  if (!privateKey) {
    try {
      privateKey = readFileSync(PRIVATE_KEY_PATH, "utf-8");
    } catch {
      throw new Error(
        `Failed to load private key from ${PRIVATE_KEY_PATH}. Run: npm run generate-keys`
      );
    }
  }
  return privateKey;
}

function loadPublicKey(): string {
  if (!publicKey) {
    try {
      publicKey = readFileSync(PUBLIC_KEY_PATH, "utf-8");
    } catch {
      throw new Error(
        `Failed to load public key from ${PUBLIC_KEY_PATH}. Run: npm run generate-keys`
      );
    }
  }
  return publicKey;
}

export interface JWTPayload {
  userId: string;
  email?: string;
  iat?: number;
  exp?: number;
}

export function signToken(
  payload: Omit<JWTPayload, "iat" | "exp">,
  expiresIn: string = "7d"
): string {
  const privateKey = loadPrivateKey();
  return jwt.sign(payload, privateKey, {
    algorithm: "RS256",
    expiresIn,
  } as jwt.SignOptions);
}

export function verifyToken(token: string): JWTPayload {
  const publicKey = loadPublicKey();
  try {
    const decoded = jwt.verify(token, publicKey, {
      algorithms: ["RS256"],
    }) as JWTPayload;
    return decoded;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "TokenExpiredError") {
        throw new Error("Token has expired");
      }
      if (error.name === "JsonWebTokenError") {
        throw new Error("Invalid token signature");
      }
      throw new Error(`Token verification failed: ${error.message}`);
    }
    throw new Error("Token verification failed");
  }
}

export function isJWT(token: string): boolean {
  const parts = token.split(".");
  return parts.length === 3 && parts.every((part) => part.length > 0);
}
