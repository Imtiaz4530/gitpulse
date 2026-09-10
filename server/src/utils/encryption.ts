import { createCipheriv, createDecipheriv, randomBytes } from "crypto";
import { env } from "../config/env";

const ALGORITHM = "aes-256-gcm";

function getEncryptionKey() {
  const key = Buffer.from(env.githubTokenEncryptionKey, "hex");

  if (key.length !== 32) {
    throw new Error("GITHUB_TOKEN_ENCRYPTION_KEY must be a 32-byte hex key");
  }

  return key;
}

export function encryptToken(token: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(12);

  const cipher = createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(token, "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return [
    iv.toString("hex"),
    authTag.toString("hex"),
    encrypted.toString("hex"),
  ].join(":");
}

export function decryptToken(encryptedToken: string): string {
  const [ivHex, authTagHex, encryptedHex] = encryptedToken.split(":");

  if (!ivHex || !authTagHex || !encryptedHex) {
    throw new Error("Invalid encrypted token format");
  }

  const key = getEncryptionKey();

  const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(ivHex, "hex"));

  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, "hex")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}
