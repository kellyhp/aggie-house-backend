const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema({
  userEmail: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  }
});

timeSlotSchema.pre('save', function (next) {
  this.totalTime = Math.abs((this.endTime - this.startTime) / (1000 * 60)); // in minutes
  next();
});

const TimeSlot = mongoose.model('timeSlots', timeSlotSchema);

module.exports = TimeSlot;
