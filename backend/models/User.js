const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['alumni', 'student'], required: true, default: 'student' },
  profilePicture: { type: String },
  bio: { type: String },
  education: [{ degree: String, university: String, year: Number }],
  workExperience: [{ company: String, position: String, years: Number }],
  socialLinks: {
    linkedin: String,
    github: String,
    website: String,
  },
  cv: { type: String },
  isVerified: { type: Boolean, default: false }, // ✅ NEW
  verificationToken: { type: String },  // ✅ CV filename saved here
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
