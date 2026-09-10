import { api } from "../../lib/api";

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
