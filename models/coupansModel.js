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

module.exports = coupanModel