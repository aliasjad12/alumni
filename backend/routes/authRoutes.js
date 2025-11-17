const express = require('express');
const { register, login } = require('../controllers/authController');
const multer = require("multer");
const path = require("path");
const User = require("../models/User");
const router = express.Router();

// Configure Multer storage
// Update path if needed
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === "cv") {
      cb(null, "uploads/cvs/");
    } else if (file.fieldname === "profilePicture") {
      cb(null, "uploads/profilePics/");
    }
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Handle two uploads: profilePicture and cv
router.post('/register', upload.fields([
  { name: "cv", maxCount: 1 },
  { name: "profilePicture", maxCount: 1 }
]), register);

router.post('/login', login);
router.get('/verify/:token', async (req, res) => {
  try {
    const user = await User.findOne({ verificationToken: req.params.token });
    if (!user) return res.status(400).send("Invalid or expired token");

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.send("✅ Email verified successfully. You can now login.");
  } catch (err) {
    console.error("Email verification error:", err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
