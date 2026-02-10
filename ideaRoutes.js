const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Idea = require("../models/Idea");
const { auth, allow } = require("../middleware/auth");

const router = express.Router();

/* ---------------- UPLOAD CONFIG ---------------- */

const uploadDir = path.join(__dirname, "../uploads/ideas");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({ storage });

/* ---------------- ROUTES ---------------- */

// 1️⃣ Upload idea (creator only)
router.post(
  "/upload",
  auth,
  allow("creator"),
  upload.single("file"),
  async (req, res) => {
    try {
      const { title, description, tags } = req.body;

      const idea = await Idea.create({
        title,
        description,
        tags,
        createdBy: req.user.id,
        file: req.file ? `/uploads/ideas/${req.file.filename}` : null,
      });

      res.status(201).json({ message: "Idea uploaded", idea });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// 2️⃣ Get ideas by creator (company OR creator)
router.get("/by-creator/:id", auth, async (req, res) => {
  try {
    const ideas = await Idea.find({ createdBy: req.params.id }).sort({
      createdAt: -1,
    });
    res.json(ideas);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3️⃣ Get my ideas (creator dashboard)
router.get("/my", auth, allow("creator"), async (req, res) => {
  try {
    const ideas = await Idea.find({ createdBy: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(ideas);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4️⃣ Update idea
router.put("/:id", auth, allow("creator"), async (req, res) => {
  try {
    const idea = await Idea.findOne({
      _id: req.params.id,
      createdBy: req.user.id,
    });

    if (!idea) return res.status(404).json({ message: "Idea not found" });

    const { title, description, tags } = req.body;
    if (title) idea.title = title;
    if (description) idea.description = description;
    if (tags) idea.tags = tags;

    await idea.save();
    res.json({ message: "Idea updated", idea });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 5️⃣ Delete idea
router.delete("/:id", auth, allow("creator"), async (req, res) => {
  try {
    const idea = await Idea.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.id,
    });

    if (!idea) return res.status(404).json({ message: "Idea not found" });

    res.json({ message: "Idea deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
