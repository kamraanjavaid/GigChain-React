const express = require("express");
const router = express.Router();
const Project = require("../models/Project");
const Conversation = require("../models/Conversation");
const Service = require("../models/Service");
const Proposal = require("../models/Proposal");
const authMiddleware = require("../middleware/auth");

router.post("/accept-proposal", authMiddleware, async (req, res) => {
  const {
    proposalId,
    employerId,
    freelancerId,
    serviceId,
    conversationId,
    budget,
    deadline,
    status,
  } = req.body;

  try {
    const project = await Project.create({
      serviceId,
      employerId,
      freelancerId,
      conversationId,
      proposalId,
      status,
      budget,
      deadline,
    });

    console.log("project created", project);

    await Conversation.findByIdAndUpdate(conversationId, {
      projectId: project._id,
      status: "accepted",
    });

    try {
      console.log("proposalId", proposalId);
      let proposal = await Proposal.findOne({ _id: proposalId });
      console.log("proposal", proposal);
      proposal.status = "accepted";
      await proposal.save();
      console.log("proposal updated", proposal);
    } catch (error) {
      console.error("Error updating proposal status:", error);
    }

    const service = await Service.findById(serviceId);

    await Service.findByIdAndUpdate(serviceId, {
      conversions: service.conversions + 1,
    });

    res.status(200).json({ message: "Project created successfully", project });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { userType } = req.query;
    console.log("finding projects for user", userId, "with userType", userType);

    let projects;

    if (userType === "freelancer") {
      projects = await Project.find({ freelancerId: userId });
    } else if (userType === "client") {
      projects = await Project.find({ clientId: userId });
    }

    console.log("projects", projects);

    if (projects.length === 0) {
      return res.status(200).json({ message: "No projects found" });
    }
    res.status(200).json({ projects });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

router.get("/project/:projectId", async (req, res) => {
  const { projectId } = req.params;
  try {
    const project = await Project.findById(projectId)
      .populate("serviceId")
      .populate("employerId", "firstName lastName profilePictureUrl")
      .populate("freelancerId", "firstName lastName profilePictureUrl");
    res.status(200).json({ project });
    console.log("project", project);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

router.get("/all-projects", async (req, res) => {
  try {
    const projects = await Project.find();
    res.status(200).json({ projects });

    console.log("projects", projects);
  } catch (error) {}
});

module.exports = router;
