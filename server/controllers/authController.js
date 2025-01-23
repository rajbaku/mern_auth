import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../model/userModel.js";
import transporter from "../config/nodeMailer.js";
import { EMAIL_VERIFY_TEMPLATE,PASSWORD_RESET_TEMPLATE } from "../config/emailTemplates.js";

// Utility function to generate JWT
const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET_KEY, { expiresIn: "7d" });

// Utility to set secure cookies
const setCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

// Controller: Register
export const register = async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required." });
  }

  try {
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ success: false, message: "Email is already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = generateToken(user._id);
    setCookie(res, token);

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: `Welcome to Our Platform`,
      text: `Hello ${name}, welcome to our platform! Your account was successfully created.`,
    };

    await transporter.sendMail(mailOption);

    return res
      .status(201)
      .json({ success: true, message: "Registration successful." });
  } catch (error) {
    next(error);
  }
};

// Controller: Login
export const login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Email and password are required." });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password." });
    }

    const token = generateToken(user._id);
    setCookie(res, token);

    return res
      .status(200)
      .json({ success: true, message: "Login successful." });
  } catch (error) {
    next(error);
  }
};

// Controller: Logout
export const logOut = (req, res, next) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });
    return res
      .status(200)
      .json({ success: true, message: "Logout successful." });
  } catch (error) {
    next(error);
  }
};

// Controller: Send Verification OTP
export const sendVerifyOtp = async (req, res, next) => {
  try {
    const { userId } = req.body;

    const user = await userModel.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.verifyOTP = otp;
    user.verifyOTPExpireAt = Date.now() + 24 * 60 * 60 * 1000;

    await user.save();

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Account Verification OTP",
      // text: `Your OTP is ${otp}. Please verify your account within 24 hours.`,
      html:EMAIL_VERIFY_TEMPLATE.replace("{{otp}}",otp).replace("{{email}}",user.email)
    };

    await transporter.sendMail(mailOption);

    return res
      .status(200)
      .json({ success: true, message: "Verification OTP sent to your email." });
  } catch (error) {
    next(error);
  }
};

// Controller: Verify Email
export const verifiedEmail = async (req, res, next) => {
  const { userId, otp } = req.body;

  if (!userId || !otp) {
    return res
      .status(400)
      .json({ success: false, message: "User ID and OTP are required." });
  }

  try {
    const user = await userModel.findById(userId);
    if (
      !user ||
      user.verifyOTP !== otp ||
      user.verifyOTPExpireAt < Date.now()
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP." });
    }

    user.isAccountVerified = true;
    user.verifyOTP = null;
    user.verifyOTPExpireAt = null;

    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "Email verified successfully." });
  } catch (error) {
    next(error);
  }
};

//Controller:  User Is authenticated
export const isAuthenticated = async (req, res) => {
  try {
    return res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Controller: Send Password Reset OTP
export const sendResetOtp = async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res
      .status(400)
      .json({ success: false, message: "Email is required." });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOTP = otp;
    user.resetOTPExpireAt = Date.now() + 15 * 60 * 1000; // OTP valid for 15 minutes

    await user.save();

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Password Reset OTP",
      // text: `Your password reset OTP is ${otp}. Please use this OTP within 15 minutes to reset your password.`,
      html:PASSWORD_RESET_TEMPLATE.replace("{{otp}}",otp).replace("{{email}}",user.email)
    };

    await transporter.sendMail(mailOption);

    return res
      .status(200)
      .json({
        success: true,
        message: "Password reset OTP sent to your email.",
      });
  } catch (error) {
    next(error);
  }
};

// Controller: Reset User Password
export const resetPassword = async (req, res, next) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res
      .status(400)
      .json({
        success: false,
        message: "Email, OTP, and new password are required.",
      });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    if (user.resetOTP !== otp || user.resetOTPExpireAt < Date.now()) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetOTP = null;
    user.resetOTPExpireAt = null;

    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "Password reset successful." });
  } catch (error) {
    next(error);
  }
};
