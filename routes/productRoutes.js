import express from "express";
import Product from "../models/Product.js";

const router = express.Router();

/**
 * @route   POST /api/products
 * @desc    Create a new product
 * @access  Public (make private later for admin only)
 */
router.post("/", async (req, res) => {
    try {
        const { name, price, description, category, stock } = req.body;

        if (!name || !price) {
            return res.status(400).json({
                success: false,
                message: "Name and price are required",
            });
        }

        const product = new Product({
            name,
            price,
            description,
            category,
            stock: stock || 0,
        });

        const savedProduct = await product.save();

        res.status(201).json({
            success: true,
            data: savedProduct,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

/**
 * @route   GET /api/products
 * @desc    Get all products
 * @access  Public
 */
router.get("/", async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json({
            success: true,
            count: products.length,
            data: products,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

/**
 * @route   PUT /api/products/:id
 * @desc    Update a product by ID
 * @access  Public (make private later for admin only)
 */
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!updatedProduct) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        res.status(200).json({
            success: true,
            data: updatedProduct,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete a product by ID
 * @access  Public (make private later for admin only)
 */
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const deletedProduct = await Product.findByIdAndDelete(id);

        if (!deletedProduct) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Product deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

export default router;
