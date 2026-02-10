const router = require("express").Router();
const { auth } = require("../middleware/auth");
const User = require("../models/User");

// GET LOGGED-IN USER
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// UPDATE LOGGED-IN USER
router.put("/me", auth, async (req, res) => {
  try {
    const { name, bio, website, skills } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, bio, website, skills },
      { new: true }
    ).select("-password");

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
});

module.exports = router;
