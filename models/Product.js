import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    stock: { type: Number, default: 0 },
    images: [String]
}, { timestamps: true });

export default mongoose.model("Product", ProductSchema);