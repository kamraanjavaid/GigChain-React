const dotenv = require("dotenv");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const socketIO = require("socket.io");
const Message = require("./models/Message");
const Proposal = require("./models/Proposal");
const Negotiation = require("./models/Negotiation");
const passport = require("passport");
const session = require("express-session");

const env = process.env.NODE_ENV || "development";
dotenv.config({ path: `.env.${env}` });
const app = express();

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

require("./config/passport");

const server = http.createServer(app);
const io = socketIO(server, {
  cors: { origin: "*" },
  debug: true,
});

const PORT = process.env.PORT || 5000;

// app.use(cors());

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

mongoose
  .connect(process.env.MONGODB_URI, {})
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("join-conversation", (conversationId) => {
    socket.join(conversationId);
    console.log("User joined conversation:", conversationId);
  });

  socket.on("leave-conversation", (conversationId) => {
    socket.leave(conversationId);
    console.log("User left conversation:", conversationId);
  });

  socket.on("send-message", async (message) => {
    console.log("Received send-message event:", message);

    try {
      const newMessage = new Message({
        conversationId: message.conversationId,
        sender: message.sender,
        content: message.text,
        timestamp: new Date(),
      });

      await newMessage.save();

      io.to(message.conversationId).emit("new message", newMessage);
    } catch (error) {
      socket.emit("error", error.message);
      console.error("Error saving message:", error);
    }
  });

  socket.on(
    "proposal-changes",
    async (budget, deadline, conversationId, callback) => {
      console.log(
        "Received proposal-changes event:",
        budget,
        deadline,
        conversationId
      );

      const previousProposal = await Proposal.findOne({ conversationId });

      if (!budget) {
        budget = previousProposal.budget;
      }
      if (!deadline) {
        deadline = previousProposal.deadline;
      }

      try {
        const updatedProposal = await Proposal.findOneAndUpdate(
          { conversationId },
          { $set: { budget, deadline } },
          { new: true, upsert: true }
        );

        io.to(conversationId).emit("proposal-updated", updatedProposal);

        callback({
          success: true,
          data: updatedProposal,
        });
      } catch (error) {
        console.error("Error updating proposal:", error);
        callback({
          success: false,
          error: error.message,
        });
      }
    }
  );

  socket.on("negotiation-update", async (data, callback) => {
    console.log("Negotiation update event received");
    try {
      const { conversationId, sender, budget, deadline, notes } = data;

      const negotiation = await Negotiation.findOne({
        conversation_id: conversationId,
      });

      if (!negotiation) {
        const proposal = await Proposal.findOne({
          conversationId,
        });

        if (!proposal) {
          throw new Error("No proposal found for this conversation");
        }

        const newNegotiation = new Negotiation({
          proposal_id: proposal._id,
          conversation_id: conversationId,
          rounds: [
            {
              budget,
              deadline,
              notes,
              proposed_by: sender,
              status: "pending",
            },
          ],
          current_round: 0,
        });

        await newNegotiation.save();

        const systemMessage = new Message({
          conversationId,
          sender: sender,
          metadata: {
            type: "update",
            negotiationId: newNegotiation._id,
            round: 0,
            changes: {
              budget,
              deadline,
              notes,
            },
          },
          messageType: "negotiation",
        });

        await systemMessage.save();

        io.to(conversationId).emit("new_negotiation", {
          negotiation: newNegotiation,
          message: systemMessage,
        });

        callback({
          success: true,
          data: newNegotiation,
        });
      } else {
        const newRound = {
          budget,
          deadline,
          notes,
          proposed_by: sender,
          status: "pending",
        };

        negotiation.rounds.push(newRound);
        negotiation.current_round += 1;
        await negotiation.save();

        const systemMessage = new Message({
          conversationId,
          sender: sender,
          content: JSON.stringify({
            type: "negotiation_update",
            negotiation_ref: negotiation._id,
            round: negotiation.current_round,
            changes: {
              budget,
              deadline,
              notes,
            },
          }),
          messageType: "negotiation",
        });

        await systemMessage.save();

        io.to(conversationId).emit("negotiation_updated", {
          negotiation,
          message: systemMessage,
        });

        callback({
          success: true,
          data: negotiation,
        });
      }
    } catch (error) {
      console.error("Negotiation update error:", error);
      callback({
        success: false,
        error: error.message,
      });
    }
  });

  socket.on("negotiation-response", async (data, callback) => {
    try {
      const { negotiationId, roundIndex, response, userId } = data;

      const negotiation = await Negotiation.findById(negotiationId);
      if (!negotiation) {
        throw new Error("Negotiation not found");
      }

      negotiation.rounds[roundIndex].status = response;
      await negotiation.save();

      const systemMessage = new Message({
        conversationId: negotiation.conversation_id,
        sender: userId,
        content: JSON.stringify({
          type: "negotiation_response",
          negotiation_ref: negotiationId,
          round: roundIndex,
          response,
        }),
        messageType: "negotiation",
      });

      await systemMessage.save();

      if (response === "accepted") {
        const proposal = await Proposal.findById(negotiation.proposal_id);
        if (proposal) {
          proposal.budget = negotiation.rounds[roundIndex].budget;
          proposal.deadline = negotiation.rounds[roundIndex].deadline;
          proposal.status = "accepted";
          await proposal.save();
        }
      }

      io.to(negotiation.conversation_id).emit("negotiation_response", {
        negotiation,
        message: systemMessage,
      });

      callback({
        success: true,
        data: negotiation,
      });
    } catch (error) {
      console.error("Negotiation response error:", error);
      callback({
        success: false,
        error: error.message,
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

app.get("/", (req, res) => {
  res.send("Server is up and running!");
});

const userRoutes = require("./routes/users");
app.use("/api/users", userRoutes);

const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

const gigRoutes = require("./routes/gig");
app.use("/api/gig", gigRoutes);

const serviceRoutes = require("./routes/services");
app.use("/api/services", serviceRoutes);

const projectRoutes = require("./routes/projects");
app.use("/api/projects", projectRoutes);

const messageRoutes = require("./routes/conversations");
app.use("/api/conversations", messageRoutes);

const negotiationRoutes = require("./routes/negotiations");
app.use("/api/negotiations", negotiationRoutes);

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
