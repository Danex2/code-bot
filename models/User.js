const mongoose = require("mongoose");

UserSchema = new mongoose.Schema({
  userId: {
    type: Number,
    required: true
  },
  userName: {
    type: String
  },
  lastCheckin: {
    type: Date
  },
  daysCompleted: {
    type: Number
  },
  startDate: {
    type: Date
  },
  roundsCompleted: {
    type: Number
  },
  totalDaysCompleted: {
    type: Number
  }
});

module.exports = User = mongoose.model("user", UserSchema);
