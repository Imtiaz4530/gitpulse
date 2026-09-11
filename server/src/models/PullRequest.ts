import { Schema, model, type InferSchemaType } from "mongoose";

const pullRequestSchema = new Schema(
  {
    repositoryId: {
      type: Schema.Types.ObjectId,
      ref: "Repository",
      required: true,
      index: true,
    },

    githubId: {
      type: Number,
      required: true,
    },

    number: {
      type: Number,
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    state: {
      type: String,
      enum: ["open", "closed"],
      required: true,
    },

    draft: {
      type: Boolean,
      default: false,
    },

    merged: {
      type: Boolean,
      default: false,
    },

    authorGithubId: {
      type: Number,
      default: null,
    },

    authorLogin: {
      type: String,
      default: null,
      trim: true,
    },

    authorAvatarUrl: {
      type: String,
      default: null,
    },

    htmlUrl: {
      type: String,
      required: true,
    },

    headRef: {
      type: String,
      default: null,
    },

    baseRef: {
      type: String,
      default: null,
    },

    createdAtGitHub: {
      type: Date,
      required: true,
    },

    updatedAtGitHub: {
      type: Date,
      required: true,
    },

    closedAtGitHub: {
      type: Date,
      default: null,
    },

    mergedAtGitHub: {
      type: Date,
      default: null,
    },

    additions: {
      type: Number,
      default: 0,
    },

    deletions: {
      type: Number,
      default: 0,
    },

    changedFiles: {
      type: Number,
      default: 0,
    },

    commentsCount: {
      type: Number,
      default: 0,
    },

    reviewCommentsCount: {
      type: Number,
      default: 0,
    },

    cycleTimeSeconds: {
      type: Number,
      default: null,
    },

    mergeTimeSeconds: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

pullRequestSchema.index(
  {
    repositoryId: 1,
    githubId: 1,
  },
  {
    unique: true,
  },
);

pullRequestSchema.index(
  {
    repositoryId: 1,
    number: 1,
  },
  {
    unique: true,
  },
);

pullRequestSchema.index({
  repositoryId: 1,
  state: 1,
});

pullRequestSchema.index({
  repositoryId: 1,
  createdAtGitHub: -1,
});

pullRequestSchema.index({
  repositoryId: 1,
  mergedAtGitHub: -1,
});

export type PullRequest = InferSchemaType<typeof pullRequestSchema>;

export const PullRequestModel = model("PullRequest", pullRequestSchema);
