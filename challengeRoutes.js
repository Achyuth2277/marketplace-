const router = require("express").Router();
const Challenge = require("../models/Challenge");
const Submission = require("../models/Submission");
const { auth, allow } = require("../middleware/auth");

// GET /api/challenges (public + filters)
router.get("/", async (req, res) => {
  const { q, industry, status, postedBy } = req.query;
  const filter = {};
  if (q) filter.title = new RegExp(q, "i");
  if (industry) filter.industry = industry;
  if (status) filter.status = status;
  if (postedBy) filter.postedBy = postedBy;

  const items = await Challenge.find(filter)
    .populate("postedBy", "name role")
    .sort({ createdAt: -1 });

  res.json(items);
});

// ✅ Get challenges posted by logged-in company
router.get("/my-challenges", auth, allow("company"), async (req, res) => {
  try {
    const challenges = await Challenge.find({ postedBy: req.user.id })
      .sort({ createdAt: -1 });

    res.json(challenges);
  } catch (err) {
    res.status(500).json({ message: "Error fetching challenges", error: err.message });
  }
});

// POST /api/challenges (company only)
router.post("/", auth, allow("company"), async (req, res) => {
  const { title, description, industry, rewardNote } = req.body;
  const challenge = await Challenge.create({
    title, description, industry, rewardNote, postedBy: req.user.id
  });
  res.status(201).json(challenge);
});

// PUT /api/challenges/:id (owner company only)
router.put("/:id", auth, allow("company"), async (req, res) => {
  const c = await Challenge.findById(req.params.id);
  if (!c) return res.status(404).json({ message: "Challenge not found" });
  if (c.postedBy.toString() !== req.user.id) return res.status(403).json({ message: "Not owner" });

  const { title, description, industry, rewardNote, status } = req.body;
  if (title !== undefined) c.title = title;
  if (description !== undefined) c.description = description;
  if (industry !== undefined) c.industry = industry;
  if (rewardNote !== undefined) c.rewardNote = rewardNote;
  if (status !== undefined) c.status = status;
  await c.save();
  res.json(c);
});

// DELETE /api/challenges/:id (owner company only)
router.delete("/:id", auth, allow("company"), async (req, res) => {
  const c = await Challenge.findById(req.params.id);
  if (!c) return res.status(404).json({ message: "Challenge not found" });
  if (c.postedBy.toString() !== req.user.id) return res.status(403).json({ message: "Not owner" });
  await c.deleteOne();
  res.json({ ok: true });
});

module.exports = router;
