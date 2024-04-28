const express = require("express");
const router = express.Router();
const User = require("../models/users");

// get all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error getting all users" });
  }
});

// add user to database
router.get("/addUser", async (req, res) => {
  const { name, profileImage, email, admin } = req.body
  try {
    User.insertOne({name, profileImage, phoneNumber: "", email, admin})
  } catch (err) {
    res.status(500).json({ message: "Error adding user" });
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

module.exports = router;
