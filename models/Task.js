import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema({
    user : {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User'
    },

    title: { 
        type: String, 
        required: true, 
        unique: true 
    },

    description : { 
        type: String,
        required: true 
    },

    status : {
        type: String,
        enum : ['IN_PROGRESS', 'COMPLETE','ACTIVE','EXPIRED'],
        default: 'ACTIVE'
    },

    deadline: {
        type: Date,
        validate: {
          validator: function (value) {
            return value > new Date();
          },
          message: "Deadline already passed."
        }
      }
    },
    { timestamps: true }
  );

export default mongoose.model("Task", TaskSchema);