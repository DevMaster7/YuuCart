const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
    AddedBy: String,
    Status: {
        type: Boolean,
        default: true
    },
    Redeemed: {
        type: Boolean,
        required: true
    },
    userList:[],
    couponCode: String,
    couponDiscount: Number,
    couponLimit: Number,
    couponDescription: String,
    couponStartingDate: {
        type: Date,
        default: Date.now
    },
    couponEndingDate: Date,
})

const couponModel = mongoose.model("coupon", couponSchema);


module.exports = { couponModel }