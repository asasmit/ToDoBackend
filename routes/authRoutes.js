import express from "express";
import {
  signup,
  login,
  verifyOTP,
} from "../controllers/authController.js";
import { resetOTP, verifyResetOTP } from "../controllers/resetPasswordController.js";

const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

router.post("/verifyOTP",verifyOTP);

// for password change purpose

router.post("/resetOTP", resetOTP);

router.post("/verifyResetOTP", verifyResetOTP);


export default router;