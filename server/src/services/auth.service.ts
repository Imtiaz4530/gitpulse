import User from "../models/User.js";
import Session from "../models/Session.js";

import { comparePassword, hashPassword } from "../utils/password.js";

import {
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";

import { hashToken } from "../utils/token.js";

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

export const registerUser = async (
  input: RegisterInput,
  metadata: SessionMetadata,
) => {
  const existingUser = await User.findOne({
    email: input.email.toLowerCase(),
  });

  if (existingUser) {
    throw new Error("EMAIL_ALREADY_EXISTS");
  }

  const passwordHash = await hashPassword(input.password);

  const user = await User.create({
    name: input.name,
    email: input.email.toLowerCase(),
    passwordHash,
  });

  const session = await Session.create({
    userId: user._id,
    refreshTokenHash: "pending",
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    userAgent: metadata.userAgent,
    ipAddress: metadata.ipAddress,
  });

  const refreshToken = createRefreshToken(user.id, session.id);

  session.refreshTokenHash = hashToken(refreshToken);

  await session.save();

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
  const user = await User.findOne({
    email: input.email.toLowerCase(),
  }).select("+passwordHash");

  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const passwordValid = await comparePassword(
    input.password,
    user.passwordHash,
  );

  if (!passwordValid) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const session = await Session.create({
    userId: user._id,
    refreshTokenHash: "pending",
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    userAgent: metadata.userAgent,
    ipAddress: metadata.ipAddress,
  });

  const refreshToken = createRefreshToken(user.id, session.id);

  session.refreshTokenHash = hashToken(refreshToken);

  await session.save();

  const accessToken = createAccessToken(user.id);

  return {
    user,
    accessToken,
    refreshToken,
  };
};

export const refreshUserSession = async (refreshToken: string) => {
  const payload = verifyRefreshToken(refreshToken);

  const session = await Session.findOne({
    _id: payload.sessionId,
    userId: payload.sub,
    revokedAt: null,
  });

  if (!session) {
    throw new Error("INVALID_SESSION");
  }

  if (session.expiresAt.getTime() < Date.now()) {
    throw new Error("SESSION_EXPIRED");
  }

  const tokenHash = hashToken(refreshToken);

  if (tokenHash !== session.refreshTokenHash) {
    throw new Error("INVALID_SESSION");
  }

  const newAccessToken = createAccessToken(payload.sub);

  return {
    accessToken: newAccessToken,
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
    // Logout should remain idempotent.
  }
};
