const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    doctorCode: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    departmentName: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ["AVAILABLE", "BREAK", "OFFLINE", "IN_ROOM"],
      default: "AVAILABLE"
    },
    averageConsultationMinutes: {
      type: Number,
      default: 12,
      min: 3
    },
    dailyCapacity: {
      type: Number,
      default: 25,
      min: 1
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Doctor", doctorSchema);
