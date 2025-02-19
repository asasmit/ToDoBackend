import express from "express";
import {
  createTask,
  deleteTask,
  getTasks,
  updateTaskStatus
} from "../controllers/taskController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", createTask);

router.get("/",getTasks);

router.put("/:taskId", updateTaskStatus);

router.delete("/:taskId", deleteTask);

export default router;