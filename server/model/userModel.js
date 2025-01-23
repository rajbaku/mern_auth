import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    verifyOTP: { type: String, default: '' },
    verifyOTPExpireAt: { type: Date, default: null },
    isAccountVerified: { type: Boolean, default: false },
    resetOTP: { type: String, default: '' },
    resetOTPExpireAt: { type: Date, default: null },
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

const userModel = mongoose.models.User || mongoose.model('User', userSchema);
export default userModel;
