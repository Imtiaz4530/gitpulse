import { createHash, randomBytes } from "crypto";

export function generateOAuthState(): string {
  return randomBytes(32).toString("hex");
}

export function hashOAuthState(state: string): string {
  return createHash("sha256").update(state).digest("hex");
}
