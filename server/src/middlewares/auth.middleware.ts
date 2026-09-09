import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types/auth.js";
import { verifyAccessToken } from "../utils/jwt.js";

export const requireAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void => {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      message: "Authentication required",
    });

    return;
  }

  const token = authorization.substring(7);

  try {
    const payload = verifyAccessToken(token);

    req.userId = payload.sub;

    next();
  } catch {
    res.status(401).json({
      success: false,
      message: "Invalid or expired access token",
    });
  }
};
