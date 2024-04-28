const mongoose = require('mongoose');

const availableTimeSlotSchema = new mongoose.Schema({
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
    },
      isAvailable: {
        type: Boolean,
        default: true
    },
      text: String,
      description: String
});

const AvailableTimeSlot = mongoose.model('AvailableTimeSlots', availableTimeSlotSchema);

module.exports = AvailableTimeSlot;
