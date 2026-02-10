const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    requirement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Requirement",
      required: true
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    status: {
      type: String,
      enum: ["applied", "reviewed", "accepted", "rejected"],
      default: "applied"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Application", applicationSchema);
