const mongoose = require("mongoose");
const Admin = require("./models/Admin");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedAdmin = async () => {
  try {
    const existingAdmin = await Admin.findOne({ email: "admin@site.com" });
    if (!existingAdmin) {
      const admin = new Admin({
        name: "Super Admin",
        email: "admin@site.com",
        password: "admin123", 
      });
      await admin.save();
      console.log("Admin user created successfully!");
    } else {
      console.log("Admin user already exists.");
    }
    mongoose.connection.close();
  } catch (error) {
    console.error(error);
    mongoose.connection.close();
  }
};

seedAdmin();
