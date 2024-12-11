const express = require("express");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const multerS3 = require("multer-s3");
const Freelancer = require("../models/Freelancer");
const Employer = require("../models/Employer");
const { S3Client } = require("@aws-sdk/client-s3");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const { sendVerificationEmail } = require("../utils/emailService");
const axios = require("axios");
const EmailVerification = require("../models/EmailVerification");

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

router.put("/:userId/update-skills", async (req, res) => {
  const { skills } = req.body;
  const userId = req.params.userId;
  let user = await Freelancer.findOne({ user: userId });
  if (!user) {
    user = new Freelancer({ user: userId });
  }

  user.skills = skills;
  await user.save();
  res.status(200).json({ msg: "Skills updated successfully" });
});

router.put("/:userId/update-languages", async (req, res) => {
  const { languages } = req.body;
  const userId = req.params.userId;
  const user = await Freelancer.findOne({ user: userId });
  if (!user) {
    user = new Freelancer({ user: userId });
  }

  user.languages = languages;
  await user.save();
  res.status(200).json({ msg: "Languages updated successfully" });
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

    if (user.userType === "freelancer") {
      const freelancer = await Freelancer.findOne({ user: userId });
      res.json({ user, freelancer });
    } else if (user.userType === "employer") {
      const employer = await Employer.findOne({ user: userId });
      res.json({ user, employer });
    }
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

router.put("/user/:userId/update-wallet-address", async (req, res) => {
  try {
    const { userId } = req.params;
    const { walletAddress } = req.body;
    const user = await User.findById(userId);
    user.walletAddress = walletAddress;
    await user.save();
    res.status(200).json({ user });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

router.get("/user/:userId/wallet-address", async (req, res) => {
  const { userId } = req.params;
  const user = await User.findById(userId);
  res.json({ walletAddress: user.walletAddress });
});

router.post("/register", async (req, res) => {
  const defaultAvatar =
    "https://servicesthumbnailbucket.s3.ap-south-1.amazonaws.com/profile_avatar.jpg";
  const defaultCover =
    "https://servicesthumbnailbucket.s3.ap-south-1.amazonaws.com/defaultCover.png";

  try {
    const { firstName, lastName, email, password } = req.body;

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
      email,
      password,
      profilePictureUrl: defaultAvatar,
      coverPictureUrl: defaultCover,

      // location: {
      //   city: locationData.city,
      //   country: locationData.country_name,
      //   timezone: locationData.timezone,
      // },

      isVerified: true,
    });

    await user.save();

    return res.status(200).json({
      msg: "User registered successfully",
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
    const verificationCodeExpires = Date.now() + 10 * 60 * 1000;

    let emailVerification;
    try {
      emailVerification = await EmailVerification.create({
        email,
        verificationCode: "96925",
        verificationCodeExpires: Date.now() + 10 * 60 * 1000,
      });

      res.status(200).json({ msg: "Verification code sent to your email" });
    } catch (err) {
      console.error("Error finding user in send-verification endpoint:", err);
      return res.status(500).json({ msg: "Internal server error" });
    }

    // if (emailVerification) {
    //   emailVerification.verificationCode = verificationCode;
    //   emailVerification.verificationCodeExpires = verificationCodeExpires;
    // } else {
    //   emailVerification = new EmailVerification({
    //     email,
    //     verificitionCode: "96925",
    //     verificationCodeExpires,
    //   });
    // }

    // await sendVerificationEmail(email, verificationCode);

    // res.json({ message: "Verification code sent to your email" });
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

router.post("/verify-code", async (req, res) => {
  try {
    const { email, verificationCode } = req.body;
    console.log("Email in verify-code endpoint:", email);

    let user;
    try {
      user = await EmailVerification.findOne({ email });
    } catch (err) {
      console.error("Error finding user in verify-code endpoint:", err);
      return res.status(500).json({ msg: "Internal server error" });
    }

    console.log("User in verify-code endpoint:", user);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    console.log("Verification code in verify-code endpoint:", verificationCode);
    console.log(
      "User verification code in verify-code endpoint:",
      user.verificationCode
    );
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
    res.status(500).json({
      message: "Error verifying verification code",
      error: err.message || err.toString(),
    });
  }
});

// router.get("/verify-code", async (req, res) => {
//   try {
//     const { email, verificationCode } = req.body;
//     const user = await User.findOne({ email });
//     console.log("User in verify-code endpoint:", user);
//     if (!user) {
//       return res.status(404).json({ msg: "User not found" });
//     }
//     if (user.verificationCode !== verificationCode) {
//       return res.status(400).json({ msg: "Invalid verification code" });
//     }
//     if (user.verificationCodeExpires < Date.now()) {
//       return res.status(400).json({ msg: "Verification code expired" });
//     }

//     console.log("User data for payload:", JSON.stringify(user, null, 2));

//     res.data = {
//       success: true,
//       message: "Verification code verified successfully",
//     };
//     res.status(200).json(res.data);
//   } catch (err) {
//     console.error("Error verifying verification code", err);
//     res.status(500).json({ msg: "Internal server error" });
//   }
// });

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

router.get("/check-availability", async (req, res) => {
  const { email } = req.query;
  const user = await User.findOne({ email });
  res.json({ available: !user });
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

router.post("/switchRole", async (req, res) => {
  try {
    const { role, userId } = req.body;
    console.log("Switching to role:", role, "for user:", userId);
    const user = await User.findById(userId);
    console.log("User in switchRole endpoint:", user);
    user.userType = role;
    await user.save();
    res.status(200).json({ message: "User role switched successfully" });
  } catch (error) {
    console.error("Error switching user role:", error);
    res.status(500).json({ error: "Internal server error" });
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
