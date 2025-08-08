const mongoose = require("mongoose");

const laborSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  area: String,
  skills: String,
  availability: {
    type: String,
    enum: ["Available", "Busy"],
    default: "Available",
  },
  dailyWage: Number,
  experience: String,
  
  // 🆕 Add this field
  profileImage: {
    type: String,
    default: "/uploads/default.png"  // default image if none uploaded
  },
  ratings: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    value: { type: Number, min: 1, max: 5 },
  }],
});

// Virtual for average rating
laborSchema.virtual('averageRating').get(function() {
  if (!this.ratings || this.ratings.length === 0) return 0;
  const sum = this.ratings.reduce((acc, r) => acc + r.value, 0);
  return (sum / this.ratings.length).toFixed(1);
});

module.exports = mongoose.model("Labor", laborSchema);
