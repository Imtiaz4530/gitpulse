import { Response } from "express";

import { env } from "../config/env.js";
import { parseDurationToMs } from "./duration.js";

const REFRESH_COOKIE_NAME = "gitpulse_refresh_token";

export const setRefreshTokenCookie = (res: Response, token: string): void => {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: "lax",
    path: "/api/auth",
    maxAge: parseDurationToMs(env.refreshTokenExpiresIn),
  });
};

export const clearRefreshTokenCookie = (res: Response): void => {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: "lax",
    path: "/api/auth",
  });
};

export { REFRESH_COOKIE_NAME };
