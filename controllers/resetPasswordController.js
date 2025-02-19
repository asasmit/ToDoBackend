import User from "../models/User.js";
import bcrypt from "bcryptjs";
import dotenv from 'dotenv';
import nodemailer from "nodemailer";
dotenv.config();


const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const resetOTP = async (req, res) => {
    const { email } = req.body;
  
    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ error: "User not found." });
  
      const otp = generateOTP();
      const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // Expires in 5 minutes
  
      user.otp = otp;
      user.otpExpiresAt = otpExpiresAt;
      await user.save();
  
      // Send OTP via email
      await transporter.sendMail({
        from: process.env.EMAIL,
        to: email,
        subject: "Password Reset OTP",
        text: `Your OTP for password reset is: ${otp}. It is valid for 5 minutes.`,
      });
  
      res.json({ message: "OTP sent successfully." });
    } catch (error) {
      console.error("Error sending OTP:", error);
      res.status(500).json({ error: "Failed to send OTP. Please try again." });
    }
  };

  
  export const verifyResetOTP = async (req, res) => {
    const { email, otp, newPassword } = req.body;
  
    try {
      const user = await User.findOne({ email });
  
      if (!user || !user.otp || !user.otpExpiresAt) {
        return res.status(400).json({ error: "Invalid request." });
      }
  
      if (Date.now() > user.otpExpiresAt) {
        return res.status(400).json({ error: "OTP expired. Please request a new one." });
      }
  
      if (user.otp !== otp) {
        return res.status(400).json({ error: "Invalid OTP. Please try again." });
      }
  
      // Clear OTP after successful verification
      user.otp = null;
      user.otpExpiresAt = null;
  
      if (newPassword) {
        // Hash the new password before saving
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
      }
  
      await user.save();
  
      res.json({ message: "Password reset successfully." });
    } catch (error) {
      console.error("Error resetting password:", error);
      res.status(500).json({ error: "Failed to reset password." });
    }
  };
  