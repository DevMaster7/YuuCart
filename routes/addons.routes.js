const express = require("express");
const mongoose = require("mongoose");
const productModel = require("../models/productsModel");
const coupanModel = require("../models/coupansModel");
const userModel = require("../models/usersModel");
const orderModel = require("../models/ordersModel");
const slugify = require("slugify");
const verifyAdmin = require("../middleware/verifyAdmin");
const optionalVerifyToken = require("../middleware/optionalVerifyToken");
const { uploadOnCloudinary } = require("../config/cloudinary");
const upload = require("../middleware/multerConfig");
const fs = require("fs");
const path = require('node:path');
const router = express.Router();

router.post("/useSpin", async (req, res) => {
    const { userId } = req.body
    const user = await userModel.findOne({ _id: userId })
    let spinTime = new Date();

    if (new Date(user.spinDate) <= spinTime) {
        spinTime = spinTime.setHours(spinTime.getHours() + 24);

        user.spinDate = new Date(spinTime)
        await user.save()

        res.status(200).json({ success: true })
    } else {
        return res.status(400).json({ success: false, message: "You have already used your spin!" })
    }
})

module.exports = router;