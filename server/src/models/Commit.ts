import { Schema, model, type InferSchemaType } from "mongoose";

const commitSchema = new Schema(
  {
    repositoryId: {
      type: Schema.Types.ObjectId,
      ref: "Repository",
      required: true,
      index: true,
    },

    githubSha: {
      type: String,
      required: true,
      trim: true,
    },

    authorGithubId: {
      type: Number,
      default: null,
    },

    authorLogin: {
      type: String,
      default: null,
    },

    authorName: {
      type: String,
      default: null,
      trim: true,
    },

    authorEmail: {
      type: String,
      default: null,
      trim: true,
    },

    committerGithubId: {
      type: Number,
      default: null,
    },

    committerLogin: {
      type: String,
      default: null,
      trim: true,
    },

    message: {
      type: String,
      required: true,
    },

    htmlUrl: {
      type: String,
      default: null,
    },

    authoredAt: {
      type: Date,
      default: null,
    },

    committedAt: {
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

    totalChanges: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

commitSchema.index(
  {
    repositoryId: 1,
    githubSha: 1,
  },
  {
    unique: true,
  },
);

commitSchema.index({
  repositoryId: 1,
  committedAt: -1,
});

commitSchema.index({
  repositoryId: 1,
  authorGithubId: 1,
});

export type Commit = InferSchemaType<typeof commitSchema>;

export const CommitModel = model("Commit", commitSchema);
