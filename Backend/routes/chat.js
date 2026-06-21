import express from "express";
import Thread from "../models/Thread.js";
import getOpenAIAPIResponse from "../utils/openai.js";
import authMiddleware from "../utils/authMiddleware.js";

const router = express.Router();

router.post("/test", async (req, res) => {
  try {
    const thread = new Thread({
      userId: req.body.userId,
      threadId: "abc",
      title: "testing New Thread",
      messages: [],
    });

    const response = await thread.save();
    res.send(response);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to save in DB" });
  }
});

// Get all threads for current user
router.get("/thread", authMiddleware, async (req, res) => {
  try {
    const threads = await Thread.find({
      userId: req.user.userId,
    }).sort({ updatedAt: -1 });

    res.json(threads);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: "Failed to fetch threads",
    });
  }
});

// Get messages of a specific thread
router.get("/thread/:threadId", authMiddleware, async (req, res) => {
  const { threadId } = req.params;

  try {
    const thread = await Thread.findOne({
      threadId,
      userId: req.user.userId,
    });

    if (!thread) {
      return res.status(404).json({
        error: "Thread not found",
      });
    }

    res.json(thread.messages);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: "Failed to fetch chat",
    });
  }
});

// Delete a thread
router.delete("/thread/:threadId", authMiddleware, async (req, res) => {
  const { threadId } = req.params;

  try {
    const deletedThread = await Thread.findOneAndDelete({
      threadId,
      userId: req.user.userId,
    });

    if (!deletedThread) {
      return res.status(404).json({
        error: "Thread not found",
      });
    }

    res.status(200).json({
      success: "Thread deleted successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: "Failed to delete thread",
    });
  }
});

// Chat route
router.post("/chat", authMiddleware, async (req, res) => {
  const { threadId, message } = req.body;

  if (!threadId || !message) {
    return res.status(400).json({
      error: "Missing required fields",
    });
  }

  try {
    let thread = await Thread.findOne({
      threadId,
      userId: req.user.userId,
    });

    // Create new thread if it doesn't exist
    if (!thread) {
      thread = new Thread({
        userId: req.user.userId,
        threadId,
        title: message.slice(0, 30),
        messages: [],
      });
    }

    // Save user message
    thread.messages.push({
      role: "user",
      content: message,
    });

    // Get AI reply
    const assistantReply = await getOpenAIAPIResponse(message);

    // Save AI reply
    thread.messages.push({
      role: "assistant",
      content: assistantReply,
    });

    thread.updatedAt = new Date();

    await thread.save();

    res.json({
      reply: assistantReply,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: "Something went wrong",
    });
  }
});

export default router;
