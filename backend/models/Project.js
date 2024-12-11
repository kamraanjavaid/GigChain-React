const mongoose = require("mongoose");

const deliverableSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
  },
  submittedAt: {
    type: Date,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "submitted", "accepted", "revision_requested"],
    default: "pending",
  },
});

const reviewSchema = new mongoose.Schema({
  employerRating: {
    type: Number,
    min: 1,
    max: 5,
  },
  employerComment: {
    type: String,
  },
  freelancerRating: {
    type: Number,
    min: 1,
    max: 5,
  },
  freelancerComment: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
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
    enum: [
      "in_progress",
      "marked_as_completed_by_freelancer",
      "marked_as_completed_by_employer",
      "completed",
      "cancelled",
    ],
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

  employerRating: {
    type: Number,
    min: 1,
    max: 5,
  },
  employerComment: {
    type: String,
  },
  freelancerRating: {
    type: Number,
    min: 1,
    max: 5,
  },
  freelancerComment: {
    type: String,
  },
  deliverables: [deliverableSchema],
});

projectSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;
