const mongoose = require("mongoose");

const employerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },


  industry: String,

  amountSpent: Number,

  projectsCompleted: Number,

  verificationStatus: {
    type: String,
    enum: ["verified", "un-verified"],
    default: "un-verified",
  },
  rating: Number,
});

const Employer = mongoose.model("Employer", employerSchema);
module.exports = Employer;
