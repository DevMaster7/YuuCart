const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
    AddedBy: String,
    Status: {
        type: Boolean,
        default: true
    },
    couponType: {
        type: String,
    },
    userList: {
        type: [String],
        default: undefined
    },
    couponCode: String,
    couponTitle: String,
    couponSubTitle: String,
    couponLimit: Number,
    couponDescription: String,
    couponStartingDate: {
        type: Date,
        default: Date.now
    },
    couponEndingDate: Date,
    couponCost: {
        type: Number,
        default: 0
    },
    orderLimit: String,
    benefitType: String,
    benefitValue: String
})

couponSchema.pre("save", function (next) {
    if (this.couponType == "forall") {
        this.userList = undefined;
    } else if (!this.userList) {
        this.userList = [];
    }
    next();
});

const couponModel = mongoose.model("coupon", couponSchema);

module.exports = { couponModel }