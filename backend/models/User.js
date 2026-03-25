const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
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
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["student", "teacher"],
    default: "student",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
<<<<<<< HEAD
  isMock: {
    type: Boolean,
    default: false,
  },
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
    default: null,
  },
=======
>>>>>>> 03ef4f7e5e1a0fc91a38965b199ee23522ef5efb
});

module.exports = mongoose.model("User", UserSchema);
