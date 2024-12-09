const mongoose = require("mongoose");

const emailVerificationSchema = new mongoose.Schema({
  email: String,
  verificationCode: String,
  verificationCodeExpires: Date,
});

module.exports = mongoose.model("EmailVerification", emailVerificationSchema);
