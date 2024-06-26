const express = require("express");
const router = express.Router();
const User = require("../models/users");
const TimeSlot = require("../models/timeSlots");

// get all non-admin users
router.get("/", async (req, res) => {
    try {
      const users = await User.find({ admin: false });
      res.json(users);
    } catch (err) {
      res.status(500).json({ message: "Error getting non-admin users" });
    }
  });  

// add user to database
router.post("/addUser", async (req, res) => {
  const { name, profileImage, email, admin } = req.body
  console.log(req)
  try {
      // Create a new time slot
      const user = new User({
        name,
        profileImage,
        email,
        admin,
      });
      await user.save();
      res.status(200).json({ message: "GOD JESUS CHRIST IT WORKS!!"});
  } catch (err) {
    res.status(500).json({ message: err});
  }
})

// delete a user
router.delete("/:id", getUser, async (req, res) => {
  try {
    await res.user.remove();
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting user"});
  }
});

// get user by id
async function getUser(req, res, next) {
  let user;
  try {
    user = await User.findById(req.params.id);
    if (user == null) {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
  res.user = user;
  next();
}

// Get leaderboard with pagination
router.get("/leaderboard", async (req, res) => {
    try {
      // Pagination parameters
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
  
      // Calculate skip value for pagination
      const skip = (page - 1) * limit;
  
      // Get total count of non-admin users
      const totalCount = await User.countDocuments({ admin: false });
  
      // Fetch non-admin users with pagination
      const users = await User.find({ admin: false }, 'name profileImage levels volunteerHours')
                                .skip(skip)
                                .limit(limit)
                                .exec();
  
      res.json({
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        users
      });
    } catch (err) {
      res.status(500).json({ message: "Error getting leaderboard" });
    }
  });

// Get the number of shifts for a user
router.get("/shifts/:userEmail", async (req, res) => {
    try {
        const userEmail = req.params.userEmail;

        // Find the user by email to get their ID
        const user = await User.findOne({ email: userEmail });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Count the number of shifts for the user
        const shiftCount = await TimeSlot.countDocuments({ userId: user._id });

        res.json({ shiftCount });
    } catch (err) {
        res.status(500).json({ message: "Error getting shift count" });
    }
});

// Get user information by email
router.get("/email/:email", async (req, res) => {
    try {
      const userEmail = req.params.email;
  
      // Find the user by email
      const user = await User.findOne({ email: userEmail });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      res.json(user);
    } catch (err) {
      res.status(500).json({ message: "Error getting user information by email" });
    }
  });  

module.exports = router;
