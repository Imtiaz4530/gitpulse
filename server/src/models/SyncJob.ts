import { Schema, model, type InferSchemaType } from "mongoose";

const syncJobSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    repositoryId: {
      type: Schema.Types.ObjectId,
      ref: "Repository",
      default: null,
      index: true,
    },

    bullJobId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["repository", "engineering-data"],
      required: true,
    },

    status: {
      type: String,
      enum: ["queued", "active", "completed", "failed"],
      required: true,
      default: "queued",
      index: true,
    },

    attempts: {
      type: Number,
      required: true,
      default: 0,
    },

    errorMessage: {
      type: String,
      default: null,
    },

    result: {
      type: Schema.Types.Mixed,
      default: null,
    },

    startedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    failedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

syncJobSchema.index({
  userId: 1,
  createdAt: -1,
});

syncJobSchema.index({
  repositoryId: 1,
  createdAt: -1,
});

export type SyncJob = InferSchemaType<typeof syncJobSchema>;

export const SyncJobModel = model("SyncJob", syncJobSchema);
