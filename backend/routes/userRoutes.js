const express = require("express");
const { getUserProfile, updateUserProfile, getAlumniUsers, getAlumniById } = require("../controllers/userController");// Import getAlumniUsers
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/profile", authMiddleware, getUserProfile);
router.put("/profile", authMiddleware, updateUserProfile);

// ✅ Add route to get all alumni users
router.get("/alumni", getAlumniUsers);
router.get("/alumni/:id", getAlumniById); 

module.exports = router;
