const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    joiningDate: {
        type: Date,
        default: Date.now
    },
    userImg: {
        type: String,
        default: "/assets/defaultUser.jpg"
    },
    provider: String,
    fullname: String,
    username: {
        type: String,
        minlength: 5,
        unique: true,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    phone: String,
    city: String,
    address: String,
    password: {
        type: String,
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
    userOrders: [],
    verificationOTP: {
        email: String,
        otp: String,
        expiresAt: Date,
        location: String,
        purpose: String
    }
})

const userModel = mongoose.model("users", userSchema);

module.exports = userModel;