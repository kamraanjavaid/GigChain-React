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

  contractAddress: {
    type: String,
    unique: true,
    sparse: true,
  },

  contractStatus: {
    type: String,
    enum: ["not_created", "created", "funded", "completed", "disputed"],
    default: "not_created",
  },

  paymentStatus: {
    type: String,
    enum: ["pending", "escrow_funded", "released", "refunded"],
    default: "pending",
  },

  transactionHash: {
    contractCreation: String,
    escrowFunding: String,
    paymentRelease: String,
  },
  blockchainLogs: [
    {
      event: {
        type: String,
        enum: [
          "contract_created",
          "contract_funded",
          "contract_completed",
          "contract_disputed",
        ],
      },
      timestamp: Date,
      transactionHash: String,
      initiatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
  ],
});

projectSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

projectSchema.methods.updateContractStatus = async function (status, txHash) {
  this.contractStatus = status;
  if (txHash) {
    this.blockchainLogs.push({
      event: `contract_${status}`,
      timestamp: new Date(),
      transactionHash: txHash,
    });
  }
  return this.save();
};

projectSchema.methods.updatePaymentStatus = async function (status, txHash) {
  this.paymentStatus = status;
  if (txHash) {
    this.transactionHash[status] = txHash;
  }
  return this.save();
};

projectSchema.methods.addBlockchainLog = async function (
  event,
  txHash,
  userId
) {
  this.blockchainLogs.push({
    event,
    timestamp: new Date(),
    transactionHash: txHash,
    initiatedBy: userId,
  });
  return this.save();
};

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;
