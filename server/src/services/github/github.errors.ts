export class GitHubApiError extends Error {
  statusCode: number;
  code: string;
  retryAfterSeconds?: number;
  rateLimitResetAt?: Date;

  constructor({
    statusCode,
    code,
    message,
    retryAfterSeconds,
    rateLimitResetAt,
  }: {
    statusCode: number;
    code: string;
    message: string;
    retryAfterSeconds?: number;
    rateLimitResetAt?: Date;
  }) {
    super(message);

    this.name = "GitHubApiError";

    this.statusCode = statusCode;
    this.code = code;

    this.retryAfterSeconds = retryAfterSeconds;

    this.rateLimitResetAt = rateLimitResetAt;
  }
}
