const express = require("express");
const router = express.Router();

const ChatRoom = require("../models/ChatRoom");
const Message = require("../models/Message");
const { auth, allow } = require("../middleware/auth");


// ===============================
// 1. Company shows interest
// ===============================
router.post(
  "/interest/:ideaId",
  auth,
  allow("company"),
  async (req, res) => {
    try {
      const { creatorId } = req.body;

      const exists = await ChatRoom.findOne({
        ideaId: req.params.ideaId,
        companyId: req.user.id,
      });

      if (exists)
        return res.status(400).json({ message: "Interest already sent" });

      const chatRoom = new ChatRoom({
        ideaId: req.params.ideaId,
        creatorId,
        companyId: req.user.id,
      });

      await chatRoom.save();
      res.json({ message: "Interest sent successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);


// ===============================
// 2. Creator accepts chat
// ===============================
router.put(
  "/accept/:chatId",
  auth,
  allow("creator"),
  async (req, res) => {
    try {
      await ChatRoom.findByIdAndUpdate(req.params.chatId, {
        status: "active",
      });
      res.json({ message: "Chat activated" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);


// ===============================
// 3. Send message
// ===============================
router.post("/message", auth, async (req, res) => {
  try {
    const { chatRoomId, message } = req.body;

    const chat = await ChatRoom.findById(chatRoomId);
    if (!chat || chat.status !== "active") {
      return res.status(403).json({ message: "Chat not active" });
    }

    const msg = new Message({
      chatRoomId,
      senderId: req.user.id,
      message,
    });

    await msg.save();
    res.json(msg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ===============================
// 4. Fetch messages
// ===============================
router.get("/messages/:chatId", auth, async (req, res) => {
  try {
    const messages = await Message.find({
      chatRoomId: req.params.chatId,
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ===============================
// 5. Get my chats
// ===============================
router.get("/my-chats", auth, async (req, res) => {
  try {
    const chats = await ChatRoom.find({
      $or: [{ creatorId: req.user.id }, { companyId: req.user.id }],
    }).populate("ideaId");

    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
