const cors = require("cors");
const express = require('express');
const app = express();
const { default: mongoose } = require("mongoose");

const usersRouter = require("./routes/users");
const timeRouter = require("./routes/timeSlots");
const availableRouter = require('./routes/availableTimeSlots');

const PORT = process.env.PORT || 3001;

const connectionString = "mongodb+srv://admin:aggiehouseyay@calendar.okd8uwn.mongodb.net/Dashboard";

app.use(cors());
async function connect() {
  try {
    await mongoose.connect(connectionString);
    console.log("Connection established with Mongo DB Database");
  } catch (error) {
    console.log(`Error -> ${error}`);
  }
}

connect();

app.use(express.json());
app.use("/users", usersRouter);
app.use("/timeSlots", timeRouter);
app.use("/availableTimeSlots", availableRouter);

app.listen(PORT, () => console.log(`Server is now running on port ${PORT}`));