import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    threadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Thread",
    },

    role: String,

    content: String,
  },
  { timestamps: true },
);

export default mongoose.model("Message", messageSchema);
