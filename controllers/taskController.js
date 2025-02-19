import Task from "../models/Task.js";
import User from "../models/User.js";
import mongoose from "mongoose";

export const createTask = async (req, res) => {
  try {
    const { title, description, deadline } = req.body;
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized: No user ID found" });
    }

    const userId = req.user.id;
    
    // Validate request body
    if (!title || !description || !deadline) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Create new task
    const newTask = new Task({
      user: userId,
      title,
      description,
      deadline,
    });

    // Save task to database
    const savedTask = await newTask.save();

    await User.findByIdAndUpdate(userId, { $push: { tasks: savedTask._id } }, { new: true });

    res.status(201).json({ success: true, task: savedTask });

  } catch (error) {
    console.error("Error in createTask:", error);
    res.status(500).json({ message: error.message || "Something went wrong" });
  }
};


export const getTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const searchQuery = req.query.search || "";

    // Update overdue "ACTIVE" and "IN_PROGRESS" tasks to "EXPIRED"
    await Task.updateMany(
      {
        user: userId,
        status: { $in: ["ACTIVE", "IN_PROGRESS"] },
        deadline: { $lt: new Date() }, // Deadline is in the past
      },
      { $set: { status: "EXPIRED" } }
    );

    // Custom priority for status sorting
    const statusPriority = { "IN_PROGRESS": 1, "ACTIVE": 2, "COMPLETE": 3, "EXPIRED": 4 };

    const tasks = await Task.find({
      user: userId,
      $or: [
        { title: { $regex: searchQuery, $options: "i" } },
        { description: { $regex: searchQuery, $options: "i" } },
      ],
    })
      .lean()
      .sort({ deadline: 1 })
      .then((tasks) =>
        tasks.sort((a, b) => (statusPriority[a.status] || 99) - (statusPriority[b.status] || 99))
      );

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
    console.error(error);
  }
};


export const updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params; // Get taskId from URL params
    const { status } = req.body; // Get new status from request body

    // Check if taskId is valid
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    // Validate status
    const validStatuses = ["IN_PROGRESS", "COMPLETE", "ACTIVE", "EXPIRED"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    // Find task by ID and update status
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { status },
      { new: true } // Return updated task
    );

    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json(updatedTask);
  } catch (error) {
    console.error("Error updating task status:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id; // Extract user ID from the authenticated request

    // 🔍 Find task by ID
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.user.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized to delete this task" });
    }

    await Task.findByIdAndDelete(taskId);
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}