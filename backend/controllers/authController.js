const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail"); // ✅ Make sure path is correct

exports.register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      bio,
      education,
      workExperience,
      socialLinks
    } = req.body;

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const parsedEducation = JSON.parse(education || "[]");
    const parsedWorkExperience = JSON.parse(workExperience || "[]");
    const parsedSocialLinks = JSON.parse(socialLinks || "{}");

    const verificationToken = crypto.randomBytes(32).toString("hex");

   const profilePic = req.files?.profilePicture?.[0]?.filename || null;
const cvFile = req.files?.cv?.[0]?.filename || null;

  const newUser = new User({
  name,
  email,
  password: hashedPassword,
  role: role || "student",
  bio,
  education: parsedEducation,
  workExperience: parsedWorkExperience,
  socialLinks: parsedSocialLinks,
  profilePicture: profilePic,
  cv: cvFile,
  verificationToken,
  isVerified: false,
  });


    await newUser.save();

    // ✅ Create verification URL
    const verifyUrl = `http://localhost:5000/api/auth/verify/${verificationToken}`;

    // ✅ Email content
    const emailHtml = `
      <h2>Welcome to ALITECH, ${name}!</h2>
      <p>Thank you for signing up. We are excited to have you on board.</p>
      <p>Please click the link below to verify your email address:</p>
      <a href="${verifyUrl}" target="_blank">${verifyUrl}</a>
      <br /><br />
      <p>Best Regards,<br>ALITECH Team</p>
    `;

    // ✅ Send combined welcome + verification email
    await sendEmail(email, "Welcome to ALITECH - Verify Your Email", emailHtml);

    res.status(201).json({ message: "User registered. Verification email sent." });

  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};



exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ token, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
