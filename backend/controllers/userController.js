import User from "../models/User.js";
import ActivityLog from "../models/ActivityLog.js";
import { hash } from "bcryptjs";
import mongoose from "mongoose";
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!["sub-admin", "support-agent"].includes(role)) {
      return res.status(400).json({ message: "Invalid role. Must be 'sub-admin' or 'support-agent'" });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized: User not authenticated" });
    }

    const hashedPassword = await hash(password, 10);
    const newUser = await User.create({ name, email, password: hashedPassword, role });

    await ActivityLog.create({
      user: req.user.id,
      action: `Created ${role} ${newUser.email}`,
    });

    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role } = req.body;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = await hash(password, 10);
    if (role && ["sub-admin", "support-agent"].includes(role)) user.role = role;

    await user.save();

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized: User not authenticated" });
    }

    await ActivityLog.create({ user: req.user.id, action: `Updated user ${user.email}` });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: "super-admin" } }).select("name email role");
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users", error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Deleting user with ID:", id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    console.log("Attempting to delete user...");
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    console.log("User deleted, checking authentication...");
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized: User not authenticated" });
    }

    console.log("Creating activity log...");
    await ActivityLog.create({ user: req.user.id, action: `Deleted user ${user.email}` });

    console.log("Deletion successful");
    res.status(200).json({ message: "User deleted" });
  } catch (error) {
    console.error("Error in deleteUser:", error);
    res.status(500).json({ message: error.message });
  }
};

export const logActivity = async (req, res) => {
  try {
    const logs = await ActivityLog.find().populate("user", "email");
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};