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

router.post("/checkIn", async (req, res) => {
    const { userId } = req.body;
    const user = await userModel.findOne({ _id: userId });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const REWARDS = [10, 20, 40, 60, 100, 150, 300];
    const now = new Date();
    const lastCheck = user.checkIn.lastCheck ? new Date(user.checkIn.lastCheck) : null;

    // 🟢 First-time check-in
    if (!lastCheck) {
        user.checkIn.lastCheck = now;
        user.checkIn.streak = 1;
        user.YuuCoin += REWARDS[0];
        user.Yuutx.push({ desc: "Daily Check-in", Yuu: REWARDS[0] });
        await user.save();
        return res.status(200).json({
            success: true,
            message: "First check-in done!",
            streak: user.checkIn.streak,
            reward: REWARDS[0],
        });
    }

    // 🕛 Compare midnight times (to detect new day)
    const lastMidnight = new Date(lastCheck);
    lastMidnight.setHours(0, 0, 0, 0);

    const todayMidnight = new Date(now);
    todayMidnight.setHours(0, 0, 0, 0);

    const dayDiff = Math.floor((todayMidnight - lastMidnight) / (1000 * 60 * 60 * 24));
    const hoursPassed = (now - lastCheck) / (1000 * 60 * 60);

    // ❌ Same day → not allowed
    if (dayDiff === 0) {
        return res.status(400).json({
            success: false,
            message: "You’ve already checked in today. Come back after midnight!",
            streak: user.checkIn.streak,
        });
    }

    // ⚠️ Missed due to delay (24+ hours but still next date)
    if (dayDiff === 1 && hoursPassed >= 24) {
        const reward = REWARDS[0];
        user.checkIn.lastCheck = now;
        user.checkIn.streak = 1;
        user.YuuCoin += reward;
        user.Yuutx.push({ desc: "Daily Check-in", Yuu: reward });
        await user.save();
        return res.status(200).json({
            success: true,
            message: "You missed a day! Streak reset.",
            streak: user.checkIn.streak,
            reward,
        });
    }

    // ✅ Valid next day check-in
    if (dayDiff === 1 && hoursPassed < 24) {
        user.checkIn.streak = user.checkIn.streak < 7 ? user.checkIn.streak + 1 : 1;
        const reward = REWARDS[user.checkIn.streak - 1];
        user.YuuCoin += reward;
        user.checkIn.lastCheck = now;
        user.Yuutx.push({ desc: "Daily Check-in", Yuu: reward });
        await user.save();
        return res.status(200).json({
            success: true,
            message: "Daily check-in successful!",
            streak: user.checkIn.streak,
            reward,
        });
    }

    // ❌ Missed multiple days
    if (dayDiff > 1) {
        user.checkIn.streak = 1;
        const reward = REWARDS[0];
        user.YuuCoin += reward;
        user.checkIn.lastCheck = now;
        user.Yuutx.push({ desc: "Daily Check-in", Yuu: reward });
        await user.save();
        return res.status(200).json({
            success: true,
            message: "You missed multiple days! Streak reset.",
            streak: user.checkIn.streak,
            reward,
        });
    }
});

router.post("/useSpin", async (req, res) => {
    const { userId } = req.body
    const user = await userModel.findOne({ _id: userId })
    let spinTime = new Date();

    // if (new Date(user.spinDate) <= spinTime) {
    //     spinTime = spinTime.setHours(spinTime.getHours() + 24);

    //     user.spinDate = new Date(spinTime)
    //     await user.save()

    return res.status(200).json({ success: true })
    // }

    // return res.status(400).json({ success: false, message: "You have already used your spin!" })
});

router.post("/spinReward", async (req, res) => {
    let { userId, reward } = req.body;
    const user = await userModel.findOne({ _id: userId });
    if (!user) return res.redirect("/user/login");

    if (reward.includes("Yuu")) {
        reward = Number(reward.replace("Yuu", ""));

        user.YuuCoin += reward
        user.Yuutx.push({ desc: "Daily Spin", Yuu: reward });
        await user.save();
    }
    // else {
    //     let rewardKey = `${user.username}-${reward.toLowerCase().replace(/\s/g, '')}`

    //     user.userRedeems.push({ [rewardKey]: reward });
    //     await user.save();
    // }
    return res.status(200).json({ success: true });
});

// router.post("/redeemReward", async (req, res) => {
//     const { userId, item } = req.body;
//     const user = await userModel.findOne({ _id: userId });
//     if (!user) return res.redirect("/user/login");

//     let redeemCode = `${user.username}-${item.title.toLowerCase().replace(/\s/g, '')}`;
//     user.userRedeems.push({ [redeemCode]: item });
//     user.YuuCoin -= item.cost;
//     user.Yuutx.push({ desc: `Redeemed: ${item.title}`, Yuu: -item.cost });
//     await user.save();

//     res.status(200).json({ success: true, redeemCode });
// });

module.exports = router;