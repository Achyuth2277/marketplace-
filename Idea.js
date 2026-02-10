const mongoose = require("mongoose");

const ideaSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    tags: { type: String },
    file: { type: String },
    reward: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "draft", "sold"], default: "active" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Idea", ideaSchema);
