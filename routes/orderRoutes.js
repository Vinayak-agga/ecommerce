import express from "express";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create order from cart
router.post("/", protect, async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id }).populate("items.product");
  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ message: "Cart is empty" });
  }

  const total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const order = new Order({
    user: req.user.id,
    items: cart.items,
    total,
    shippingAddress: req.body.shippingAddress,
    paymentStatus: "pending"
  });

  await order.save();
  // Empty cart after order
  cart.items = [];
  await cart.save();

  res.status(201).json(order);
});

// Get user orders
router.get("/", protect, async (req, res) => {
  const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json(orders);
});

export default router;

