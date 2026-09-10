export interface GitHubPagination {
  next?: string;
  prev?: string;
  first?: string;
  last?: string;
}

export interface PaginatedGitHubResponse<T> {
  data: T[];
  pagination: GitHubPagination;
}

export function parseLinkHeader(header?: string): GitHubPagination {
  if (!header) {
    return {};
  }

  const pagination: GitHubPagination = {};

  const links = header.split(",");

  for (const link of links) {
    const match = link.match(/<([^>]+)>;\s*rel="([^"]+)"/);

    if (!match) {
      continue;
    }

    const [, url, rel] = match;

    if (rel === "next") {
      pagination.next = url;
    }

    if (rel === "prev") {
      pagination.prev = url;
    }

    if (rel === "first") {
      pagination.first = url;
    }

    if (rel === "last") {
      pagination.last = url;
    }
  }

  return pagination;
}
