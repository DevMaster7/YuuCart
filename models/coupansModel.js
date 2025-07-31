const mongoose = require("mongoose");

const coupanSchema = new mongoose.Schema({
    coupanCode: String,
    coupanDiscount: Number,
    coupanLimit: Number,
    coupanStartDate: Date,
    coupanEndDate: Date,
    choose: Boolean,
    coupanDescription: String,
})

const coupanModel = mongoose.model("coupan", coupanSchema);

module.exports = coupanModel