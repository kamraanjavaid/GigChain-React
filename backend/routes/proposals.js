const express = require("express");
const router = express.Router();
const Proposal = require("../models/Proposal");
const authMiddleware = require("../middleware/auth");

router.post("/create", async (req, res) => {
  try {
    const { gigId, clientId, freelancerId, message, budget } = req.body;
    console.log("ProposalRequest Body:", req.body);

    const newProposal = new Proposal({
      gigId,
      clientId,
      freelancerId,
      message,
      budget,
    });
    await newProposal.save();
    res.status(201).json({
      message: "Proposal created successfully",
      proposal: newProposal,
    });
  } catch (error) {
    res.status(500);
    console.log(error);
    res.json({ message: "Error creating proposal", error: error.message });
  }
});

router.get("/freelancer-proposals/:freelancerId", async (req, res) => {
  try {
    const proposals = await Proposal.find({
      freelancerId: req.params.freelancerId,
    })
      .populate("gigId")
      .populate("clientId", "firstName lastName email")
      .sort({ createdAt: -1 });
    res.json(proposals);
    console.log("Proposals:", proposals);
  } catch (error) {
    console.log("Error fetching proposals:", error);
    res
      .status(500)
      .json({ message: "Error fetching proposals", error: error.message });
  }
});

router.put("/update-proposal-status/:proposalId", async (req, res) => {
  try {
    const { status } = req.body;
    const updatedProposal = await Proposal.findByIdAndUpdate(
      req.params.proposalId,
      { status },
      { new: true }
    );
    res.json(updatedProposal);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating proposal", error: error.message });
  }
});

// router.get('/freelancer-proposals/:freelancerId', async (req, res) => {
//   // Implementation
// });

// router.post('/proposals', async (req, res) => {
//   // Implementation
// });

// router.put('/proposals/:proposalId', async (req, res) => {
//   // Implementation
// });

// router.get('/proposals/:proposalId/messages', async (req, res) => {
//   // Implementation
// });

// router.post('/proposals/:proposalId/messages', async (req, res) => {
//   // Implementation
// });

module.exports = router;
