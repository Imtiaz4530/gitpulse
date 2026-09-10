import type { Response } from "express";
import type { AuthenticatedRequest } from "../types/auth";
import { createGitHubAuthorizationUrl } from "../services/github-oauth.service";

export async function startGitHubOAuth(
  req: AuthenticatedRequest,
  res: Response,
) {
  if (!req.userId) {
    return res.status(401).json({
      success: false,
      code: "UNAUTHORIZED",
      message: "Authentication required",
    });
  }

  const authorizationUrl = await createGitHubAuthorizationUrl(req.userId);

  return res.redirect(authorizationUrl);
}
