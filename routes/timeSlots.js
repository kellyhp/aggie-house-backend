const express = require("express");
const router = express.Router();
const TimeSlot = require("../models/timeSlots");
const AvailableTimeSlot = require("../models/availableTimeSlots");

// Get all available time slots
router.get("/available", async (req, res) => {
  try {
    const availableTimeSlots = await AvailableTimeSlot.find({ isAvailable: true });
    res.json(availableTimeSlots);
  } catch (err) {
    res.status(500).json({ message: "Error getting available time slots" });
  }
});

// Add a time slot
router.post("/add", async (req, res) => {
  const { userEmail, name, date, startTime, endTime } = req.body;

  try {
    // Check if the time slot is available
    const existingTimeSlot = await AvailableTimeSlot.findOne({ date, startTime, isAvailable: true });
    if (!existingTimeSlot) {
      return res.status(400).json({ message: "Time slot is not available" });
    }

    // Create a new time slot
    const timeSlot = new TimeSlot({
      userEmail,
      name,
      date,
      startTime,
      endTime,
      isSignedUp: true
    });
    await timeSlot.save();

    // Update the available time slot to mark it as unavailable if two people have signed up
    const existingSignUps = await TimeSlot.countDocuments({ date, startTime, isSignedUp: true });
    existingTimeSlot.isAvailable = existingSignUps < 2;
    await existingTimeSlot.save();

    res.status(201).json(timeSlot);
  } catch (err) {
    res.status(400).json({ message: "Error adding a time slot" });
  }
});

// Delete a time slot
router.delete("/remove/:id", getTimeSlot, async (req, res) => {
  try {
    // Delete the time slot
    await res.timeSlot.remove();

    // Update the corresponding available time slot to mark it as available again
    const existingTimeSlot = await AvailableTimeSlot.findOne({ date: res.timeSlot.date, startTime: res.timeSlot.startTime });
    existingTimeSlot.isAvailable = true;
    await existingTimeSlot.save();

    res.json({ message: "Time slot removed" });
  } catch (err) {
    res.status(500).json({ message: "Error removing time slot" });
  }
});

// Middleware function to get time slot by ID
async function getTimeSlot(req, res, next) {
  let timeSlot;
  try {
    timeSlot = await TimeSlot.findById(req.params.id);
    if (timeSlot == null) {
      return res.status(404).json({ message: "Time slot not found" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
  res.timeSlot = timeSlot;
  next();
}

// Get all time slots of a volunteer
router.get("/my-time-slots", async (req, res) => {
    const { userEmail, name } = req.query;
  
    try {
      const timeSlots = await TimeSlot.find({ userEmail, name });
      res.json(timeSlots);
    } catch (err) {
      res.status(500).json({ message: "Error getting time slots" });
    }
  });

module.exports = router;
