import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
        type: String,
        required: true,
        trim: true
    },

    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },

    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },

    password: {
        type: String,
        required: true,
        minlength: 6
    },

    tasks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    }],

    otp: {
        type:String,
    },

    otpExpiresAt: {
        type: Date,
    },
    verified: {
        type: Boolean,
        default: false
    }
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);