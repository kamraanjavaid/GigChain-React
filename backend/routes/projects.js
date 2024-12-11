const express = require("express");
const router = express.Router();
const Project = require("../models/Project");
const Conversation = require("../models/Conversation");
const Service = require("../models/Service");
const Proposal = require("../models/Proposal");
const authMiddleware = require("../middleware/auth");
const AWS = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const { S3Client } = require("@aws-sdk/client-s3");
const env = require("dotenv");
env.config();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, `deliverables/${Date.now()}-${file.originalname}`);
    },
  }),
});

router.post(
  "/project/:projectId/deliverable",
  upload.single("file"),
  async (req, res) => {
    try {
      const { projectId } = req.params;
      const { description } = req.body;
      const fileUrl = req.file.location;

      const project = await Project.findById(projectId);

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // if (project.freelancerId.toString() !== req.user._id.toString()) {
      //   return res.status(403).json({ message: "Not authorized" });
      // }

      const newDeliverable = {
        description,
        fileUrl,
        submittedAt: new Date(),
        status: "submitted",
      };

      project.deliverables.push(newDeliverable);
      await project.save();

      res.status(200).json({
        success: true,
        deliverable: newDeliverable,
      });
    } catch (error) {
      console.error("Error submitting deliverable:", error);
      res.status(500).json({ message: "Error submitting deliverable" });
    }
  }
);

// router.post("/project/:projectId/update-contract", async (req, res) => {
//   try {
//     const { projectId } = req.params;
//     const { contractAddress, transactionHash } = req.body;
//     const project = await Project.findById(projectId);
//     project.contractAddress = contractAddress;
//     project.transactionHash.contractDeployment = transactionHash;
//     await project.save();
//     res.status(200).json({ project });
//   } catch (error) {
//     console.error("Error updating contract:", error);
//     res.status(500).json({ message: "Error updating contract" });
//   }
// });

router.post("/:projectId/deploy-contract", async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    if (project.status !== "pending") {
      return res
        .status(400)
        .json({ error: "Invalid project status for contract deployment" });
    }

    const { contractAddress, transactionHash } =
      await contractService.deployEscrow(
        project.freelancerWalletAddress,
        project.budget
      );

    project.contractAddress = contractAddress;
    project.status = "escrow_funded";
    project.blockchainLogs.push({
      event: "CONTRACT_DEPLOYED",
      transactionHash,
      timestamp: new Date(),
      initiatedBy: req.user._id,
    });

    await project.save();

    res.json({
      success: true,
      contractAddress,
      transactionHash,
    });
  } catch (error) {
    console.error("Deployment error:", error);
    res.status(500).json({
      error: "Error deploying contract",
      details: error.message,
    });
  }
});

router.post("/accept-proposal", async (req, res) => {
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

  console.log("req.body in accept-proposal", req.body);

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

router.patch("/project/:projectId/status", async (req, res) => {
  try {
    const { projectId } = req.params;
    const { status } = req.body;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // const validTransitions = {
    //   in_progress: [
    //     "marked_as_completed_by_employer",
    //     "marked_as_completed_by_freelancer",
    //   ],
    //   marked_as_completed_by_employer: ["completed"],
    //   marked_as_completed_by_freelancer: ["completed"],
    // };

    // if (!validTransitions[project.status]?.includes(status)) {
    //   return res.status(400).json({ message: "Invalid status transition" });
    // }

    if (
      project.status === "in_progress" &&
      status === "marked_as_completed_by_employer"
    ) {
      project.status = status;
      console.log("project status updated to", project.status);
    } else if (
      project.status === "in_progress" &&
      status === "marked_as_completed_by_freelancer"
    ) {
      project.status = status;
      console.log("project status updated to", project.status);
    } else if (
      project.status === "marked_as_completed_by_employer" &&
      status === "marked_as_completed_by_freelancer"
    ) {
      project.status = "completed";
      console.log("project status updated to", project.status);
    } else if (
      project.status === "marked_as_completed_by_freelancer" &&
      status === "marked_as_completed_by_employer"
    ) {
      project.status = "completed";
      console.log("project status updated to", project.status);
    }

    if (status === "completed") {
      project.completedAt = new Date();
    }

    await project.save();

    const conversation = await Conversation.findByIdAndUpdate(
      project.conversationId,
      {
        status: "completed",
      }
    );

    if (project.status === "completed" && conversation.status === "completed") {
      res.json({ status: project.status });
    }
  } catch (error) {
    console.error("Error updating project status:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/project/:projectId/review", async (req, res) => {
  try {
    const { projectId } = req.params;
    const { rating, comment, reviewerType } = req.body;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // const isEmployer =
    //   project.employerId.toString() === req.user._id.toString();
    // const isFreelancer =
    //   project.freelancerId.toString() === req.user._id.toString();

    // if (!isEmployer && !isFreelancer) {
    //   return res
    //     .status(403)
    //     .json({ message: "Not authorized to review this project" });
    // }

    if (rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
    }

    const review = {
      rating,
      comment,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (reviewerType === "employer") {
      project.employerRating = review.rating;
      project.employerComment = review.comment;
    } else if (reviewerType === "freelancer") {
      project.freelancerRating = review.rating;
      project.freelancerComment = review.comment;
    } else {
      return res.status(400).json({ message: "Invalid reviewer type" });
    }

    if (project.employerRating && project.freelancerRating) {
      project.status = "completed";
      project.completedAt = new Date();
    }

    await project.save();

    const service = await Service.findById(project.serviceId);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    if (reviewerType === "employer") {
      service.reviews.push({
        rating: review.rating,
        comment: review.comment,
        reviewer: project.employerId,
        createdAt: new Date(),
      });
      service.numReviews++;
    }
    await service.save();

    if (reviewerType === "employer") {
      res.json({
        review: project.employerRating,
        status: project.status,
      });
    } else if (reviewerType === "freelancer") {
      res.json({
        review: project.freelancerRating,
        status: project.status,
      });
    }
  } catch (error) {
    console.error("Error submitting review:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/project/:projectId/fund", async (req, res) => {
  try {
    const { projectId } = req.params;
    const { transactionHash } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // if (project.employerId.toString() !== req.user._id.toString()) {
    //   return res.status(403).json({ message: "Not authorized" });
    // }

    project.status = "in_progress";
    project.paymentStatus = "escrow_funded";
    project.transactionHash.escrowFunding = transactionHash;
    await project.save();

    res.status(200).json({ success: true, project });
  } catch (error) {
    console.error("Error updating project funding:", error);
    res.status(500).json({ message: "Error updating project funding" });
  }
});

router.post("/project/:projectId/complete", async (req, res) => {
  try {
    const { projectId } = req.params;
    const { transactionHash } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // if (project.employerId.toString() !== req.user._id.toString()) {
    //   return res.status(403).json({ message: "Not authorized" });
    // }

    project.status = "completed";
    project.paymentStatus = "released";
    project.completedAt = new Date();
    project.transactionHash.paymentRelease = transactionHash;
    await project.save();

    res.status(200).json({ success: true, project });
  } catch (error) {
    console.error("Error completing project:", error);
    res.status(500).json({ message: "Error completing project" });
  }
});

router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { userType } = req.query;
    console.log("finding projects for user", userId, "with userType", userType);

    let projects;

    if (userType === "freelancer") {
      projects = await Project.find({ freelancerId: userId })
        .populate("employerId", "firstName lastName profilePictureUrl")
        .populate("serviceId", "title");
    } else if (userType === "employer") {
      projects = await Project.find({ employerId: userId })
        .populate("freelancerId", "firstName lastName profilePictureUrl")
        .populate("serviceId", "title");
    }

    console.log("projects", projects);

    if (!projects) {
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
