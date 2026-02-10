const express = require("express");
const multer = require("multer");
const path = require("path");
const User = require("../models/User");
const Idea = require("../models/Idea");
const Application = require("../models/Application");
const { auth, allow } = require("../middleware/auth");

const router = express.Router();

// FILE UPLOAD
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/profiles/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// GET MY PROFILE
router.get("/my-profile", auth, allow("creator"), async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json(user);
});

// UPDATE PROFILE
router.put("/update-profile", auth, allow("creator"), upload.single("profileImage"), async (req, res) => {
  const { name, bio, skills } = req.body;

  const update = { name, bio, skills };
  if (req.file) update.profileImage = `/uploads/profiles/${req.file.filename}`;

  const user = await User.findByIdAndUpdate(req.user.id, update, { new: true }).select("-password");
  res.json(user);
});

// ALL CREATORS (COMPANY VIEW)
router.get("/all", auth, allow("company"), async (req, res) => {
  const creators = await User.find({ role: "creator" })
    .select("name email skills bio profileImage");
  res.json(creators);
});

// PUBLIC CREATOR PROFILE
router.get("/:id", auth, async (req, res) => {
  const creator = await User.findOne({ _id: req.params.id, role: "creator" })
    .select("name email bio skills profileImage");
  if (!creator) return res.status(404).json({ message: "Creator not found" });
  res.json(creator);
});

// CREATOR DASHBOARD STATS
router.get("/dashboard/stats", auth, allow("creator"), async (req, res) => {
  const creatorId = req.user.id;

 const totalIdeas = await Idea.countDocuments({ createdBy: creatorId });

  const proposalsSent = await Application.countDocuments({ creator: creatorId });
  const dealsClosed = await Application.countDocuments({ creator: creatorId, status: "accepted" });

  const earningsAgg = await Application.aggregate([
    { $match: { creator: req.user._id, status: "accepted" } },
    { $group: { _id: null, total: { $sum: "$budget" } } }
  ]);

  res.json({
    totalIdeas,
    proposalsSent,
    dealsClosed,
    earnings: earningsAgg[0]?.total || 0
  });
});

module.exports = router;
