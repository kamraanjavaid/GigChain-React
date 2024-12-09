const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Conversation",
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: {
    type: String,
    required: false,
  },

  messageType: {
    type: String,
    enum: ["text", "proposal", "negotiation", "system"],
    default: "text",
  },

  proposal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Proposal",
  },

  timestamp: {
    type: Date,
    default: Date.now,
  },
});

messageSchema.pre("save", async function (next) {
  if (this.messageType === "proposal" && this.proposalId) {
    this.proposal = await mongoose.model("Proposal").findById(this.proposalId);
  }
  next();
});

messageSchema.pre("find", function () {
  this.populate("proposal");
});

messageSchema.pre("findOne", function () {
  this.populate("proposal");
});

messageSchema.virtual("proposalDetails").get(function () {
  if (this.messageType === "proposal" && this.proposal) {
    return this.proposal;
  }
  return null;
});

messageSchema.set("toJSON", { virtuals: true });
messageSchema.set("toObject", { virtuals: true });

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
