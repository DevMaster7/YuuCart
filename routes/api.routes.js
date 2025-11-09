const express = require("express");
const mongoose = require("mongoose");
const slugify = require("slugify");
const optionalVerifyToken = require("../middleware/optionalVerifyToken");
const productModel = require("../models/productsModel");
const userModel = require("../models/usersModel");
const orderModel = require("../models/ordersModel");
const { couponModel } = require("../models/offersModel");
const { uploadOnCloudinary } = require("../config/cloudinary");
const upload = require("../middleware/multerConfig");
const router = express.Router();
const path = require("path");
const fs = require("fs");

function pickFields(obj, allowedFields = []) {
    const result = {};
    for (const key of allowedFields) {
        if (obj[key] !== undefined) result[key] = obj[key];
    }
    return result;
}

// router.get("/frontUser", optionalVerifyToken, async (req, res) => {
//     const token = req.user;
//     if (!token) return res.status(400).json({ success: false, message: "User not found!" });
//     let foundUser = await userModel.findById(token._QCUI_UI);
//     if (!foundUser) return res.status(400).json({ success: false, message: "User not found!" });

//     const user = pickFields(foundUser, []);

//     res.status(200).json({ success: true, user });
// })


module.exports = router;