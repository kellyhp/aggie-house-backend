const express = require("express");
const router = express.Router();
const TimeSlot = require("../models/timeSlots");

// get all time slots
router.get("/", async (req, res) => {
  try {
    const timeSlots = await TimeSlot.find();
    res.json(timeSlots);
  } catch (err) {
    res.status(500).json({ message: "Error getting all time slots" });
  }
});

// add a time slot
router.post("/", async (req, res) => {
  const timeSlot = new TimeSlot({
    userEmail: req.body.userEmail,
    date: req.body.date,
    startTime: req.body.startTime,
    endTime: req.body.endTime
  });

  try {
    const newTimeSlot = await timeSlot.save();
    res.status(201).json(newTimeSlot);
  } catch (err) {
    res.status(400).json({ message: "Error adding a time slot" });
  }
});

// delete a time slot
router.delete("/:id", getTimeSlot, async (req, res) => {
  try {
    await res.timeSlot.remove();
    res.json({ message: "Time slot deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting time slot" });
  }
});

// get time slot by ID
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

// update a time slot
router.put("/:id", getTimeSlot, async (req, res) => {
    try {
      res.timeSlot.userEmail = req.body.userEmail;
      res.timeSlot.date = req.body.date;
      res.timeSlot.startTime = req.body.startTime;
      res.timeSlot.endTime = req.body.endTime;
      await res.timeSlot.save();
      res.json({ message: "Time slot updated" });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });
  

// delete time slots older than 3 months
router.delete("/older-than-three-months", async (req, res) => {
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  try {
    await TimeSlot.deleteMany({ date: { $lt: threeMonthsAgo } });
    res.json({ message: "Time slots older than three months deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting time slots 3 months" });
  }
});

module.exports = router;
