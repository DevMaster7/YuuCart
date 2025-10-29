const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    joiningDate: Date,
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
    spinDate: Date,
    YuuCoin: {
        type: Number,
        default: 0
    },
    checkIn: {
        lastCheck: {
            type: Date,
            default: null
        },
        streak: {
            type: Number,
            default: 0
        }
    },
    Yuutx: [
        {
            desc: { type: String },
            Yuu: { type: Number },
            date: { type: Date, default: Date.now }
        }
    ],
    isAdmin: {
        type: Boolean,
        default: false
    },
    allowed: {
        manageProducts: {
            type: Boolean,
            default: false
        },
        manageCoupons: {
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
    Reffer: {
        from: String,
        refferCode: String,
        url: String,
        yourReffers: [
            { type: String }
        ]
    },
    messages: [
        {
            from: {
                type: String,
                default: "YuuTeam"
            },
            fromImg: {
                type: String,
                default: "/assets/logo_google_aligned.png"
            },
            textContent: String,
            sendingDate: Date,
            seen: Boolean
        }
    ],
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
    },
})

const userModel = mongoose.model("users", userSchema);

module.exports = userModel;