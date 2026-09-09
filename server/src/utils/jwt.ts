import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

interface AccessTokenPayload {
  sub: string;
  type: "access";
}

interface RefreshTokenPayload {
  sub: string;
  sessionId: string;
  type: "refresh";
}

export const createAccessToken = (userId: string): string => {
  return jwt.sign(
    {
      sub: userId,
      type: "access",
    },
    env.accessTokenSecret,
    {
      expiresIn: env.accessTokenExpiresIn,
    },
  );
};

export const createRefreshToken = (
  userId: string,
  sessionId: string,
): string => {
  return jwt.sign(
    {
      sub: userId,
      sessionId,
      type: "refresh",
    },
    env.refreshTokenSecret,
    {
      expiresIn: env.refreshTokenExpiresIn,
    },
  );
};

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  const decoded = jwt.verify(
    token,
    env.accessTokenSecret,
  ) as AccessTokenPayload;

  if (decoded.type !== "access") {
    throw new Error("Invalid access token");
  }

  return decoded;
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  const decoded = jwt.verify(
    token,
    env.refreshTokenSecret,
  ) as RefreshTokenPayload;

  if (decoded.type !== "refresh") {
    throw new Error("Invalid refresh token");
  }

  return decoded;
};
