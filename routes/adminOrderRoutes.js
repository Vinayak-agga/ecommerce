import express from "express";
import Order from "../models/Order.js";
import { protect } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/adminMiddleware.js";

const router = express.Router();

/**
 * @desc Get all orders (Admin only)
 * @route GET /api/admin/orders
 */
// GET /api/admin/orders?status=paid&startDate=2025-08-01&endDate=2025-08-08&page=1&limit=10
router.get("/", protect, isAdmin, async (req, res) => {
  try {
  const { status, startDate, endDate, page = 1, limit = 10, sort } = req.query;

    let query = {};

    // Filter by paymentStatus
    if (status) {
      query.paymentStatus = status;
    }

    // Filter by date range
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    // Sorting
    let sortOption = { createdAt: -1 }; // default newest first
    if (sort === "oldest") sortOption = { createdAt: 1 };
    if (sort === "total_asc") sortOption = { total: 1 };
    if (sort === "total_desc") sortOption = { total: -1 };

    const orders = await Order.find(query)
      .populate("user", "name email")
      .populate("items.product", "name price")
      .skip(skip)
      .limit(Number(limit))
      .sort(sortOption);

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
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
