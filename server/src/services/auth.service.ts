import User from "../models/User.js";
import Session from "../models/Session.js";

import { comparePassword, hashPassword } from "../utils/password.js";

import {
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";

import { hashToken } from "../utils/token.js";

import { AppError } from "../utils/AppError.js";

import { env } from "../config/env.js";
import { parseDurationToMs } from "../utils/duration.js";

interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface SessionMetadata {
  userAgent?: string;
  ipAddress?: string;
}

const getSessionExpiration = (): Date => {
  return new Date(Date.now() + parseDurationToMs(env.refreshTokenExpiresIn));
};

const createSession = async (userId: string, metadata: SessionMetadata) => {
  const session = await Session.create({
    userId,

    refreshTokenHash: "pending",

    expiresAt: getSessionExpiration(),

    userAgent: metadata.userAgent,

    ipAddress: metadata.ipAddress,
  });

  const refreshToken = createRefreshToken(userId, session.id);

  session.refreshTokenHash = hashToken(refreshToken);

  await session.save();

  return {
    session,
    refreshToken,
  };
};

export const registerUser = async (
  input: RegisterInput,
  metadata: SessionMetadata,
) => {
  const email = input.email.toLowerCase().trim();

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new AppError(
      "An account with this email already exists",
      409,
      "EMAIL_ALREADY_EXISTS",
    );
  }

  const passwordHash = await hashPassword(input.password);

  const user = await User.create({
    name: input.name.trim(),
    email,
    passwordHash,
  });

  const { refreshToken } = await createSession(user.id, metadata);

  const accessToken = createAccessToken(user.id);

  return {
    user,
    accessToken,
    refreshToken,
  };
};

export const loginUser = async (
  input: LoginInput,
  metadata: SessionMetadata,
) => {
  const email = input.email.toLowerCase().trim();

  const user = await User.findOne({ email }).select("+passwordHash");

  if (!user) {
    throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
  }

  const passwordValid = await comparePassword(
    input.password,
    user.passwordHash,
  );

  if (!passwordValid) {
    throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
  }

  const { refreshToken } = await createSession(user.id, metadata);

  const accessToken = createAccessToken(user.id);

  return {
    user,
    accessToken,
    refreshToken,
  };
};

export const refreshUserSession = async (
  refreshToken: string,
  metadata: SessionMetadata,
) => {
  let payload;

  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError(
      "Invalid or expired refresh token",
      401,
      "INVALID_REFRESH_TOKEN",
    );
  }

  const session = await Session.findOne({
    _id: payload.sessionId,
    userId: payload.sub,
    revokedAt: null,
  });

  if (!session) {
    throw new AppError("Invalid session", 401, "INVALID_SESSION");
  }

  if (session.expiresAt.getTime() < Date.now()) {
    throw new AppError("Session expired", 401, "SESSION_EXPIRED");
  }

  const tokenHash = hashToken(refreshToken);

  if (tokenHash !== session.refreshTokenHash) {
    await Session.findByIdAndUpdate(session.id, {
      revokedAt: new Date(),
    });

    throw new AppError("Invalid session", 401, "INVALID_SESSION");
  }

  /*
   * Refresh-token rotation:
   * Revoke the old session before
   * creating a new one.
   */
  await Session.findByIdAndUpdate(session.id, {
    revokedAt: new Date(),
  });

  const { refreshToken: newRefreshToken } = await createSession(
    payload.sub,
    metadata,
  );

  const accessToken = createAccessToken(payload.sub);

  return {
    accessToken,
    refreshToken: newRefreshToken,
  };
};

export const logoutUser = async (refreshToken: string) => {
  try {
    const payload = verifyRefreshToken(refreshToken);

    await Session.findOneAndUpdate(
      {
        _id: payload.sessionId,
        userId: payload.sub,
      },
      {
        revokedAt: new Date(),
      },
    );
  } catch {
    // Logout is intentionally idempotent.
  }
};
