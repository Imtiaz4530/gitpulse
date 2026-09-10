import { Request, Response } from "express";

import {
  loginUser,
  logoutUser,
  refreshUserSession,
  registerUser,
} from "../services/auth.service.js";

import {
  clearRefreshTokenCookie,
  REFRESH_COOKIE_NAME,
  setRefreshTokenCookie,
} from "../utils/auth-cookie.js";

import { AppError } from "../utils/AppError.js";
import { isStrongPassword, isValidEmail } from "../utils/validation.js";

export const register = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body;

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string"
  ) {
    throw new AppError(
      "Name, email and password are required",
      400,
      "INVALID_INPUT",
    );
  }

  if (!isValidEmail(email)) {
    throw new AppError(
      "Please provide a valid email address",
      400,
      "INVALID_EMAIL",
    );
  }

  if (!isStrongPassword(password)) {
    throw new AppError(
      "Password must contain at least 8 characters, one uppercase letter, one lowercase letter and one number",
      400,
      "WEAK_PASSWORD",
    );
  }

  const result = await registerUser(
    {
      name,
      email,
      password,
    },
    {
      userAgent: req.get("user-agent"),

      ipAddress: req.ip,
    },
  );

  setRefreshTokenCookie(res, result.refreshToken);

  res.status(201).json({
    success: true,
    message: "Registration successful",
    data: {
      accessToken: result.accessToken,

      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        avatarUrl: result.user.avatarUrl,
        githubConnected: result.user.githubConnected,
      },
    },
  });
};
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (typeof email !== "string" || typeof password !== "string") {
    throw new AppError("Email and password are required", 400, "INVALID_INPUT");
  }

  const result = await loginUser(
    {
      email,
      password,
    },
    {
      userAgent: req.get("user-agent"),

      ipAddress: req.ip,
    },
  );

  setRefreshTokenCookie(res, result.refreshToken);

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      accessToken: result.accessToken,

      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        avatarUrl: result.user.avatarUrl,
        githubConnected: result.user.githubConnected,
      },
    },
  });
};
export const refresh = async (req: Request, res: Response): Promise<void> => {
  const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];

  if (!refreshToken) {
    clearRefreshTokenCookie(res);

    res.status(401).json({
      success: false,
      code: "REFRESH_TOKEN_MISSING",
      message: "Refresh token missing",
    });

    return;
  }

  try {
    const result = await refreshUserSession(refreshToken, {
      userAgent: req.get("user-agent"),

      ipAddress: req.ip,
    });

    setRefreshTokenCookie(res, result.refreshToken);

    res.status(200).json({
      success: true,
      data: {
        accessToken: result.accessToken,
      },
    });
  } catch (error) {
    clearRefreshTokenCookie(res);

    throw error;
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];

  if (refreshToken) {
    await logoutUser(refreshToken);
  }

  clearRefreshTokenCookie(res);

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};
