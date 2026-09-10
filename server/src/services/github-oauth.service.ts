import axios from "axios";

import { OAuthState } from "../models/OAuthState";
import { env } from "../config/env";
import { generateOAuthState, hashOAuthState } from "../utils/oauth-state";
import { encryptToken } from "../utils/encryption";
import type { GitHubTokenResponse, GitHubUser } from "../types/github";
import { GitHubAccount } from "../models/GitHubAccount";
import User from "../models/User";
import { AppError } from "../utils/AppError";

async function exchangeCodeForToken(
  code: string,
): Promise<GitHubTokenResponse> {
  const response = await axios.post<GitHubTokenResponse>(
    "https://github.com/login/oauth/access_token",
    {
      client_id: env.githubClientId,
      client_secret: env.githubClientSecret,
      code,
      redirect_uri: env.githubOAuthCallbackUrl,
    },
    {
      headers: {
        Accept: "application/json",
      },
    },
  );

  return response.data;
}

async function getGitHubUser(accessToken: string): Promise<GitHubUser> {
  const response = await axios.get<GitHubUser>("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  return response.data;
}

export async function handleGitHubCallback(code: string, state: string) {
  const stateHash = hashOAuthState(state);

  const oauthState = await OAuthState.findOne({
    stateHash,
    expiresAt: {
      $gt: new Date(),
    },
  });

  if (!oauthState) {
    throw new AppError(
      "INVALID_OAUTH_STATE",
      400,
      "Invalid or expired OAuth state",
    );
  }

  // Consume the state immediately.
  await OAuthState.deleteOne({
    _id: oauthState._id,
  });

  const tokenResponse = await exchangeCodeForToken(code);

  if (!tokenResponse.access_token) {
    throw new AppError(
      "GITHUB_TOKEN_EXCHANGE_FAILED",
      400,
      "Failed to obtain GitHub access token",
    );
  }

  const githubUser = await getGitHubUser(tokenResponse.access_token);

  const encryptedAccessToken = encryptToken(tokenResponse.access_token);

  const encryptedRefreshToken = tokenResponse.refresh_token
    ? encryptToken(tokenResponse.refresh_token)
    : null;

  const accessTokenExpiresAt = tokenResponse.expires_in
    ? new Date(Date.now() + tokenResponse.expires_in * 1000)
    : null;

  const refreshTokenExpiresAt = tokenResponse.refresh_token_expires_in
    ? new Date(Date.now() + tokenResponse.refresh_token_expires_in * 1000)
    : null;

  await GitHubAccount.findOneAndUpdate(
    {
      userId: oauthState.userId,
    },
    {
      githubId: githubUser.id,
      username: githubUser.login,
      displayName: githubUser.name,
      avatarUrl: githubUser.avatar_url,
      profileUrl: githubUser.html_url,

      accessTokenEncrypted: encryptedAccessToken,

      accessTokenExpiresAt,

      refreshTokenEncrypted: encryptedRefreshToken,

      refreshTokenExpiresAt,

      scopes: tokenResponse.scope
        ? tokenResponse.scope.split(",").filter(Boolean)
        : [],
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    },
  );

  await User.findByIdAndUpdate(oauthState.userId, {
    githubConnected: true,
  });

  return {
    userId: oauthState.userId.toString(),
    githubUsername: githubUser.login,
  };
}

export async function createGitHubAuthorizationUrl(userId: string) {
  const state = generateOAuthState();

  await OAuthState.create({
    stateHash: hashOAuthState(state),
    userId,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
  });

  const params = new URLSearchParams({
    client_id: env.githubClientId,
    redirect_uri: env.githubOAuthCallbackUrl,
    state,
  });

  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}
