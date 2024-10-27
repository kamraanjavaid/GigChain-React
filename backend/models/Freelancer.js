const mongoose = require("mongoose");

const freelancerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  skills: [
    {
      type: String,
    },
  ],

  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
    },
  ],

  portfolio: [
    {
      title: String,
      description: String,
      link: String,
      images: [String],
    },
  ],
  experience: [
    {
      title: String,
      company: String,
      startDate: Date,
      endDate: Date,
      description: String,
    },
  ],
  education: [
    {
      degree: String,
      institution: String,
      graduationYear: Number,
    },
  ],

  coverPictureUrl: { type: String, required: true },

  languages: [String],

  about: String,

  completedProjects: {
    type: Number,
    default: 0,
  },
  rating: {
    type: Number,
    default: 0,
  },
  totalEarnings: {
    type: Number,
    default: 0,
  },
  verificationStatus: {
    type: String,
    enum: ["verified", "un-verified"],
    default: "un-verified",
  },
});

const Freelancer = mongoose.model("Freelancer", freelancerSchema);

module.exports = Freelancer;
