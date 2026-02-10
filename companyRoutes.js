const express = require("express");
const { auth, allow } = require("../middleware/auth");
const Requirement = require("../models/Requirement");
const Application = require("../models/Application");
const User = require("../models/User");

const router = express.Router();

/* ===============================
   COMPANY DASHBOARD STATS
================================ */
router.get("/dashboard/stats", auth, allow("company"), async (req, res) => {
  try {
    const companyId = req.user.id;

    const totalRequirements = await Requirement.countDocuments({ postedBy: companyId });
    const activeRequirements = await Requirement.countDocuments({
      postedBy: companyId,
      status: "open"
    });

    const dealsClosed = await Application.countDocuments({
      company: companyId,
      status: "accepted"
    });

    const spentAgg = await Application.aggregate([
      { $match: { company: req.user._id, status: "accepted" } },
      { $group: { _id: null, total: { $sum: "$budget" } } }
    ]);

    res.json({
      totalRequirements,
      activeRequirements,
      dealsClosed,
      budgetSpent: spentAgg[0]?.total || 0
    });
  } catch (err) {
    console.error("Company stats error:", err);
    res.status(500).json({ message: "Company stats error" });
  }
});

/* ===============================
   GET COMPANY PROFILE BY ID
================================ */
router.get("/:id", auth, async (req, res) => {
  try {
    const company = await User.findOne({
      _id: req.params.id,
      role: "company"
    }).select("name email");

    if (!company) return res.status(404).json({ message: "Company not found" });

    res.json(company);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});
router.get("/my-profile", auth, allow("company"), async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json(user);
});

module.exports = router;
