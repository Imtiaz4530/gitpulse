import { OAuthState } from "../models/OAuthState";
import { env } from "../config/env";
import { generateOAuthState, hashOAuthState } from "../utils/oauth-state";

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
