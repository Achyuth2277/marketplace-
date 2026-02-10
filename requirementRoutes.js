const router = require("express").Router();
const Requirement = require("../models/Requirement");
const { auth, allow } = require("../middleware/auth");

/* ------------------------------------------------------
   1️⃣ POST /api/requirements
   Company creates a new requirement
------------------------------------------------------ */
router.post("/", auth, allow("company"), async (req, res) => {
  try {
    const { title, description, industry, budget, deadline } = req.body;

    const requirement = await Requirement.create({
      title,
      description,
      industry,
      budget,
      deadline,
      postedBy: req.user.id,
    });

    res.status(201).json({
      message: "✅ Requirement posted successfully!",
      requirement,
    });
  } catch (err) {
    console.error("Error creating requirement:", err);
    res.status(500).json({ message: "Error creating requirement", error: err.message });
  }
});

/* ------------------------------------------------------
   2️⃣ GET /api/requirements
   Public: All users (for browsing)
------------------------------------------------------ */
router.get("/", async (req, res) => {
  try {
    const { q, status, industry } = req.query;
    const filter = {};

    if (q) filter.title = new RegExp(q, "i");
    if (status) filter.status = status;
    if (industry) filter.industry = industry;

    const requirements = await Requirement.find(filter)
      .populate("postedBy", "name email")
      .sort({ createdAt: -1 });

    res.json(requirements);
  } catch (err) {
    res.status(500).json({ message: "Error fetching requirements", error: err.message });
  }
});

/* ------------------------------------------------------
   3️⃣ GET /api/requirements/my
   Company: View only their own requirements
------------------------------------------------------ */
router.get("/my", auth, allow("company"), async (req, res) => {
  try {
    const myReqs = await Requirement.find({ postedBy: req.user.id }).sort({ createdAt: -1 });
    res.json(myReqs);
  } catch (err) {
    res.status(500).json({ message: "Error fetching company requirements", error: err.message });
  }
});

/* ------------------------------------------------------
   4️⃣ PUT /api/requirements/:id
   Company updates its own requirement
------------------------------------------------------ */
router.put("/:id", auth, allow("company"), async (req, res) => {
  try {
    const requirement = await Requirement.findById(req.params.id);
    if (!requirement) return res.status(404).json({ message: "Requirement not found" });

    if (requirement.postedBy.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });

    const { title, description, industry, budget, deadline, status } = req.body;

    if (title) requirement.title = title;
    if (description) requirement.description = description;
    if (industry) requirement.industry = industry;
    if (budget) requirement.budget = budget;
    if (deadline) requirement.deadline = deadline;
    if (status) requirement.status = status;

    await requirement.save();
    res.json({ message: "✅ Requirement updated successfully", requirement });
  } catch (err) {
    res.status(500).json({ message: "Error updating requirement", error: err.message });
  }
});

/* ------------------------------------------------------
   5️⃣ DELETE /api/requirements/:id
   Company deletes its own requirement
------------------------------------------------------ */
router.delete("/:id", auth, allow("company"), async (req, res) => {
  try {
    const requirement = await Requirement.findById(req.params.id);
    if (!requirement) return res.status(404).json({ message: "Requirement not found" });

    if (requirement.postedBy.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized to delete" });

    await requirement.deleteOne();
    res.json({ message: "🗑️ Requirement deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting requirement", error: err.message });
  }
});
// GET /api/requirements/my — Fetch all requirements posted by the logged-in company
// GET REQUIREMENTS POSTED BY COMPANY
router.get("/company", auth, allow("company"), async (req, res) => {
  try {
    const requirements = await Requirement.find({
      postedBy: req.user.id
    }).sort({ createdAt: -1 });

    res.json(requirements);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load requirements" });
  }
});



module.exports = router;
