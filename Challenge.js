const mongoose = require("mongoose");

const challengeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    industry: { type: String },           // e.g., "Healthcare", "AI", "Agri"
    rewardNote: { type: String },         // optional text like "cash reward", "internship", "licensing"
    status: { type: String, enum: ["OPEN", "CLOSED"], default: "OPEN" },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true } // company
  },
  { timestamps: true }
);

module.exports = mongoose.model("Challenge", challengeSchema);
