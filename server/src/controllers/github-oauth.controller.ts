import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../types/auth";
import {
  createGitHubAuthorizationUrl,
  handleGitHubCallback,
} from "../services/github-oauth.service";
import { env } from "../config/env";

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

  return res.json({
    success: true,
    authorizationUrl,
  });
}

export async function handleGitHubOAuthCallback(req: Request, res: Response) {
  const { code, state, error } = req.query;

  if (error) {
    return res.redirect(`${env.clientUrl}/dashboard?github=denied`);
  }

  if (typeof code !== "string" || typeof state !== "string") {
    return res.redirect(`${env.clientUrl}/dashboard?github=failed`);
  }

  try {
    await handleGitHubCallback(code, state);

    return res.redirect(`${env.clientUrl}/dashboard?github=connected`);
  } catch (error) {
    console.error("GitHub OAuth callback failed:", error);

    return res.redirect(`${env.clientUrl}/dashboard?github=failed`);
  }
}
