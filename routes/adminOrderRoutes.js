import express from "express";
import Order from "../models/Order.js";
import { protect } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/adminMiddleware.js";

const router = express.Router();

/**
 * @desc Get all orders (Admin only)
 * @route GET /api/admin/orders
 */
router.get("/", protect, isAdmin, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const orders = await Order.find()
    .populate("user", "name email")
    .populate("items.product", "name price")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Order.countDocuments();

  res.json({
    orders,
    total,
    page,
    pages: Math.ceil(total / limit)
  });
});

/**
 * @desc Get single order by ID (Admin only)
 * @route GET /api/admin/orders/:id
 */
router.get("/:id", protect, isAdmin, async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name email")
    .populate("items.product", "name price");

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  res.json(order);
});

/**
 * @desc Update order status (Admin only)
 * @route PUT /api/admin/orders/:id
 */
router.put("/:id", protect, isAdmin, async (req, res) => {
  const { paymentStatus } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  if (paymentStatus) order.paymentStatus = paymentStatus;
  await order.save();

  res.json({ message: "Order updated", order });
});

/**
 * @desc Delete an order (Admin only)
 * @route DELETE /api/admin/orders/:id
 */
router.delete("/:id", protect, isAdmin, async (req, res) => {
  const deletedOrder = await Order.findByIdAndDelete(req.params.id);

  if (!deletedOrder) {
    return res.status(404).json({ message: "Order not found" });
  }

  res.json({ message: "Order deleted successfully" });
});

export default router;
