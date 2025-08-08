import express from "express";
import User from "../models/User.js";
import { protect } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/adminMiddleware.js";

const router = express.Router();

/**
 * @desc Get all users (Admin only)
 * @route GET /api/admin/users
 */
router.get("/", protect, isAdmin, async (req, res) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });
  res.json(users);
});

/**
 * @desc Get single user by ID (Admin only)
 * @route GET /api/admin/users/:id
 */
router.get("/:id", protect, isAdmin, async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});

/**
 * @desc Update user role or status (Admin only)
 * @route PUT /api/admin/users/:id
 */
router.put("/:id", protect, isAdmin, async (req, res) => {
  const { role, isActive } = req.body;

  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  if (role) user.role = role; // "user" or "admin"
  if (typeof isActive === "boolean") user.isActive = isActive;

  await user.save();
  res.json({ message: "User updated", user });
});

/**
 * @desc Delete a user (Admin only)
 * @route DELETE /api/admin/users/:id
 */
router.delete("/:id", protect, isAdmin, async (req, res) => {
  const deletedUser = await User.findByIdAndDelete(req.params.id);
  if (!deletedUser) return res.status(404).json({ message: "User not found" });
  res.json({ message: "User deleted" });
});

export default router;
