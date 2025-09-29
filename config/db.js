const mongoose = require("mongoose");
require("dotenv").config();

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("Connected to QuickCart Database ✅");
    } catch (error) {
        console.error("MongoDB connection failed ❌", error);
        process.exit(1); // Exit process if DB fails
    }
}

module.exports = connectDB;
