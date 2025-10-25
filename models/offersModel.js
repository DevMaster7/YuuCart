const mongoose = require("mongoose");

const coupanSchema = new mongoose.Schema({
    AddedBy: String,
    Status: {
        type: Boolean,
        default: true
    },
    coupanCode: String,
    coupanDiscount: Number,
    coupanLimit: Number,
    coupanDescription: String,
    coupanStartingDate: {
        type: Date,
        default: Date.now
    },
    coupanEndingDate: Date,
})

const coupanModel = mongoose.model("coupan", coupanSchema);



const redeemSchema = new mongoose.Schema({
    AddedBy: String,
    title: {
        type: String,
        required: true
    },
    subtitle: {
        type: String,
        required: true
    },
    cost: {
        type: Number,
        required: true
    },
    startingDate: {
        type: Date,
        default: Date.now
    },
    endingDate: {
        type: Date,
    },
    limitation: {
        type: Number
    },
    description: {
        type: String
    },
    status: {
        type: Boolean,
        default: true
    }
});

const redeemModel = mongoose.model("redeem", redeemSchema);

module.exports = { coupanModel, redeemModel }