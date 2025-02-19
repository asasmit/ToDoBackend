import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";
import taskRoutes from "./routes/taskRoutes.js"

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({ origin: "https://todoclient-197c.onrender.com", credentials: true }));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/task", taskRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(port);
  })
  .catch((err) => console.error("MongoDB connection error:", err));
