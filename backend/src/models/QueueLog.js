const mongoose = require("mongoose");

const queueLogSchema = new mongoose.Schema(
  {
    queueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Queue",
      required: true
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true
    },
    action: {
      type: String,
      required: true
    },
    fromStatus: String,
    toStatus: String,
    performedByRole: {
      type: String,
      enum: ["ADMIN", "DOCTOR", "STAFF", "SYSTEM"],
      default: "SYSTEM"
    },
    note: String
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("QueueLog", queueLogSchema);
