const mongoose = require("mongoose");

const ProposalSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    budget: { type: Number },
    deadline: { type: Date },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Proposal = mongoose.model("Proposal", ProposalSchema);

module.exports = Proposal;
