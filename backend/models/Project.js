const mongoose = require("mongoose");

const deliverableSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
  },
  submittedAt: {
    type: Date,
  },
  status: {
    type: String,
    enum: ["pending", "submitted", "accepted", "revision_requested"],
    default: "pending",
  },
});

const reviewSchema = new mongoose.Schema({
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
  },
});

const projectSchema = new mongoose.Schema({
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service",
    required: true,
  },

  employerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  freelancerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Conversation",
    required: true,
  },
  proposalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Proposal",
    required: true,
  },

  status: {
    type: String,
    enum: ["pending", "in_progress", "completed", "cancelled"],
    default: "pending",
  },

  budget: {
    type: Number,
    required: true,
  },

  deadline: {
    type: Date,
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },

  completedAt: {
    type: Date,
  },

  clientReview: reviewSchema,
  deliverables: [deliverableSchema],
});

projectSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;
