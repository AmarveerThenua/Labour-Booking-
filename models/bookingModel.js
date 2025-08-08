const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  labor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Labor",
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },

  status: {
    type: String,
    enum: ["Pending", "Accepted", "Rejected", "Completed"],
    default: "Pending",
  },
  rated: {
    type: Boolean,
    default: false
  },
});

module.exports = mongoose.model("Booking", bookingSchema);
