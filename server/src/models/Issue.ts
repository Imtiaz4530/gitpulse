import { Schema, model, type InferSchemaType } from "mongoose";

const issueSchema = new Schema(
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

    labels: [
      {
        name: {
          type: String,
          required: true,
        },

        color: {
          type: String,
          default: null,
        },
      },
    ],

    assignees: [
      {
        githubId: {
          type: Number,
          required: true,
        },

        login: {
          type: String,
          required: true,
        },

        avatarUrl: {
          type: String,
          default: null,
        },
      },
    ],

    commentsCount: {
      type: Number,
      default: 0,
    },

    htmlUrl: {
      type: String,
      required: true,
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
  },
  {
    timestamps: true,
  },
);

issueSchema.index(
  {
    repositoryId: 1,
    githubId: 1,
  },
  {
    unique: true,
  },
);

issueSchema.index(
  {
    repositoryId: 1,
    number: 1,
  },
  {
    unique: true,
  },
);

issueSchema.index({
  repositoryId: 1,
  state: 1,
});

issueSchema.index({
  repositoryId: 1,
  createdAtGitHub: -1,
});

issueSchema.index({
  repositoryId: 1,
  closedAtGitHub: -1,
});

export type Issue = InferSchemaType<typeof issueSchema>;

export const IssueModel = model("Issue", issueSchema);
