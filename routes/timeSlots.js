const express = require("express");
const router = express.Router();
const TimeSlot = require("../models/timeSlots");
const AvailableTimeSlot = require("../models/availableTimeSlots");

// Get all available time slots with sign-up details
router.get("/available", async (req, res) => {
    try {
      // Fetch available time slots
      const availableTimeSlots = await AvailableTimeSlot.find({ isAvailable: true });
  
      // Populate sign-up details for each available time slot
      for (const timeSlot of availableTimeSlots) {
        const signUps = await TimeSlot.find({ date: timeSlot.date, startTime: timeSlot.startTime, isSignedUp: true })
          .select("email")
          .populate({ 
            path: "email", 
            select: "name profileImage" 
          });
  
        timeSlot.signUps = signUps.map(signUp => ({
          name: signUp.email.name,
          profileImage: signUp.email.profileImage
        }));
      }
  
      res.json(availableTimeSlots);
    } catch (err) {
      res.status(500).json({ message: "Error getting available time slots" });
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

// Delete a time slot
router.delete("/remove/:id", getTimeSlot, async (req, res) => {
    try {
        const { volunteer } = req.query;

        // Check if the user is removing themselves from the time slot
        if (admin === "true") {
            // Delete the time slot
            await res.timeSlot.remove();

            // Update the corresponding available time slot to mark it as available again
            const existingTimeSlot = await AvailableTimeSlot.findOne({ date: res.timeSlot.date, startTime: res.timeSlot.startTime });
            existingTimeSlot.isAvailable = true;
            await existingTimeSlot.save();
        }

        res.json({ message: "Time slot removed" });
    } catch (err) {
        res.status(500).json({ message: "Error removing time slot" });
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

  // Route to get upcoming shifts for a user
router.get("/upcoming/:userEmail", async (req, res) => {
    const userEmail = req.params.userEmail;
  
    try {
      // Fetch the user's upcoming shifts
      const userShifts = await TimeSlot.find({ userEmail, startTime: { $gte: new Date() } })
        .sort({ startTime: 1 })
        .limit(3)
        .lean();
  
      // Fetch upcoming available shifts that the user can sign up for
      const availableShifts = await AvailableTimeSlot.find({ date: { $gte: new Date() }, isAvailable: true })
        .sort({ date: 1 })
        .limit(3)
        .lean();
  
      res.json({ userShifts, availableShifts });
    } catch (err) {
      res.status(500).json({ message: "Error retrieving upcoming shifts" });
    }
  });

module.exports = router;
