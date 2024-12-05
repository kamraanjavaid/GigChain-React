const express = require("express");
const router = express.Router();
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const authMiddleware = require("../middleware/auth");
const Proposal = require("../models/Proposal");

router.use(authMiddleware);

router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const conversations = await Conversation.aggregate([
      { $match: { participants: userId } },
      {
        $lookup: {
          from: "messages",
          let: { conversationId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$conversationId", "$$conversationId"] },
              },
            },
            { $sort: { timestamp: -1 } },
            { $limit: 1 },
          ],
          as: "lastMessage",
        },
      },
      {
        $addFields: {
          lastMessage: { $arrayElemAt: ["$lastMessage", 0] },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "participants",
          foreignField: "_id",
          as: "participants",
        },
      },
    ]);
    res.json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/check-conversation/:userId", authMiddleware, async (req, res) => {
  try {
    const userId = req.params.userId;

    const conversation = await Conversation.exists({
      participants: { $in: [userId] },
    });

    res.json({
      exists: !!conversation,
    });
  } catch (error) {
    console.error("Error checking conversation:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
});

router.get("/:conversationId", authMiddleware, async (req, res) => {
  try {
    const conversationId = req.params.conversationId;
    const conversation = await Conversation.findById(conversationId)
      .populate({
        path: "serviceId",
        select: "title",
      })
      .populate({
        path: "participants",
        select: "firstName lastName profilePictureUrl",
      })
      .exec();
    res.json(conversation);
  } catch (error) {
    console.error("Error fetching conversation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { participant, serviceId } = req.body;

    const conversation = new Conversation({
      participants: [req.user._id, participant],
      serviceId: serviceId,
    });
    await conversation.save();

    const { messageText, budget, deadline } = req.body.proposal;

    const proposal = new Proposal({
      conversationId: conversation._id,
      messageText: messageText,
      budget: budget,
      deadline: deadline,
    });
    await proposal.save();

    const message = new Message({
      conversationId: conversation._id,
      sender: req.user._id,
      content: messageText,
      messageType: "proposal",
      proposal: proposal._id,
    });

    await message.save();

    res.status(201).json(conversation);
  } catch (error) {
    console.error("Error creating conversation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:conversationId/proposal", authMiddleware, async (req, res) => {
  try {
    const conversationId = req.params.conversationId;
    const proposal = await Proposal.findOne({ conversationId });
    res.json(proposal);
  } catch (error) {
    console.error("Error fetching proposal:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:conversationId/messages", async (req, res) => {
  try {
    const { conversationId } = req.params;
    console.log(
      "Conversation ID in messages api endpoint(New): ",
      conversationId
    );
    const messages = await Message.find({ conversationId })
      .populate({
        path: "proposal",
        select: "messageText budget deadline",
      })
      .populate({
        path: "negotiation",
        select: "budget deadline notes",
      });

    console.log("Messages in messages api endpoint(New): ", messages);
    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
