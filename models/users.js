
import mongoose from "mongoose";

// Basic user schema used by NextAuth and user creation API.
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "user" },
}, { timestamps: true });



// Reuse model on hot reload.
const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;