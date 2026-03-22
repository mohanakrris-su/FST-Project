const mongoose = require("mongoose");

function getTodayString() {
  return new Date().toISOString().split("T")[0];
}

const queueSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true
    },
    date: {
      type: String,
      default: getTodayString,
      index: true
    },
    status: {
      type: String,
      enum: ["OPEN", "PAUSED", "CLOSED"],
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
      ref: "Appointment",
      default: null
    },
    servedCount: {
      type: Number,
      default: 0
    },
    pausedReason: String
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Queue", queueSchema);
