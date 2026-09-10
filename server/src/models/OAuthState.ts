import { Schema, model } from "mongoose";

const oauthStateSchema = new Schema(
  {
    stateHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

oauthStateSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const OAuthState = model("OAuthState", oauthStateSchema);
