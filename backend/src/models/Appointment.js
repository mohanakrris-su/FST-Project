const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    queueDate: {
      type: String,
      required: true,
      index: true
    },
    patientName: {
      type: String,
      required: true,
      trim: true
    },
    patientPhone: {
      type: String,
      trim: true
    },
    departmentName: {
      type: String,
      required: true,
      trim: true
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true
    },
    queueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Queue",
      required: true
    },
    tokenNumber: {
      type: Number,
      required: true
    },
    paymentAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    status: {
      type: String,
      enum: ["BOOKED", "WAITING", "IN_ROOM", "COMPLETED", "SKIPPED", "CANCELLED"],
      default: "WAITING"
    },
    bookedAt: {
      type: Date,
      default: Date.now
    },
    checkedInAt: Date,
    inRoomAt: Date,
    completedAt: Date,
    cancelledAt: Date,
    expectedConsultationTime: Date,
    predictedWaitMinutes: Number,
    predictionConfidence: Number
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
