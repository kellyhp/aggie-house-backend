const express = require("express");
const router = express.Router();
const AvailableTimeSlot = require("../models/availableTimeSlots");
const TimeSlot = require("../models/timeSlots");

// Create a new available time slot
router.post("/", async (req, res) => {
    const { date, startTime, endTime, text, description } = req.body;
  
    try {
      // Check if there are already two sign-ups for the same time slot
      const existingSignUps = await TimeSlot.countDocuments({
        date,
        startTime,
        isSignedUp: true
      });
      const isAvailable = existingSignUps < 2;
  
      const availableTimeSlot = new AvailableTimeSlot({
        date,
        startTime,
        endTime,
        isAvailable,
        text,
        description
      });
      await availableTimeSlot.save();
      res.status(201).json(availableTimeSlot);
    } catch (err) {
      res.status(400).json({ message: "Error creating available time slot" });
    }
  });
  
  // Get all available time slots
  router.get("/", async (req, res) => {
    try {
      const availableTimeSlots = await AvailableTimeSlot.find();
      res.json(availableTimeSlots);
    } catch (err) {
      res.status(500).json({ message: "Error getting available time slots" });
    }
  });

// Delete a time slot
router.delete("/:id", getTimeSlot, async (req, res) => {
    try {
      const isVolunteerDeletion = req.query.volunteer === "true"; // Check if the deletion is by a volunteer
  
      await res.timeSlot.remove();
  
      // Check if the corresponding available time slot was marked as unavailable due to two sign-ups
      const existingSignUps = await TimeSlot.countDocuments({
        date: res.timeSlot.date,
        startTime: res.timeSlot.startTime,
        isSignedUp: true
      });
      const isAvailable = existingSignUps < 2;
  
      // Update the corresponding available time slot's availability status only if it's a volunteer deletion
      if (isVolunteerDeletion) {
        const availableTimeSlot = await AvailableTimeSlot.findOne({
          date: res.timeSlot.date,
          startTime: res.timeSlot.startTime
        });
        if (availableTimeSlot) {
          availableTimeSlot.isAvailable = isAvailable;
          await availableTimeSlot.save();
        }
      }
  
      res.json({ message: "Time slot deleted" });
    } catch (err) {
      res.status(500).json({ message: "Error deleting a time slot" });
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

module.exports = router;