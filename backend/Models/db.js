/**
 * Database Connection for HRMS System
 * MongoDB connection setup and default admin user creation
 *
 * @description Database initialization with Mongoose and admin setup
 * @version 1.0.0
 */

const mongoose = require("mongoose");
const UserModel = require("./User");
const bcrypt = require("bcrypt");

// MongoDB connection string from environment variables
const mongo_url = process.env.Mongo_Conn;

mongoose
  .connect(mongo_url)
  .then(() => {
    console.log("Connected to MongoDB");
    createDefaultAdmin();
  })
  .catch((err) => {
    console.log("Mongo Connection error", err);
  });

const createDefaultAdmin = async () => {
  const adminExists = await UserModel.findOne({ role: "admin" });
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    const admin = new UserModel({
      name: "Default Admin",
      email: "admin@example.com",
      password: hashedPassword,
      role: "admin",
    });
    await admin.save();
    console.log(
      "Default admin account created with email: admin@example.com and password: admin123"
    );
  }
};
