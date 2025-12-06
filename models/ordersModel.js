const mongoose = require("mongoose");
const moment = require("moment-timezone");

const orderInfoSchema = new mongoose.Schema({
    orderDate: {
        type: String,
        default: () => moment().tz("Asia/Karachi").format("dddd, D MMMM YYYY — hh:mm:ss A")
    },
    DeliveryDate: {
        type: String
    },
    orderStatus: {
        type: String,
        default: "Pending"
    },
    PaymentMethod: {
        type: String
    },
}, { _id: true });

const devliverySchema = new mongoose.Schema({
    userDetails: {
        userId: String,
        fullname: String,
        username: String,
        email: String,
        phone: String,
        city: String,
        address: String
    },
    orderData: {},
    orderInfo: {
        type: orderInfoSchema,
        default: () => ({}),
    }
})

const deliveryModel = mongoose.model("orders", devliverySchema);
module.exports = deliveryModel