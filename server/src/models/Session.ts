import mongoose, { Document, Model, Schema } from "mongoose";

export interface ISession extends Document {
  userId: mongoose.Types.ObjectId;

  refreshTokenHash: string;

  userAgent?: string;

  ipAddress?: string;

  expiresAt: Date;

  revokedAt?: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

const sessionSchema = new Schema<ISession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    refreshTokenHash: {
      type: String,
      required: true,
    },

    userAgent: {
      type: String,
    },

    ipAddress: {
      type: String,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },

    revokedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

sessionSchema.index(
  {
    expiresAt: 1,
  },
  {
    expireAfterSeconds: 0,
  },
);

const Session: Model<ISession> =
  mongoose.models.Session || mongoose.model<ISession>("Session", sessionSchema);

export default Session;
