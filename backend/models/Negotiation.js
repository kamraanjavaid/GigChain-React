const mongoose = require("mongoose");

const NegotiationSchema = new mongoose.Schema({
    negotiation_id: String,
    proposal_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Proposal",
        required: true
    },
    conversation_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Conversation",
        required: true
    },
    rounds: [{
        timestamp: { type: Date, default: Date.now },
        budget: Number,
        deadline: Date,
        notes: String,
        proposed_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected'],
            default: 'pending'
        }
    }],
    current_round: { type: Number, default: 0 }
});

const Negotiation = mongoose.model("Negotiation", NegotiationSchema);
module.exports = Negotiation;
