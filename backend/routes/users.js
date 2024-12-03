const express = require("express");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const multerS3 = require("multer-s3");
const { S3Client } = require("@aws-sdk/client-s3");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const { sendVerificationEmail } = require("../utils/emailService");
const axios = require("axios");

const router = express.Router();

const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

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
    contentType: multerS3.AUTO_CONTENT_TYPE,
    // acl: 'public-read',
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + "-" + file.originalname);
    },
  }),
});

router.get("/user/:userId", async (req, res) => {
  console.log("This is the userid in user api endpoint ", req.params.userId);
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    console.log("User in user api endpoint:", user);

    res.json({ user });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

router.put("/user/:userId/update", async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, expertise, languages, about } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    user.name = name;
    user.expertise = expertise;
    user.languages = languages;
    user.about = about;
    await user.save();
    res.json({ user });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

router.post("/register", async (req, res) => {
  const defaultAvatar =
    "https://servicesthumbnailbucket.s3.ap-south-1.amazonaws.com/profile_avatar.jpg";
  const defaultCover =
    "https://servicesthumbnailbucket.s3.ap-south-1.amazonaws.com/defaultCover.png";

  try {
    const { firstName, lastName, userType, email, password } = req.body;

    // const ip = req.ip;

    // console.log("IP in register route:", ip);
    // console.log("IP in register route:", req.socket.remoteAddress);

    // const locationResponse = await axios.get(`https://ipapi.co/${ip}/json/`);
    // const locationData = locationResponse.data;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    user = new User({
      firstName,
      lastName,
      userType,
      email,
      password,
      profilePictureUrl: defaultAvatar,
      coverPictureUrl: defaultCover,

      // location: {
      //   city: locationData.city,
      //   country: locationData.country_name,
      //   timezone: locationData.timezone,
      // },

      verificationCode: undefined,
      verificationCodeExpires: undefined,
      isVerified: false,
    });

    await user.save();

    return res.status(200).json({
      msg: "User registered successfully, please verify your email",
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Server error", error: err.message || err.toString() });
  }
});

router.post("/send-verification", async (req, res) => {
  try {
    const { email } = req.body;
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    const verificationCodeExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    let user = await User.findOne({ email });
    if (user) {
      user.verificationCode = verificationCode;
      user.verificationCodeExpires = verificationCodeExpires;
    } else {
      console.log("Problem in finding user, we'll handle this later");
    }

    await sendVerificationEmail(email, verificationCode);

    res.json({ message: "Verification code sent to your email" });
  } catch (err) {
    console.error(
      "Error sending verification code (Error occured in backend)",
      err
    );
    res.status(500).json({
      message: "Error sending verification code (Error occured in backend)",
      error: err.message || err.toString(),
    });
  }
});

router.get("/verify-code", async (req, res) => {
  try {
    const { email, verificationCode } = req.body;
    const user = await User.findOne({ email });
    console.log("User in verify-code endpoint:", user);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    if (user.verificationCode !== verificationCode) {
      return res.status(400).json({ msg: "Invalid verification code" });
    }
    if (user.verificationCodeExpires < Date.now()) {
      return res.status(400).json({ msg: "Verification code expired" });
    }

    console.log("User data for payload:", JSON.stringify(user, null, 2));

    res.data = {
      success: true,
      message: "Verification code verified successfully",
    };
    res.status(200).json(res.data);
  } catch (err) {
    console.error("Error verifying verification code", err);
    res.status(500).json({ msg: "Internal server error" });
  }
});

router.post("/register-google", async (req, res) => {
  const defaultAvatar =
    "https://servicesthumbnailbucket.s3.ap-south-1.amazonaws.com/profile_avatar.jpg";
  const defaultCover =
    "https://servicesthumbnailbucket.s3.ap-south-1.amazonaws.com/defaultCover.png";

  try {
    const { tokenId, userType } = req.body;

    if (!userType || !["employer", "freelancer"].includes(userType)) {
      return res.status(400).json({ error: "Invalid or missing userType" });
    }

    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const googlePayload = ticket.getPayload();
    const { given_name, family_name, email, picture } = googlePayload;

    let user = await User.findOne({ email });

    const generateToken = (user) => {
      try {
        const payload = {
          user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            userType: user.userType,
            profilePictureUrl: user.profilePictureUrl,
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
            res.json({ token, user: payload.user });
          }
        );
      } catch (err) {
        console.error("Error in JWT signing:", err);
        res.status(500).json({ msg: "Server error during authentication" });
      }
    };

    if (user) {
      generateToken(user);
    } else {
      user = new User({
        firstName: given_name,
        lastName: family_name,
        email,
        userType,
        profilePictureUrl: picture || defaultAvatar,
        isVerified: true,
      });

      await user.save();
      generateToken(user);
    }
  } catch (error) {
    console.error(
      "Error registering with Google",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Received signin request for email:", email);

    let user = await User.findOne({ email });
    console.log("User found:", user ? "Yes" : "No");

    if (!user) {
      console.log("User not found for email:", email);
      return res.status(400).json({ msg: "Incorrect email" });
    }

    console.log("Checking password matching");
    console.log("Provided password:", password);
    console.log("Stored hashed password:", user.password);

    try {
      const isMatch = await bcrypt.compare(password, user.password);
      console.log("Password match result:", isMatch);

      if (!isMatch) {
        console.log("Password does not match");
        return res.status(400).json({ msg: "Incorrect password" });
      }

      console.log("Password matched successfully");

      console.log("User data for payload:", JSON.stringify(user, null, 2));

      const payload = {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          userType: user.userType,
          profilePictureUrl: user.profilePictureUrl,
          coverPictureUrl: user.coverPictureUrl,
          expertise: user.expertise,
          languages: user.languages,
          about: user.about,
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
          res.json({ token, user: payload.user });
        }
      );
    } catch (err) {
      console.error("Error in password comparison or JWT signing:", err);
      res.status(500).json({ msg: "Server error during authentication" });
    }
  } catch (err) {
    console.error("Server error in signin route:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

router.get("/search", async (req, res) => {
  try {
    const { query } = req.query;
    const users = await User.find({
      $or: [
        { firstName: { $regex: query, $options: "i" } },
        { lastName: { $regex: query, $options: "Yi" } },
        {
          $expr: {
            $regexMatch: {
              input: { $concat: ["$firstName", " ", "$lastName"] },
              regex: query,
              options: "i",
            },
          },
        },
      ],
    });
    res.json(users);
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/user", async (req, res) => {
  try {
    const token = req.header("Authorization");
    if (!token) {
      return res.status(401).json({ msg: "No token, authorization denied" });
    }

    const decoded = jwt.verify(
      token.replace("Bearer ", ""),
      process.env.JWT_SECRET
    );
    const userId = decoded.user.id;

    const user = await User.findById(userId);
    const filteredUser = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      userType: user.userType,
      profilePictureUrl: user.profilePictureUrl,
      coverPictureUrl: user.coverPictureUrl,
    };
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    console.log("User mil gaya :", user);

    res.json({ user: user });
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ msg: "Invalid token" });
    }
    res.status(500).json({ msg: "Server error" });
  }
});

router.get("/:userId/profile-picture", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(408).json({ msg: "User not found" });
    }

    res.json({ profilePictureUrl: user.profilePictureUrl });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

router.post(
  "/:userId/profile-picture",
  upload.single("profilePicture"),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.userId);
      if (!user) {
        return res.status(404).json({ msg: "User not found" });
      }

      if (!req.file) {
        return res.status(400).json({ msg: "No profile picture uploaded" });
      }

      user.profilePictureUrl = req.file.location;
      await user.save();

      res.json({ msg: "Profile picture uploaded successfully" });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

router.get("/:userId/cover-picture", async (req, res) => {
  console.log(
    "This is the userid in profile picture api endpoint ",
    req.params.userId
  );
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(408).json({ msg: "User not found" });
    }

    res.json({ coverPictureUrl: user.coverPictureUrl });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

router.post(
  "/:userId/cover-picture",
  upload.single("coverPicture"),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.userId);
      if (!user) {
        return res.status(404).json({ msg: "User not found" });
      }

      if (!req.file) {
        return res.status(400).json({ msg: "No cover picture uploaded" });
      }

      user.coverPictureUrl = req.file.location;
      await user.save();

      res.json({ msg: "Cover picture uploaded successfully" });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

module.exports = router;
