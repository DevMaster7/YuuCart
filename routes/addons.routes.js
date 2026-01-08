const express = require("express");
const mongoose = require("mongoose");
const productModel = require("../models/productsModel");
const { couponModel } = require("../models/offersModel");
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

router.get("/checkIn", optionalVerifyToken, async (req, res) => {
    try {
        const user = await userModel.findById(req.user._QCUI_UI);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const REWARDS = [10, 20, 40, 60, 100, 150, 300];
        const nowUTC = new Date();
        const lastCheckUTC = user.checkIn.lastCheck ? new Date(user.checkIn.lastCheck) : null;

        if (!lastCheckUTC) {
            const reward = REWARDS[0];
            user.checkIn.lastCheck = nowUTC;
            user.checkIn.streak = 1;
            user.YuuCoin += reward;
            user.Yuutx.push({ desc: "Daily Check-in", Yuu: reward });
            await user.save();

            return res.status(200).json({
                success: true,
                message: "First check-in completed!",
                streak: 1,
                reward,
            });
        }

        const nowPKT = new Date(nowUTC.getTime() + 5 * 60 * 60 * 1000);
        const lastCheckPKT = new Date(lastCheckUTC.getTime() + 5 * 60 * 60 * 1000);

        const todayMidnight = new Date(nowPKT);
        todayMidnight.setHours(0, 0, 0, 0);

        const lastMidnight = new Date(lastCheckPKT);
        lastMidnight.setHours(0, 0, 0, 0);

        const dayDiff = Math.floor((todayMidnight - lastMidnight) / (1000 * 60 * 60 * 24));

        if (dayDiff === 0) {
            return res.status(400).json({
                success: false,
                message: "You’ve already checked in today. Come back after midnight!",
                streak: user.checkIn.streak,
            });
        }

        if (dayDiff === 1) {
            if (user.checkIn.streak >= REWARDS.length) {
                const reward = REWARDS[0];

                user.checkIn.streak = 1;
                user.checkIn.lastCheck = nowUTC;
                user.YuuCoin += reward;
                user.Yuutx.push({ desc: "Daily Check-in", Yuu: reward });

                await user.save();

                return res.status(200).json({
                    success: true,
                    message: "7-day streak completed! Streak restarted 🎉",
                    streak: 1,
                    reward,
                });
            }

            const reward = REWARDS[user.checkIn.streak];

            user.checkIn.streak += 1;
            user.checkIn.lastCheck = nowUTC;
            user.YuuCoin += reward;
            user.Yuutx.push({ desc: "Daily Check-in", Yuu: reward });

            await user.save();

            return res.status(200).json({
                success: true,
                message: "Daily check-in successful!",
                streak: user.checkIn.streak,
                reward,
            });
        }

        if (dayDiff >= 2) {
            const reward = REWARDS[0];

            user.checkIn.streak = 1;
            user.checkIn.lastCheck = nowUTC;
            user.YuuCoin += reward;
            user.Yuutx.push({ desc: "Daily Check-in", Yuu: reward });
            await user.save();

            return res.status(200).json({
                success: true,
                message: "You missed a day! Streak reset.",
                streak: 1,
                reward,
            });
        }

    } catch (error) {
        console.error("ERROR:", error);
        return res.status(500).render("errors/500", {
            title: "500 | Internal Server Error",
            message: "Something went wrong while loading this page. Please try again later.",
        });
    }
});

router.post("/useSpin", optionalVerifyToken, async (req, res) => {
    try {
        const user = await userModel.findOne({ _id: req.user._QCUI_UI });
        if (!user) return res.redirect("/user/login");

        const nowUTC = new Date();
        const lastSpinUTC = new Date(user.spinDate);

        const nowPKT = new Date(nowUTC.getTime() + 5 * 60 * 60 * 1000);
        const lastSpinPKT = new Date(lastSpinUTC.getTime() + 5 * 60 * 60 * 1000);

        const todayMidnight = new Date(nowPKT);
        todayMidnight.setHours(0, 0, 0, 0);

        const lastMidnight = new Date(lastSpinPKT);
        lastMidnight.setHours(0, 0, 0, 0);

        const dayDiff = Math.floor((todayMidnight - lastMidnight) / (1000 * 60 * 60 * 24));

        if (dayDiff === 0) {
            return res.status(400).json({ success: false, message: "You have already used your spin!" });
        }

        if (dayDiff >= 1) {
            user.spinDate = nowUTC;
            await user.save();

            return res.status(200).json({ success: true })
        };

    } catch (error) {
        console.error("ERROR:", error);
        return res.status(500).render("errors/500", {
            title: "500 | Internal Server Error",
            message: "Something went wrong while loading this page. Please try again later.",
        });
    }
});

router.post("/spinReward", optionalVerifyToken, async (req, res) => {
    try {
        let { rewardId, reward } = req.body;
        const user = await userModel.findById(req.user._QCUI_UI);
        if (!user) return res.redirect("/user/login");

        if (reward.includes("Yuu")) {
            reward = Number(reward.replace("Yuu", ""));

            user.YuuCoin += reward
            user.Yuutx.push({ desc: "Daily Spin", Yuu: reward });
            await user.save();
        }
        else {
            let foundReward = await couponModel.findOne({ couponCode: rewardId, couponType: "spin" })
            if (!foundReward) return res.status(400).json({ success: false });

            if (foundReward.couponLimit) foundReward.couponLimit -= 1;
            foundReward.userList.push(user._id);
            await foundReward.save();
        }
        return res.status(200).json({ success: true });
    } catch (error) {
        console.error("ERROR:", error);
        return res.status(500).render("errors/500", {
            title: "500 | Internal Server Error",
            message: "Something went wrong while loading this page. Please try again later.",
        });
    }
});

router.post("/redeemReward", optionalVerifyToken, async (req, res) => {
    try {
        const { item } = req.body;
        const user = await userModel.findById(req.user._QCUI_UI);
        if (!user) return res.redirect("/user/login");

        const foundReward = await couponModel.findOne({ couponCode: item.couponCode })
        if (!foundReward) return res.status(400).json({ success: false });

        if (foundReward.userList.includes(user._id)) return res.status(400).json({ success: false, message: "You have already redeemed this reward!" });

        user.YuuCoin -= foundReward.couponCost;
        user.Yuutx.push({ desc: `Redeem: ${foundReward.couponTitle}`, Yuu: -foundReward.couponCost });
        await user.save();

        if (foundReward.couponLimit) {
            foundReward.couponLimit -= 1;
        }
        foundReward.userList.push(user._id);
        await foundReward.save();

        res.status(200).json({ success: true });
    } catch (error) {
        console.error("ERROR:", error);
        return res.status(500).render("errors/500", {
            title: "500 | Internal Server Error",
            message: "Something went wrong while loading this page. Please try again later.",
        });
    }
});

module.exports = router;