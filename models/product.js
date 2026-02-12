import mongoose from "mongoose";
import { timeStamp } from "node:console";

const productSchema = new mongoose.Schema({
  serial: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  unit: { type: Number, required: true },
  stock: { type: Number, default: 0, required: true },
  price: { type: Number, required: true },
  minStock: { type: Number, required: true },
  category: { type: String, required: true },
  
} 

, { timestamps: true }
);

const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;