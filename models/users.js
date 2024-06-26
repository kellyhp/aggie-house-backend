const mongoose = require('mongoose');

const usersSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    profileImage: {
        type: String,
        default: null
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    admin: {
        type: Boolean,
        required: true,
    },
    levels: {
        type: String,
        default: "bronze"
    },
    volunteerHours: {
        type: Number,
        default: 0
    }
});

const Users = mongoose.model('users', usersSchema);

module.exports = Users;
