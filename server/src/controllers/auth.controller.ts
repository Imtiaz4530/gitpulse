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

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });

      return;
    }

    if (password.length < 8) {
      res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });

      return;
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
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_ALREADY_EXISTS") {
      res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });

      return;
    }

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "Email and password are required",
      });

      return;
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
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_CREDENTIALS") {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });

      return;
    }

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];

  if (!refreshToken) {
    res.status(401).json({
      success: false,
      message: "Refresh token missing",
    });

    return;
  }

  try {
    const result = await refreshUserSession(refreshToken);

    res.status(200).json({
      success: true,
      data: {
        accessToken: result.accessToken,
      },
    });
  } catch {
    clearRefreshTokenCookie(res);

    res.status(401).json({
      success: false,
      message: "Invalid or expired refresh token",
    });
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
