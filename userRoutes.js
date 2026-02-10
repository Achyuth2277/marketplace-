const router = require("express").Router();
const User = require("../models/User");
const Idea = require("../models/Idea"); // if idea model exists

// Get all Companies
router.get("/companies", async (req, res) => {
  const companies = await User.find({ role: "company" }).select("name email");
  res.json(companies);
});

// Get all Creators + their ideas
router.get("/creators", async (req, res) => {
  const creators = await User.find({ role: "creator" }).select("name email");
  res.json(creators);
});


const Challenge = require("../models/Challenge");

router.get("/company/:id", async (req, res) => {
  try {
    const company = await User.findById(req.params.id).select("name email");
    if (!company) return res.status(404).json({ message: "Company not found" });

    const challenges = await Challenge.find({ postedBy: req.params.id })
      .select("title status deadline rewardAmount")
      .sort({ createdAt: -1 });

    res.json({ company, challenges });
  } catch (err) {
    res.status(500).json({ message: "Error loading company profile" });
  }
});
module.exports = router;
