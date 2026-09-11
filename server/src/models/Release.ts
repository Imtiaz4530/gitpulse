import { Schema, model, type InferSchemaType } from "mongoose";

const releaseSchema = new Schema(
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

    tagName: {
      type: String,
      required: true,
      trim: true,
    },

    name: {
      type: String,
      default: null,
      trim: true,
    },

    body: {
      type: String,
      default: null,
    },

    draft: {
      type: Boolean,
      default: false,
    },

    prerelease: {
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

    createdAtGitHub: {
      type: Date,
      required: true,
    },

    publishedAtGitHub: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

releaseSchema.index(
  {
    repositoryId: 1,
    githubId: 1,
  },
  {
    unique: true,
  },
);

releaseSchema.index({
  repositoryId: 1,
  publishedAtGitHub: -1,
});

releaseSchema.index({
  repositoryId: 1,
  createdAtGitHub: -1,
});

export type Release = InferSchemaType<typeof releaseSchema>;

export const ReleaseModel = model("Release", releaseSchema);
