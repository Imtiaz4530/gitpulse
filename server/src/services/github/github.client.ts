import axios, { AxiosError, type AxiosInstance } from "axios";

import { GitHubApiError } from "./github.errors";

const GITHUB_API_URL = "https://api.github.com";

const GITHUB_API_VERSION = "2026-03-10";

function parseRateLimitReset(value?: string): Date | undefined {
  if (!value) {
    return undefined;
  }

  const timestamp = Number(value);

  if (!Number.isFinite(timestamp)) {
    return undefined;
  }

  return new Date(timestamp * 1000);
}

export function createGitHubClient(accessToken: string): AxiosInstance {
  const client = axios.create({
    baseURL: GITHUB_API_URL,

    timeout: 15_000,

    headers: {
      Accept: "application/vnd.github+json",

      Authorization: `Bearer ${accessToken}`,

      "X-GitHub-Api-Version": GITHUB_API_VERSION,
    },
  });

  client.interceptors.response.use(
    (response) => response,

    (error: AxiosError) => {
      if (!error.response) {
        throw new GitHubApiError({
          statusCode: 503,
          code: "GITHUB_NETWORK_ERROR",
          message: "Unable to reach GitHub",
        });
      }

      const { status, headers, data } = error.response;

      const retryAfterHeader = headers["retry-after"];

      const remainingHeader = headers["x-ratelimit-remaining"];

      const resetHeader = headers["x-ratelimit-reset"];

      const retryAfterSeconds = retryAfterHeader
        ? Number(retryAfterHeader)
        : undefined;

      const rateLimitResetAt = parseRateLimitReset(resetHeader);

      if (status === 403 && remainingHeader === "0") {
        throw new GitHubApiError({
          statusCode: 429,
          code: "GITHUB_RATE_LIMITED",
          message: "GitHub API rate limit exceeded",
          retryAfterSeconds,
          rateLimitResetAt,
        });
      }

      throw new GitHubApiError({
        statusCode: status,
        code: "GITHUB_API_ERROR",
        message:
          data &&
          typeof data === "object" &&
          "message" in data &&
          typeof data.message === "string"
            ? data.message
            : "GitHub API request failed",
        retryAfterSeconds,
        rateLimitResetAt,
      });
    },
  );

  return client;
}
