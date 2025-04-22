const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    fullname: String,
    username: {
        type: String,
        lowercase: true,
        minlength: 5,
        unique: true,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    city: String,
    password: {
        type: String,
        required: true,
        minlength: 8,
    },
    isAdmin: {
        type: Boolean,
        default: false
    }
})

const userModel = mongoose.model("users", userSchema);

module.exports = userModel;