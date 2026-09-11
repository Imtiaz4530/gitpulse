import { Schema, model, type InferSchemaType } from "mongoose";

const contributorSchema = new Schema(
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

    login: {
      type: String,
      required: true,
      trim: true,
    },

    avatarUrl: {
      type: String,
      default: null,
    },

    htmlUrl: {
      type: String,
      default: null,
    },

    contributions: {
      type: Number,
      required: true,
      default: 0,
    },

    firstSeenAt: {
      type: Date,
      default: null,
    },

    lastSeenAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

contributorSchema.index(
  {
    repositoryId: 1,
    githubId: 1,
  },
  {
    unique: true,
  },
);

contributorSchema.index({
  repositoryId: 1,
  contributions: -1,
});

contributorSchema.index({
  repositoryId: 1,
  lastSeenAt: -1,
});

export type Contributor = InferSchemaType<typeof contributorSchema>;

export const ContributorModel = model("Contributor", contributorSchema);
