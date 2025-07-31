const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    userImg: {
        type: String,
        default: "/assets/defaultUser.jpg"
    },
    fullname: String,
    username: {
        type: String,
        trim: true,
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
    phone: String,
    city: String,
    address: String,
    password: {
        type: String,
        required: true,
        minlength: 8,
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    allowed: {
        manageProducts: {
            type: Boolean,
            default: false
        },
        manageCoupans: {
            type: Boolean,
            default: false
        },
        manageOrders: {
            type: Boolean,
            default: false
        },
        manageUsers: {
            type: Boolean,
            default: false
        }
    },
    userCart: [
        { type: String },
    ],
    userWishlist: [
        { type: String },
    ],
    userOrders: []
})

const userModel = mongoose.model("users", userSchema);

module.exports = userModel;