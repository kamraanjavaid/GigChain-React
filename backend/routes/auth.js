const passport = require("passport");
const User = require("../models/User");
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

router.get("/google", (req, res, next) => {
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })(req, res, next);
});

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/signin",
  }),

  (req, res) => {
    try {
      const user = req.user;

      console.log("User in google callback:", user);

      const payload = {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          userType: user.userType,
          profilePictureUrl: user.profilePictureUrl,
          coverPictureUrl: user.coverPictureUrl,
        },
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: 360000 },
        (err, token) => {
          if (err) {
            console.error("Error in JWT signing:", err);
            throw err;
          }
          console.log("JWT token generated successfully");
          console.log("Sending response to client");
          console.log("Token:", token);
          //   res.json({ token, user: payload.user });
          res.redirect(
            `${process.env.FRONTEND_URL}/auth/success/${token}/${JSON.stringify(
              payload.user
            )}`
          );
        }
      );
    } catch (error) {
      console.error("Error in google callback:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

module.exports = router;
