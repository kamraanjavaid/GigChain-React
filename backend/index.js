const dotenv = require("dotenv");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const socketIO = require("socket.io");
const Message = require("./models/Message");
const Proposal = require("./models/Proposal");

const env = process.env.NODE_ENV || "development";
dotenv.config({ path: `.env.${env}` });

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: { origin: process.env.FRONTEND_URL },
  debug: true,
});

const PORT = process.env.PORT || 5000;

app.use(cors());

app.use(express.json());

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

      // if budget and deadline are not provided, use the previous values
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

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

app.get("/", (req, res) => {
  res.send("Server is up and running!");
});

const userRoutes = require("./routes/users");

app.use("/api/users", cors(), userRoutes);

const gigRoutes = require("./routes/gig");
app.use("/api/gig", cors(), gigRoutes);

const serviceRoutes = require("./routes/services");
app.use("/api/service", cors(), serviceRoutes);

const messageRoutes = require("./routes/conversations");
app.use("/api/conversations", cors(), messageRoutes);

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
