const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  staffId: {
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
    default:"staff"
  },

  active: {
    type: Boolean,
    default: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

staffSchema.pre("save", async function (next) {
  if (!this.staffId) {
    const count = await mongoose.model("Staff").countDocuments();
    this.staffId = "STF" + String(count + 1).padStart(4, "0");
  }
  next();
});

module.exports = mongoose.model("Staff", staffSchema);