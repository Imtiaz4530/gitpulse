import dotenv from "dotenv";

dotenv.config();

const githubTokenEncryptionKey = process.env.GITHUB_TOKEN_ENCRYPTION_KEY;
if (
  !githubTokenEncryptionKey ||
  !/^[0-9a-fA-F]{64}$/.test(githubTokenEncryptionKey)
) {
  throw new Error("GITHUB_TOKEN_ENCRYPTION_KEY must be a 32-byte hex key");
}

const requiredEnv = [
  "MONGODB_URI",
  "CLIENT_URL",
  "ACCESS_TOKEN_SECRET",
  "REFRESH_TOKEN_SECRET",
  "GITHUB_CLIENT_ID",
  "GITHUB_CLIENT_SECRET",
  "GITHUB_OAUTH_CALLBACK_URL",
  "REDIS_URL",
] as const;

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",

  port: Number(process.env.PORT ?? 5000),

  mongodbUri: process.env.MONGODB_URI!,

  clientUrl: process.env.CLIENT_URL!,

  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET!,

  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET!,

  accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN ?? "15m",

  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN ?? "7d",

  cookieSecure: process.env.COOKIE_SECURE === "true",

  githubClientId: process.env.GITHUB_CLIENT_ID!,
  githubClientSecret: process.env.GITHUB_CLIENT_SECRET!,
  githubOAuthCallbackUrl: process.env.GITHUB_OAUTH_CALLBACK_URL!,

  githubTokenEncryptionKey,

  redisUrl: process.env.REDIS_URL!,
};
