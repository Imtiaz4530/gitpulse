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

export interface GitHubAccount {
  githubId: number;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  profileUrl: string;
  connectedAt: string;
  scopes: string[];
}

export interface GitHubStatusResponse {
  success: boolean;
  connected: boolean;
  account: GitHubAccount | null;
}
