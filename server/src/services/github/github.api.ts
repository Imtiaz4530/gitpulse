import type {
  GitHubCommit,
  GitHubCommitDetail,
  GitHubContributor,
  GitHubIssue,
  GitHubPullRequest,
  GitHubRelease,
  GitHubReview,
  GitHubAuthenticatedUser,
  GitHubRepository,
} from "./github.types";

import { createGitHubClient } from "./github.client";
import { parseLinkHeader } from "./github.pagination";

export async function listRepositoryCommits(
  accessToken: string,
  owner: string,
  repo: string,
  options: {
    page?: number;
    perPage?: number;
  } = {},
) {
  const client = createGitHubClient(accessToken);

  const response = await client.get<GitHubCommit[]>(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits`,
    {
      params: {
        page: options.page ?? 1,
        per_page: options.perPage ?? 100,
      },
    },
  );

  return {
    data: response.data,
    pagination: parseLinkHeader(response.headers.link),
  };
}

export async function getRepositoryCommit(
  accessToken: string,
  owner: string,
  repo: string,
  sha: string,
) {
  const client = createGitHubClient(accessToken);

  const response = await client.get<GitHubCommitDetail>(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits/${encodeURIComponent(sha)}`,
  );

  return response.data;
}

export async function listPullRequests(
  accessToken: string,
  owner: string,
  repo: string,
  options: {
    page?: number;
    perPage?: number;
    state?: "open" | "closed" | "all";
  } = {},
) {
  const client = createGitHubClient(accessToken);

  const response = await client.get<GitHubPullRequest[]>(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/pulls`,
    {
      params: {
        page: options.page ?? 1,
        per_page: options.perPage ?? 100,
        state: options.state ?? "all",
      },
    },
  );

  return {
    data: response.data,
    pagination: parseLinkHeader(response.headers.link),
  };
}

export async function getPullRequest(
  accessToken: string,
  owner: string,
  repo: string,
  pullNumber: number,
) {
  const client = createGitHubClient(accessToken);

  const response = await client.get<GitHubPullRequest>(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/pulls/${pullNumber}`,
  );

  return response.data;
}

export async function listIssues(
  accessToken: string,
  owner: string,
  repo: string,
  options: {
    page?: number;
    perPage?: number;
    state?: "open" | "closed" | "all";
  } = {},
) {
  const client = createGitHubClient(accessToken);

  const response = await client.get<GitHubIssue[]>(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/issues`,
    {
      params: {
        page: options.page ?? 1,
        per_page: options.perPage ?? 100,
        state: options.state ?? "all",
      },
    },
  );

  return {
    data: response.data,
    pagination: parseLinkHeader(response.headers.link),
  };
}

export async function listPullRequestReviews(
  accessToken: string,
  owner: string,
  repo: string,
  pullNumber: number,
  options: {
    page?: number;
    perPage?: number;
  } = {},
) {
  const client = createGitHubClient(accessToken);

  const response = await client.get<GitHubReview[]>(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/pulls/${pullNumber}/reviews`,
    {
      params: {
        page: options.page ?? 1,
        per_page: options.perPage ?? 100,
      },
    },
  );

  return {
    data: response.data,
    pagination: parseLinkHeader(response.headers.link),
  };
}

export async function listContributors(
  accessToken: string,
  owner: string,
  repo: string,
  options: {
    page?: number;
    perPage?: number;
  } = {},
) {
  const client = createGitHubClient(accessToken);

  const response = await client.get<GitHubContributor[]>(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contributors`,
    {
      params: {
        page: options.page ?? 1,
        per_page: options.perPage ?? 100,
      },
    },
  );

  return {
    data: response.data,
    pagination: parseLinkHeader(response.headers.link),
  };
}

export async function listReleases(
  accessToken: string,
  owner: string,
  repo: string,
  options: {
    page?: number;
    perPage?: number;
  } = {},
) {
  const client = createGitHubClient(accessToken);

  const response = await client.get<GitHubRelease[]>(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/releases`,
    {
      params: {
        page: options.page ?? 1,
        per_page: options.perPage ?? 100,
      },
    },
  );

  return {
    data: response.data,
    pagination: parseLinkHeader(response.headers.link),
  };
}

export async function getAuthenticatedUser(
  accessToken: string,
): Promise<GitHubAuthenticatedUser> {
  const client = createGitHubClient(accessToken);

  const response = await client.get<GitHubAuthenticatedUser>("/user");

  return response.data;
}

export interface ListRepositoriesOptions {
  page?: number;
  perPage?: number;
  visibility?: "all" | "public" | "private";
  affiliation?: string;
  sort?: "created" | "updated" | "pushed" | "full_name";
  direction?: "asc" | "desc";
}

export async function listRepositories(
  accessToken: string,
  options: ListRepositoriesOptions = {},
) {
  const client = createGitHubClient(accessToken);

  const {
    page = 1,
    perPage = 100,
    visibility = "all",
    affiliation = "owner,collaborator,organization_member",
    sort = "updated",
    direction = "desc",
  } = options;

  const response = await client.get<GitHubRepository[]>("/user/repos", {
    params: {
      page,
      per_page: perPage,
      visibility,
      affiliation,
      sort,
      direction,
    },
  });

  return {
    data: response.data,
    pagination: parseLinkHeader(response.headers.link),
  };
}
