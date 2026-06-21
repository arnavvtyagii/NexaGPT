import mongoose from "mongoose";

const threadSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    threadId: {
      type: String,
      required: true,
      unique: true,
    },

    title: {
      type: String,
      required: true,
    },

    messages: [
      {
        role: String,
        content: String,
      },
    ],
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Thread", threadSchema);
