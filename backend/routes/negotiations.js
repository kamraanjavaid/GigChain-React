// routes/negotiations.js
const express = require('express');
const router = express.Router();
const Negotiation = require('../models/Negotiation');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// Get all negotiations for a conversation
router.get('/conversation/:conversationId', async (req, res) => {
    try {
        const negotiations = await Negotiation.findOne({
            conversation_id: req.params.conversationId
        })
        .populate('rounds.proposed_by', 'firstName lastName')
        .sort({ createdAt: -1 });

        res.json(negotiations);
    } catch (error) {
        console.error('Error fetching negotiations:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get specific negotiation
router.get('/:negotiationId', async (req, res) => {
    try {
        const negotiation = await Negotiation.findById(req.params.negotiationId)
            .populate('rounds.proposed_by', 'firstName lastName');
        
        if (!negotiation) {
            return res.status(404).json({ error: 'Negotiation not found' });
        }

        res.json(negotiation);
    } catch (error) {
        console.error('Error fetching negotiation:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get latest negotiation round
router.get('/:negotiationId/latest', async (req, res) => {
    try {
        const negotiation = await Negotiation.findById(req.params.negotiationId);
        
        if (!negotiation || negotiation.rounds.length === 0) {
            return res.status(404).json({ error: 'No rounds found' });
        }

        const latestRound = negotiation.rounds[negotiation.current_round];
        res.json(latestRound);
    } catch (error) {
        console.error('Error fetching latest round:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
