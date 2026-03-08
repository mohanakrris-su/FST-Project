const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hospital",
    required: true
  },

  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    required: true
  },

  role: {
    type: String,
    default: "doctor"
  },

  status: {
    type: String,
    enum: ["available", "emergency", "offline", "break", "in_room"],
    default: "available"
  },

  dailyCapacity: {
    type: Number
  },

  schedule: [
    {
      date: Date,
      slots: Number
    }
  ],

  createdAt: {
    type: Date,
    default: Date.now
  }
});


module.exports = mongoose.model("Doctor", doctorSchema);