import { Schema, model, type InferSchemaType } from "mongoose";

const reviewSchema = new Schema(
  {
    repositoryId: {
      type: Schema.Types.ObjectId,
      ref: "Repository",
      required: true,
      index: true,
    },

    pullRequestId: {
      type: Schema.Types.ObjectId,
      ref: "PullRequest",
      required: true,
      index: true,
    },

    githubId: {
      type: Number,
      required: true,
    },

    reviewerGithubId: {
      type: Number,
      default: null,
    },

    reviewerLogin: {
      type: String,
      default: null,
      trim: true,
    },

    reviewerAvatarUrl: {
      type: String,
      default: null,
    },

    state: {
      type: String,
      enum: [
        "approved",
        "changes_requested",
        "commented",
        "dismissed",
        "pending",
      ],
      required: true,
    },

    body: {
      type: String,
      default: null,
    },

    submittedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

reviewSchema.index(
  {
    pullRequestId: 1,
    githubId: 1,
  },
  {
    unique: true,
  },
);

reviewSchema.index({
  repositoryId: 1,
  submittedAt: -1,
});

reviewSchema.index({
  pullRequestId: 1,
  submittedAt: -1,
});

reviewSchema.index({
  repositoryId: 1,
  reviewerGithubId: 1,
});

export type Review = InferSchemaType<typeof reviewSchema>;

export const ReviewModel = model("Review", reviewSchema);
