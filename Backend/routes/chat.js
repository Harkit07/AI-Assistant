import express from "express";
import Thread from "../models/Thread.js";
import getOpenAIAPIResponse from "../utils/openai.js";
import { authUser } from "../middleware.js";

const router = express.Router();

//test
router.post("/test", async (req, res) => {
  try {
    const thread = new Thread({
      threadId: "abc",
      title: "Testing New Thread2",
    });

    const response = await thread.save();
    res.send(response);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Failed to save in DB" });
  }
});

//Get all threads
router.get("/thread", authUser, async (req, res) => {
  try {
    const threads = await Thread.find({ userId: req.user._id }).sort({
      updatedAt: -1,
    });
    res.status(200).json(threads);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Failed to fetch threads" });
  }
});

router.get("/thread/:threadId", authUser, async (req, res) => {
  const { threadId } = req.params;

  try {
    const thread = await Thread.findOne({ threadId, userId: req.user._id });

    if (!thread) {
      return res.status(404).json({ error: "Thread not found" });
    }

    return res.status(200).json(thread.messages);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Failed to fetch chat" });
  }
});

router.delete("/thread/:threadId", authUser, async (req, res) => {
  const { threadId } = req.params;

  try {
    const deletedThread = await Thread.findOneAndDelete({
      threadId,
      userId: req.user._id,
    });

    if (!deletedThread) {
      return res.status(404).json({ error: "Thread not found" });
    }

    return res.status(200).json({ success: "Thread deleted successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Failed to delete thread" });
  }
});

router.post("/chat", authUser, async (req, res) => {
  const { threadId, message } = req.body;

  if (!threadId || !message) {
    return res.status(400).json({ error: "missing required fields" });
  }

  try {
    let thread = await Thread.findOne({ threadId, userId: req.user._id });

    if (!thread) {
      //create a new thread in Db
      thread = new Thread({
        threadId,
        userId: req.user._id,
        title: message,
        messages: [{ role: "user", content: message }],
      });
    } else {
      thread.messages.push({ role: "user", content: message });
    }

    const assistantReply = await getOpenAIAPIResponse(message);

    if (!assistantReply) {
      return res.status(500).json({ error: "Empty reply from AI" });
    }

    thread.messages.push({ role: "assistant", content: assistantReply });
    thread.updatedAt = new Date();

    await thread.save();
    res.json({ reply: assistantReply });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "something went wrong" });
  }
});

export default router;
