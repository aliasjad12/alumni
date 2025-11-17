const Job = require('../models/Job');

const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");

exports.postJob = async (req, res) => {
  try {
    const { title, company, location, description, contactNumber } = req.body;

    const job = new Job({ title, company, location, description, contactNumber, postedBy: req.user.id });
    await job.save();

    // 🔔 Fetch all verified student emails
    const students = await User.find({ role: "student" }).select("email name");

    const emails = students.map(student => student.email);

    // 🔔 Prepare email content
    const emailHtml = `
      <h3>🎉 A New Job Has Been Posted on ALITECH!</h3>
      <p><strong>Title:</strong> ${title}</p>
      <p><strong>Company:</strong> ${company}</p>
      <p><strong>Location:</strong> ${location}</p>
      <p><strong>Description:</strong> ${description}</p>
      <p><strong>Contact:</strong> ${contactNumber}</p>
      <p>Visit the ALITECH job board to apply now!</p>
    `;

    // 🔔 Send emails
    await sendEmail(
      emails, // list of recipients
      `📢 New Job Posted: ${title} at ${company}`,
      emailHtml
    );

    res.status(201).json({ message: 'Job posted successfully and email sent to students.', job });
  } catch (error) {
    console.error("Job Posting Error:", error);
    res.status(500).json({ message: error.message });
  }
};


exports.getJobs = async (req, res) => {
  try {
    const jobs = await Job.find().populate('postedBy', 'name email');
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.deleteJob = async (req, res) => {
  try {
    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: "Job deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

