const router = require("express").Router();
const Submission = require("../models/Submission");
const Challenge = require("../models/Challenge");
const Idea = require("../models/Idea");
const { auth, allow } = require("../middleware/auth");

// POST /api/submissions/:challengeId  (student submits idea to challenge)
router.post("/:challengeId", auth, allow("student"), async (req, res) => {
  const { ideaId, message } = req.body;
  const challenge = await Challenge.findById(req.params.challengeId);
  if (!challenge) return res.status(404).json({ message: "Challenge not found" });
  if (challenge.status !== "OPEN") return res.status(400).json({ message: "Challenge is closed" });

  const idea = await Idea.findById(ideaId);
  if (!idea) return res.status(404).json({ message: "Idea not found" });
  if (idea.createdBy.toString() !== req.user.id) return res.status(403).json({ message: "Not your idea" });

  const sub = await Submission.create({
    challenge: challenge._id,
    idea: idea._id,
    submittedBy: req.user.id,
    message
  });

  res.status(201).json(sub);
});

// GET /api/submissions/challenge/:challengeId (company owner views submissions)
router.get("/challenge/:challengeId", auth, allow("company"), async (req, res) => {
  const challenge = await Challenge.findById(req.params.challengeId);
  if (!challenge) return res.status(404).json({ message: "Challenge not found" });
  if (challenge.postedBy.toString() !== req.user.id) return res.status(403).json({ message: "Not owner" });

  const subs = await Submission.find({ challenge: challenge._id })
    .populate("idea")
    .populate("submittedBy", "name role email")
    .sort({ createdAt: -1 });
  res.json(subs);
});

// PATCH /api/submissions/:id/status (company owner updates status)
router.patch("/:id/status", auth, allow("company"), async (req, res) => {
  const { status } = req.body; // IN_REVIEW | ACCEPTED | REJECTED
  if (!["IN_REVIEW", "ACCEPTED", "REJECTED"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }
  const sub = await Submission.findById(req.params.id).populate("challenge");
  if (!sub) return res.status(404).json({ message: "Submission not found" });

  // only the company that owns the challenge can update
  if (sub.challenge.postedBy.toString() !== req.user.id) {
    return res.status(403).json({ message: "Not owner" });
  }

  sub.status = status;
  await sub.save();
  res.json(sub);
});

module.exports = router;
