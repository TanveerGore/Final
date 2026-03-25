const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    default: "",
  },
  topic: {
    type: String,
    trim: true,
    default: "",
  },
  status: {
    type: String,
    enum: ["planning", "in-progress", "review", "completed"],
    default: "planning",
  },
  components: [
    {
      name: String,
      quantity: Number,
    },
  ],
  notes: {
    type: String,
    default: "",
  },
<<<<<<< HEAD
  guide: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Faculty",
    default: null,
  },
=======
>>>>>>> 03ef4f7e5e1a0fc91a38965b199ee23522ef5efb
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
<<<<<<< HEAD
  isMock: {
    type: Boolean,
    default: false,
  },
=======
>>>>>>> 03ef4f7e5e1a0fc91a38965b199ee23522ef5efb
});

ProjectSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

ProjectSchema.index({ student: 1, status: 1 });

module.exports = mongoose.model("Project", ProjectSchema);
