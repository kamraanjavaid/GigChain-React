const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const multer = require("multer");
const multerS3 = require("multer-s3");
const { S3Client } = require("@aws-sdk/client-s3");
const { DeleteObjectCommand } = require("@aws-sdk/client-s3");
const Service = require("../models/Service");
const User = require("../models/User");


const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Not an image! Please upload only images."), false);
  }
};

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Not an image! Please upload only images."), false);
    }
  },
});

router.get("/search", async (req, res) => {
  const { query } = req.query;
  try {
    const services = await Service.find({
      title: { $regex: query, $options: "i" },
    });
    res.json(services);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// router.get("/search", async (req, res) => {
//   const { query } = req.query;
//   try {
//     const services = await Service.find({ title: { $regex: query, $options: "i" } }).limit(5);
//     res.json(services);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

router.get("/category/:mainCategory/:subCategory", async (req, res) => {
  const { subCategory } = req.params;
  try {
    const services = await Service.find({
      category: subCategory,
    }).sort({ _id: -1 });

    console.log("Services found: ", services);

    if (services.length === 0) {
      return res.status(404).json({ message: "No services found" });
    }

    res.json(services);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// router.get("/:serviceId", async (req, res) => {
//   try {
//     const { serviceId } = req.params;
//     const service = await Service.findOne({ _id: serviceId });
//     res.status(200).json(service);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

router.get("/category/:category", async (req, res) => {
  const { category } = req.params;
  try {
    const services = await Service.find({ category })
      .sort({ _id: -1 })
      .limit(3);
    res.json(services);
    if (!services) {
      return res.status(404).json({ message: "No services found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// router.get("/user", authMiddleware, async (req, res) => {
//   try {
//     const { serviceId } = req.params;
//     // console.log(serviceId);
//     const userId = req.user._id;
//     const services = await Service.find({ user: userId });
//     res.json({ services });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

router.get("/user", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const services = await Service.find({ user: userId }).select(
      "title images impressions clicks conversions"
    );

    const servicesWithAnalytics = services.map((service) => ({
      _id: service._id,
      title: service.title,
      images: service.images,
      impressions: service.impressions,
      clicks: service.clicks,
      conversions: service.conversions,
      conversionRate:
        service.clicks > 0 ? (service.conversions / service.clicks) * 100 : 0,
    }));

    res.json({ services: servicesWithAnalytics });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/get-services/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const services = await Service.find({ user: userId });
    res.status(200).json({ services });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

router.use((req, res, next) => {
  console.log("Incoming request:", req.method, req.url);
  console.log("Request headers:", req.headers);
  console.log("Request body:", req.body);
  next();
});

router.post(
  "/create",
  authMiddleware,
  upload.array("images", 5),
  async (req, res) => {
    try {
      console.log("Request Body:", req.body);
      const { title, description, category, serviceProvider, startingPrice } =
        req.body;

      const userId = req.user._id;
      const imageUrls = req.files.map((file) => file.location);

      const user = await User.findById(userId);
      const providerProfilePicture = user.profilePictureUrl;

      const service = new Service({
        title,
        description,
        category,
        user: userId,
        images: imageUrls,
        serviceProvider,
        providerProfilePicture,
        startingPrice,
      });

      await service.save();

      res
        .status(201)
        .json({ message: "Service created successfully", service });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Server error",
        error: error.message,
      });
    }
  }
);

router.delete("/:serviceId/image", async (req, res) => {
  const { serviceId } = req.params;
  const { imageUrl } = req.body;
  const service = await Service.findOne({ _id: serviceId });
  service.images = service.images.filter((img) => img !== imageUrl);
  await service.save();
  res.json({ message: "Image deleted successfully" });
});

router.put(
  "/:serviceId",
  multer({
    storage: multerS3({
      s3: s3,
      bucket: process.env.AWS_BUCKET_NAME,
      metadata: function (req, file, cb) {
        cb(null, { fieldName: file.fieldname });
      },
      key: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
      },
    }),
  }).array("images", 5),
  async (req, res) => {
    try {
      const { serviceId } = req.params;
      const {
        title,
        description,
        startingPrice,
        category,
        existingImages,
        currentUser,
      } = req.body;

      const service = await Service.findOne({ _id: serviceId });

      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }

      // if (service.user.toString() !== currentUser.toString()) {
      //   return res.status(403).json({ message: "Unauthorized" });
      // }

      service.title = title;
      service.description = description;
      service.startingPrice = startingPrice;
      service.category = category;
      service.updatedOn = new Date();

      let updatedImages = JSON.parse(existingImages || "[]");

      if (req.files && req.files.length > 0) {
        const newImageUrls = req.files.map((file) => file.location);
        updatedImages = [...updatedImages, ...newImageUrls];
      }

      service.images = updatedImages;

      if (updatedImages.length > 0) {
        service.thumbnailUrl = updatedImages[0];
      }

      await service.save();

      res.json({
        message: "Service updated successfully",
        service,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// router.put("/:serviceId", (req, res) => {
//   upload(req, res, async function (err) {
//     if (err) {
//       console.error("Multer error:", err);
//       return res.status(400).json({ message: "Error uploading files" });
//     }

//     try {
//       const { serviceId } = req.params;
//       const { title, description, startingPrice, category, existingImages } =
//         req.body;

//       const service = await Service.findById(serviceId);

//       if (!service) {
//         return res.status(404).json({ message: "Service not found" });
//       }

//       if (service.user.toString() !== req.user._id.toString()) {
//         return res.status(403).json({ message: "Unauthorized" });
//       }

//       service.title = title;
//       service.description = description;
//       service.startingPrice = startingPrice;
//       service.category = category;
//       service.updatedOn = new Date();

//       let updatedImages = JSON.parse(existingImages || "[]");

//       if (req.files && req.files.length > 0) {
//         const newImageUrls = req.files.map((file) => file.location);
//         updatedImages = [...updatedImages, ...newImageUrls];
//       }

//       service.images = updatedImages;

//       if (updatedImages.length > 0) {
//         service.thumbnailUrl = updatedImages[0];
//       }

//       await service.save();

//       res.json({
//         message: "Service updated successfully",
//         service,
//       });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ message: "Server error" });
//     }
//   });
// });

router.delete("/:serviceId", async (req, res) => {
  try {
    const { serviceId } = req.params;
    const service = await Service.findById(serviceId);

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    await Service.findByIdAndDelete(serviceId);

    res.status(200).json({ message: "Service deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:serviceId", async (req, res) => {
  try {
    const serviceId = req.params.serviceId;
    const service = await Service.findById(serviceId);

    console.log("Service found: ", service);
    const provider = await User.findById(service.user);

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.json({ service, provider });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/:serviceId/impression", async (req, res) => {
  try {
    const { serviceId } = req.params;
    const service = await Service.findByIdAndUpdate(
      serviceId,
      { $inc: { impressions: 1 } },
      { new: true }
    );
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }
    res.json({
      message: "Impression recorded",
      impressions: service.impressions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/:serviceId/click", async (req, res) => {
  try {
    const { serviceId } = req.params;
    const service = await Service.findByIdAndUpdate(
      serviceId,
      { $inc: { clicks: 1 } },
      { new: true }
    );
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }
    res.json({ message: "Click recorded", clicks: service.clicks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/:serviceId/conversion", async (req, res) => {
  try {
    const { serviceId } = req.params;
    const service = await Service.findByIdAndUpdate(
      serviceId,
      { $inc: { conversions: 1 } },
      { new: true }
    );
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }
    res.json({
      message: "Conversion recorded",
      conversions: service.conversions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:serviceId/analytics", authMiddleware, async (req, res) => {
  try {
    const { serviceId } = req.params;
    const service = await Service.findById(serviceId);

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    if (service.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const analytics = {
      impressions: service.impressions,
      clicks: service.clicks,
      conversions: service.conversions,
      conversionRate:
        service.clicks > 0 ? (service.conversions / service.clicks) * 100 : 0,
    };

    res.json(analytics);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
