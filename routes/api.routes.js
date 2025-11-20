const express = require("express");
const mongoose = require("mongoose");
const slugify = require("slugify");
const optionalVerifyToken = require("../middleware/optionalVerifyToken");
const verifyAdmin = require("../middleware/verifyAdmin");
const productModel = require("../models/productsModel");
const categoriesModel = require("../models/categoriesModel");
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
    try {
        const token = req.user;
        if (!token) return res.status(404).json({ success: false, message: "not login" });
        let foundUser = await userModel.findById(token._QCUI_UI);
        if (!foundUser) return res.status(404).json({ success: false, message: "not login" });
        foundUser = foundUser.toObject();
        const user = pickFields(foundUser, ["userImg", "fullname", "username", "phone", "address", "city", "email", "emailVerified", "YuuCoin"]);

        res.status(200).json({ success: true, user });
    } catch (error) {
        console.error("ERROR:", error);
        return res.status(500).render("errors/500", {
            title: "500 | Internal Server Error",
            message: "Something went wrong while loading this page. Please try again later.",
        });
    }
})

router.get("/frontCategories", async (req, res) => {
    const categories = await categoriesModel.find(
        {},
        {
            _id: 0,
            AddedBy: 0,
            "subCategories._id": 0,
            "subCategories.products": 0
        }
    );

    res.status(200).json({ success: true, categories });
})

router.get("/frontRewardCenter", optionalVerifyToken, async (req, res) => {
    try {
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
    } catch (error) {
        console.error("ERROR:", error);
        return res.status(500).render("errors/500", {
            title: "500 | Internal Server Error",
            message: "Something went wrong while loading this page. Please try again later.",
        });
    }
})

router.get("/frontAdminData", optionalVerifyToken, verifyAdmin, async (req, res) => {
    try {
        const usersChart = await userModel.aggregate([
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$joiningDate" }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        const orderAgg = await orderModel.aggregate([
            {
                $group: {
                    _id: "$orderInfo.orderStatus",
                    count: { $sum: 1 }
                }
            }
        ]);
        const ordersChart = {
            pending: 0,
            delivered: 0,
            return: 0
        };
        orderAgg.forEach(item => {
            const key = item._id.toLowerCase();
            if (ordersChart[key] !== undefined) {
                ordersChart[key] = item.count;
            }
        });

        const couponsData = await couponModel.find();

        res.status(200).json({ success: true, usersChart, ordersChart, couponsData });
    } catch (error) {
        console.error("ERROR:", error);
        return res.status(500).render("errors/500", {
            title: "500 | Internal Server Error",
            message: "Something went wrong while loading this page. Please try again later.",
        });
    }
})

module.exports = router;