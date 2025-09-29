const mongoose = require("mongoose");
const env = require("dotenv");

env.config()
function connectDB() {
    mongoose.connect(process.env.MONGO_URI).then(() => {
        console.log(`Connected to QuickCart Database`);
    });
}

module.exports = connectDB