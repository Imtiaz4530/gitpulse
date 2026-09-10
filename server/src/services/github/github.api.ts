import type { GitHubAuthenticatedUser, GitHubRepository } from "./github.types";

import { createGitHubClient } from "./github.client";
import { parseLinkHeader } from "./github.pagination";

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
