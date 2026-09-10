import { Schema, model, type InferSchemaType } from "mongoose";

const githubAccountSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    githubId: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },

    username: {
      type: String,
      required: true,
      trim: true,
    },

    displayName: {
      type: String,
      default: null,
      trim: true,
    },

    avatarUrl: {
      type: String,
      default: null,
    },

    profileUrl: {
      type: String,
      default: null,
    },
    accessTokenEncrypted: {
      type: String,
      required: true,
    },

    accessTokenExpiresAt: {
      type: Date,
      default: null,
    },

    refreshTokenEncrypted: {
      type: String,
      default: null,
    },

    refreshTokenExpiresAt: {
      type: Date,
      default: null,
    },

    scopes: {
      type: [String],
      default: [],
    },

    connectedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

export type GitHubAccountDocument = InferSchemaType<typeof githubAccountSchema>;

export const GitHubAccount = model("GitHubAccount", githubAccountSchema);
