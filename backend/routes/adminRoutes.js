const express = require("express");
const { adminLogin, getAllJobs, deleteJob, getAllUsers, deleteUser } = require("../controllers/adminController");

const router = express.Router();

// Admin authentication
router.post("/login", adminLogin);

// Manage jobs
router.get("/jobs", getAllJobs);
router.delete("/jobs/:id", deleteJob);

// Manage users
router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUser);

module.exports = router;
