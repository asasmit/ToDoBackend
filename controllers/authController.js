import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import crypto from "crypto";
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const signup = async (req, res) => {
  try {
    const { name, email, username, password } = req.body;

    const existingUserUsingEmail = await User.findOne({ email });
    const existingUserUsingUsername = await User.findOne({ username });

    if (existingUserUsingEmail && existingUserUsingEmail.verified) {
      return res.status(400).json({ message: "Email already in use." });
    }

    if (existingUserUsingUsername && existingUserUsingUsername.verified) {
      return res.status(400).json({ message: "Username taken" });
    }
    const existingUser = existingUserUsingEmail || existingUserUsingUsername;
    
    const hashedPassword = await bcrypt.hash(password, 12);

    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    let newUser;

    if(!existingUser){
      newUser = new User({
      name,
      username,
      email,
      password: hashedPassword,
    });
    }
    else{
      newUser = existingUser;
    }

    newUser.otp = otp;
    newUser.otpExpiresAt = expiresAt;

    await newUser.save();

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}. It expires in 5 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: "OTP sent successfully!" });

  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
    console.error(error);
  }
};

export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || user.otp !== otp || user.otpExpiresAt < new Date()) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP!" });
    }

    // OTP is valid, clear it from DB
    user.verified = true;
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    
    // Generate JWT token
    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: "1h" });
    
    const userDetails = {
      user: {
        username: user.username
      },
      token: token
    }
    
    res.status(200).json({ success: true, message: "OTP verified!", userDetails});
  } catch (error) {
    res.status(500).json({ success: false, message: "Error verifying OTP" });
  }
};

export const login = async (req,res) => {
    try {
        const {username, password} = req.body;
        const user = await User.findOne({username});

        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        if(!user.verified){
          return res.status(400).json({message: "User not verified"});
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
          return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
          { id: user._id, username: user.username },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
        );

        const userDetails = {
          user: {
            username: user.username
          },
          token: token
        }

        res.status(200).json({ success: true, message: "Login Successfull", userDetails });
    
    }   catch (error) {
        res.status(500).json({message: "Something went wrong" });
        console.error(error);
  }
};