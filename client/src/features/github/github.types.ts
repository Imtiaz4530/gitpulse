export interface GitHubAccount {
  username: string;
  displayName?: string;
  avatarUrl?: string;
}

export interface GitHubStatusResponse {
  success: boolean;
  account?: GitHubAccount;
}
