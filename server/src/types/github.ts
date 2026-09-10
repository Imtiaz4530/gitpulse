export interface GitHubTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;

  expires_in?: number;
  refresh_token?: string;
  refresh_token_expires_in?: number;
}

export interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
}
