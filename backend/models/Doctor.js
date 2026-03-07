const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  doctorId: {
    type: String,
    unique: true
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

doctorSchema.pre("save", async function (next) {
  if (!this.doctorId) {
    const count = await mongoose.model("Doctor").countDocuments();
    this.doctorId = "DOC" + String(count + 1).padStart(4, "0");
  }
  next();
});

module.exports = mongoose.model("Doctor", doctorSchema);