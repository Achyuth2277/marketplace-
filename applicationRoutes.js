const router = require("express").Router();
const Application = require("../models/Application");
const Requirement = require("../models/Requirement");
const { auth, allow } = require("../middleware/auth");

// APPLY TO REQUIREMENT (CREATOR)
router.post("/:id", auth, allow("creator"), async (req, res) => {

  try {
    const requirementId = req.params.id;

    const requirement = await Requirement.findById(requirementId).populate("postedBy");
    if (!requirement) {
      return res.status(404).json({ message: "Requirement not found" });
    }

    // 🚫 CHECK DUPLICATE
    const alreadyApplied = await Application.findOne({
      requirement: requirementId,
      creator: req.user.id
    });

    if (alreadyApplied) {
      return res.status(400).json({
        message: "You have already applied to this requirement"
      });
    }

    // ✅ CREATE APPLICATION
    const application = await Application.create({
      requirement: requirementId,
      creator: req.user.id,
      company: requirement.postedBy._id,
      message: "I am interested in working on this requirement."
    });

    res.status(201).json({
      message: "Application submitted successfully",
      application
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
// GET APPLICATIONS FOR COMPANY
router.get("/company", auth, allow("company"), async (req, res) => {
  try {
    const applications = await Application.find({
      company: req.user.id
    })
      .populate("creator", "name email")
      .populate("requirement", "title budget")
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: "Error loading inbox" });
  }
});


module.exports = router;
