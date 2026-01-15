import moongoose from "moongoose";

const likeSchema = new moongoose.Schema(
  {
    video: {
      type: moongoose.Schema.Types.ObjectId,
      ref: "Video",
    },
    comment: {
      type: moongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
    likedBy: {
      type: moongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);
