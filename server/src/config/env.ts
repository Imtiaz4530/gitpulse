import dotenv from "dotenv";

dotenv.config();

const requiredEnv = ["MONGODB_URI", "CLIENT_URL", "JWT_SECRET"] as const;

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

  jwtSecret: process.env.JWT_SECRET!,

  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
};
