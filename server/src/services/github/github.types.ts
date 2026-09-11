export interface GitHubAuthenticatedUser {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
  avatar_url: string;
  html_url: string;
  bio: string | null;
  company: string | null;
  location: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

export interface GitHubRepository {
  id: number;
  node_id: string;
  name: string;
  full_name: string;
  private: boolean;
  owner: {
    id: number;
    login: string;
    avatar_url: string;
    html_url: string;
  };
  html_url: string;
  description: string | null;
  fork: boolean;
  language: string | null;
  default_branch: string;
  visibility: string;
  archived: boolean;
  disabled: boolean;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  open_issues_count: number;
  size: number;
  created_at: string;
  updated_at: string;
  pushed_at: string | null;
}

export interface GitHubCommit {
  sha: string;
  html_url: string;

  commit: {
    author: {
      name: string;
      email: string;
      date: string;
    } | null;

    committer: {
      name: string;
      email: string;
      date: string;
    } | null;

    message: string;
  };

  author: {
    id: number;
    login: string;
    avatar_url: string;
    html_url: string;
  } | null;

  committer: {
    id: number;
    login: string;
    avatar_url: string;
    html_url: string;
  } | null;
}

export interface GitHubCommitDetail extends GitHubCommit {
  stats?: {
    additions: number;
    deletions: number;
    total: number;
  };
}

export interface GitHubPullRequest {
  id: number;
  number: number;

  title: string;

  state: "open" | "closed";

  draft: boolean;

  html_url: string;

  user: {
    id: number;
    login: string;
    avatar_url: string;
    html_url: string;
  } | null;

  head: {
    ref: string;
  };

  base: {
    ref: string;
  };

  created_at: string;
  updated_at: string;

  closed_at: string | null;
  merged_at: string | null;

  additions?: number;
  deletions?: number;
  changed_files?: number;

  comments?: number;
  review_comments?: number;

  merged?: boolean;
}

export interface GitHubIssue {
  id: number;
  number: number;

  title: string;

  state: "open" | "closed";

  html_url: string;

  user: {
    id: number;
    login: string;
    avatar_url: string;
    html_url: string;
  } | null;

  labels: Array<{
    name: string;
    color: string;
  }>;

  assignees: Array<{
    id: number;
    login: string;
    avatar_url: string;
  }>;

  comments: number;

  created_at: string;
  updated_at: string;
  closed_at: string | null;

  pull_request?: {
    url: string;
    html_url: string;
  };
}

export interface GitHubReview {
  id: number;

  user: {
    id: number;
    login: string;
    avatar_url: string;
    html_url: string;
  } | null;

  body: string | null;

  state:
    | "APPROVED"
    | "CHANGES_REQUESTED"
    | "COMMENTED"
    | "DISMISSED"
    | "PENDING"
    | string;

  html_url: string;

  submitted_at: string | null;
}

export interface GitHubContributor {
  id?: number;
  login?: string;
  avatar_url?: string;
  html_url?: string;

  contributions: number;
}

export interface GitHubRelease {
  id: number;

  tag_name: string;

  name: string | null;

  body: string | null;

  draft: boolean;

  prerelease: boolean;

  html_url: string;

  author: {
    id: number;
    login: string;
    avatar_url: string;
  } | null;

  created_at: string;

  published_at: string | null;
}
