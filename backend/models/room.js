const mongoose = require("mongoose");

const bedSchema = new mongoose.Schema({
  number: Number,
  occupied: { type: Boolean, default: false },
  patient_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  name: { type: String, default: "" },         // Patient name
  age: { type: Number, default: null },        // Patient age
  problem: { type: String, default: "" },      // Treatment/Issue
  occupiedAt: { type: Date, default: null },   // Auto-filled datetime
});

const roomSchema = new mongoose.Schema({
  doctor_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  number: Number,
  beds: [bedSchema],
});

module.exports = mongoose.model("Room", roomSchema);
