const User = require("../models/User");

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const { name, bio, education, workExperience, socialLinks } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = name || user.name;
    user.bio = bio || user.bio;
    user.education = education || user.education;
    user.workExperience = workExperience || user.workExperience;
    user.socialLinks = socialLinks || user.socialLinks;

    await user.save();
    res.json(user); // 🧠 return full user object directly
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ✅ Add function to fetch alumni users
exports.getAlumniUsers = async (req, res) => {
  try {
    const alumni = await User.find({ role: "alumni" }); // Ensure alumni users exist in DB
    if (!alumni.length) {
      return res.status(404).json({ message: "No alumni found" });
    }
    res.json(alumni);
  } catch (error) {
    console.error("Error fetching alumni:", error);
    res.status(500).json({ message: "Server error fetching alumni" });
  }
};
exports.getAlumniById = async (req, res) => {
  try {
    const alumni = await User.findById(req.params.id).select("-password");
    if (!alumni) {
      return res.status(404).json({ message: "Alumni not found" });
    }
    res.json(alumni);
  } catch (error) {
    console.error("Error fetching alumni profile:", error);
    res.status(500).json({ message: "Server error fetching alumni profile" });
  }
};
