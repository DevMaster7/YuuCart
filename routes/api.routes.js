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

function pickFields(obj, fields = []) {
    const result = {};
    for (const field of fields) {
        const keys = field.split('.');
        let value = obj;
        for (const key of keys) {
            if (value && typeof value === 'object' && key in value) {
                value = value[key];
            } else {
                value = undefined;
                break;
            }
        }
        if (value !== undefined) {
            // Set nested structure in result
            let current = result;
            for (let i = 0; i < keys.length - 1; i++) {
                current[keys[i]] = current[keys[i]] || {};
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = value;
        }
    }
    return result;
}

router.get("/frontUser", optionalVerifyToken, async (req, res) => {
    const token = req.user;
    if (!token) return res.redirect("/user/login");
    let foundUser = await userModel.findById(token._QCUI_UI);
    if (!foundUser) return res.redirect("/user/login");

    foundUser = foundUser.toObject();
    const user = pickFields(foundUser, ["userImg", "fullname", "username", "phone", "address", "city", "email", "emailVerified", "YuuCoin"]);

    res.status(200).json({ success: true, user });
})

router.get("/frontRewardCenter", optionalVerifyToken, async (req, res) => {
    let foundUser = await userModel.findById(req.user._QCUI_UI);
    if (!foundUser) return res.redirect("/user/login");

    let coupons = await couponModel.find();
    coupons = coupons
        .filter(item => {
            const isExpiredOrInactive =
                new Date(item.couponEndingDate) <= Date.now() || !item.Status;

            const isLimitOver = item.couponLimit <= 0;

            const userHasUsed =
                Array.isArray(item.userList) &&
                item.userList.some(id => id.toString() === foundUser._id.toString());

            if (isExpiredOrInactive) return false;
            if (!userHasUsed && isLimitOver) return false;

            return true;
        })
        .sort((a, b) => {
            const aUsed =
                Array.isArray(a.userList) &&
                a.userList.some(id => id.toString() === foundUser._id.toString());
            const bUsed =
                Array.isArray(b.userList) &&
                b.userList.some(id => id.toString() === foundUser._id.toString());
            return aUsed - bUsed; // unused first, used last
        })
        .map(item => {
            item = item.toObject();

            const userHasUsed =
                Array.isArray(item.userList) &&
                item.userList.some(id => id.toString() === foundUser._id.toString());

            let {
                _id,
                AddedBy,
                Status,
                couponType,
                benefitType,
                couponStartingDate,
                userList,
                ...rest
            } = item;

            if (!userHasUsed) rest = { has: false, ...rest }
            else rest = { has: true, ...rest };

            return rest;
        });

    foundUser = foundUser.toObject();
    foundUser.Yuutx = foundUser.Yuutx.map(tx => {
        const { _id, ...rest } = tx;
        return rest;
    });

    const user = pickFields(foundUser, ["spinDate", "checkIn.lastCheck", "Yuutx"]);

    res.status(200).json({ success: true, user, coupons });
})

module.exports = router;