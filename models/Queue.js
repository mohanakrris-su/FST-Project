const mongoose = require("mongoose");

const queueSchema = new mongoose.Schema({
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

  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true
  },

  date: {
    type: Date,
    required: true
  },

  status: {
    type: String,
    enum: ["OPEN", "CLOSED"],
    default: "OPEN"
  },

  waiting: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment"
    }
  ],

  skipped: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment"
    }
  ],

  currentPatient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment"
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Queue", queueSchema);