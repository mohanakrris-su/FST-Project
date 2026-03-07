const mongoose = require("mongoose");

const staffAssignmentSchema = new mongoose.Schema({
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Staff",
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

  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor"
  },

  queueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Queue"
  },

  permissions: {
    canCallNext: { type: Boolean, default: false },
    canSkip: { type: Boolean, default: false },
    canCancel: { type: Boolean, default: false },
    canReorder: { type: Boolean, default: false },
    canCloseQueue: { type: Boolean, default: false }
  },

  assignedAt: {
    type: Date,
    default: Date.now
  },

  active: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model("StaffAssignment", staffAssignmentSchema);