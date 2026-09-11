import { Schema, model, type InferSchemaType } from "mongoose";

const repositorySchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    githubAccountId: {
      type: Schema.Types.ObjectId,
      ref: "GitHubAccount",
      required: true,
      index: true,
    },

    githubId: {
      type: Number,
      required: true,
    },

    nodeId: {
      type: String,
      required: true,
    },

    ownerGithubId: {
      type: Number,
      required: true,
    },

    ownerLogin: {
      type: String,
      required: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: null,
    },

    private: {
      type: Boolean,
      required: true,
      default: false,
    },

    fork: {
      type: Boolean,
      required: true,
      default: false,
    },

    archived: {
      type: Boolean,
      required: true,
      default: false,
    },

    disabled: {
      type: Boolean,
      required: true,
      default: false,
    },

    htmlUrl: {
      type: String,
      required: true,
    },

    defaultBranch: {
      type: String,
      required: true,
    },

    visibility: {
      type: String,
      required: true,
    },

    language: {
      type: String,
      default: null,
    },

    stars: {
      type: Number,
      required: true,
      default: 0,
    },

    watchers: {
      type: Number,
      required: true,
      default: 0,
    },

    forks: {
      type: Number,
      required: true,
      default: 0,
    },

    openIssues: {
      type: Number,
      required: true,
      default: 0,
    },

    size: {
      type: Number,
      required: true,
      default: 0,
    },

    githubCreatedAt: {
      type: Date,
      required: true,
    },

    githubUpdatedAt: {
      type: Date,
      required: true,
    },

    githubPushedAt: {
      type: Date,
      default: null,
    },

    syncedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

repositorySchema.index(
  {
    userId: 1,
    githubId: 1,
  },
  {
    unique: true,
  },
);

repositorySchema.index({
  userId: 1,
  fullName: 1,
});

repositorySchema.index({
  githubAccountId: 1,
  githubId: 1,
});

repositorySchema.index({
  userId: 1,
  githubUpdatedAt: -1,
});

repositorySchema.index({
  userId: 1,
  githubPushedAt: -1,
});

export type Repository = InferSchemaType<typeof repositorySchema>;

export const RepositoryModel = model("Repository", repositorySchema);
