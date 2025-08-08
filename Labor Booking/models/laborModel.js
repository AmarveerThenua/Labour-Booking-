const mongoose = require('mongoose');

const laborSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  area: String,
  skills: String,
  availability: {
    type: String,
    enum: ['Available', 'Busy'],
    default: 'Available'
  },
  dailyWage: Number,
  experience: String
});

module.exports = mongoose.model('Labor', laborSchema);
