import { api } from "../../lib/api";
import type { GitHubStatusResponse } from "./github.types";

interface StartGitHubOAuthResponse {
  success: boolean;
  authorizationUrl: string;
}

export async function startGitHubOAuth() {
  const response = await api.post<StartGitHubOAuthResponse>(
    "/github/oauth/start",
  );

  return response.data;
}

export async function getGitHubStatus() {
  const response = await api.get<GitHubStatusResponse>("/github/status");

  return response.data;
}

export async function disconnectGitHub() {
  const response = await api.delete("/github/disconnect");

  return response.data;
}
