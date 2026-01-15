import moongoose from "moongoose";

const tweetSchema = new moongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    owner: {
      type: moongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Tweet = moongoose.model("Tweet", tweetSchema);
