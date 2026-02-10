const mongoose = require("mongoose");

const requirementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    industry: { type: String },
    budget: { type: Number },
    deadline: { type: Date },
    status: { type: String, enum: ["open", "closed"], default: "open" },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Requirement", requirementSchema);
