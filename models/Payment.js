const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true
  },

  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment",
  },

  amount: Number,

  method: {
    type: String,
    enum: ["CASH", "CARD", "UPI", "ONLINE"]
  },

  status: {
    type: String,
    enum: ["PAID", "REFUNDED", "FAILED"],
    default: "PAID"
  },

  refundDate: Date,

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Payment", paymentSchema);