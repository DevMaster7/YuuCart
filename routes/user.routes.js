const express = require("express");
const { body, validationResult } = require("express-validator")
const bcrypt = require("bcrypt");
const optionalVerifyToken = require("../middleware/optionalVerifyToken");
const jwt = require("jsonwebtoken");
const slugify = require("slugify");
const userModel = require("../models/usersModel");
const productModel = require("../models/productsModel");
const orderModel = require("../models/ordersModel");
const { uploadOnCloudinary } = require("../config/cloudinary");
const upload = require("../middleware/multerConfig");
const fs = require("fs");
const path = require('node:path');
const router = express.Router();

function userRoute(viewName) {
    return async (req, res) => {
        const token = req.user;
        if (!token) return res.redirect("/user/login");
        const user = await userModel.findById(token._QCUI_UI);
        if (!user) return res.redirect("/user/login");
        res.render(viewName, { user });
    };
}
router.get("/getUser", optionalVerifyToken, async (req, res) => {
    const token = req.user;
    if (!token) return res.status(400).json({ success: false, message: "User not found!" });
    const user = await userModel.findById(token._QCUI_UI);
    if (!user) return res.status(400).json({ success: false, message: "User not found!" });
    res.status(200).json({ success: true, user });
})
router.get("/account", optionalVerifyToken, userRoute("users/my-account"));
router.post("/updateProfilePic", optionalVerifyToken, upload.single("file"), async (req, res) => {
    const filePath = req.file.buffer
    let folderName = "profile_pics";
    const imageUrl = await uploadOnCloudinary(filePath, folderName);
    if (!imageUrl) {
        return res.status(500).json({ success: false, message: "Cloudinary upload failed" });
    }
    const token = req.user;
    const user = await userModel.findById(token._QCUI_UI);
    user.userImg = imageUrl;
    await user.save();
    res.redirect("/user/account");
})
router.post("/verifyUser", optionalVerifyToken,
    body("pass").trim().isLength({ min: 8 }),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array(), message: "Password is Too Short!" });
        }
        const { pass } = req.body;
        const token = req.user;
        const user = await userModel.findById(token._QCUI_UI);
        const isMatch = await bcrypt.compare(pass, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Password is incorrect!" });
        }
        const EditToken = jwt.sign({
            _QCUI_UI: user.password,
        }, process.env.SECRET_KEY, {
            expiresIn: "1h"
        });
        res.cookie("UEANT", EditToken);
        return res.status(200).json({ success: true });
    })
router.get("/edit-my-account", optionalVerifyToken, async (req, res) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    const token = req.user;
    if (!token) return res.redirect("/user/login");
    const user = await userModel.findById(token._QCUI_UI);
    if (!user) return res.redirect("/user/login");
    const EditToken = req.cookies.UEANT;
    if (!EditToken) return res.redirect("/user/account");
    res.clearCookie('UEANT');
    res.render("users/edit-my-acc", { user });
});
router.post("/updateUser",
    body("NewObj.Name").trim().isLength({ min: 3 }),
    body("NewObj.Username").trim().isLength({ min: 5 }),
    body("NewObj.Phone_Number").trim().isLength({ min: 10 }),
    body("NewObj.Address").trim().isLength({ min: 5 }),
    body("NewObj.City").trim().isLength({ min: 5 }),
    optionalVerifyToken, async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array(), message: "Invalid data!" });
        }
        const { Name, Username, Phone_Number, Address, City } = req.body.NewObj;
        const token = req.user;
        const user = await userModel.findById(token._QCUI_UI);
        user.fullname = Name;
        user.username = Username;
        user.phone = Phone_Number;
        user.address = Address;
        user.city = City;
        await user.save();
        return res.status(200).json({ success: true });
    })
router.post("/change-password", optionalVerifyToken, async (req, res) => {
    const { oldPass, newPass, confirmPass } = req.body;
    const token = req.user;
    if (!token) return res.redirect("/user/login");
    const user = await userModel.findById(token._QCUI_UI);
    if (!user) return res.redirect("/user/login");
    if (!oldPass || !newPass || !confirmPass) {
        return res.status(400).json({ message: "All fields are required!" });
    }
    if (oldPass.length < 8 || newPass.length < 8 || confirmPass.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters long!" });
    }
    const isMatch = await bcrypt.compare(oldPass, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: "Password is incorrect!" });
    }
    if (newPass !== confirmPass) {
        return res.status(400).json({ message: "Password doesn't match!" });
    }
    const hashedPassword = await bcrypt.hash(newPass, 10);
    user.password = hashedPassword;
    await user.save();
    return res.status(200).json({ success: true, message: "Password changed successfully!" });
})
router.get("/reward-center", optionalVerifyToken, userRoute("users/reward"));
router.get("/messages", optionalVerifyToken, userRoute("users/messages"));
router.post("/editMessage", optionalVerifyToken, async (req, res) => {
    const token = req.user;
    const { id } = req.body;
    await userModel.findOneAndUpdate(
        { _id: token._QCUI_UI, "messages._id": id },
        { $set: { "messages.$.seen": false } },
        { new: true }
    );
    res.status(200).json({ success: true });
})
router.get("/orders", optionalVerifyToken, async (req, res) => {
    const token = req.user;
    if (!token) return res.redirect("/user/login");
    const user = await userModel.findById(token._QCUI_UI);
    if (!user) return res.redirect("/user/login");
    const orders = await orderModel.find({ "userDetails.userId": token._QCUI_UI });
    user.userOrders = orders;
    await user.save();
    res.render("users/my-orders", { user, slugify });
});
router.get("/wishlist", optionalVerifyToken, async (req, res) => {
    const token = req.user;
    if (!token) return res.redirect("/user/login");
    const user = await userModel.findById(token._QCUI_UI);
    if (!user) return res.redirect("/user/login");
    const products = await productModel.find({ _id: user.userWishlist });
    res.render("users/my-wishlist", { user, products, slugify });
});
router.get("/settings", optionalVerifyToken, userRoute("users/setting"));

router.get("/register", async (req, res) => {
    const reffer = req.query.reffer;

    if (reffer) {
        const refferUser = await userModel.findOne({ username: reffer });
        if (!refferUser) return res.redirect("/user/register");
    }

    res.render("register")
})
router.post("/refferAprove", async (req, res) => {
    const { reffer } = req.body;
    req.session.reffer = {
        from: reffer,
        status: true
    }
    req.session.save();

    res.status(200).json({ message: "success" });
})
router.post("/refferReject", async (req, res) => {
    const { reffer } = req.body;
    req.session.reffer = {
        from: reffer,
        status: false
    }
    req.session.save();

    res.status(200).json({ message: "success" });
})
router.post("/register",
    body("fullname").trim().isLength({ min: 3 }),
    body("username").trim().isLength({ min: 5 }),
    body("email").trim().isEmail().isLength({ min: 13 }),
    body("phone").trim().isLength({ min: 10 }),
    body("password").trim().isLength({ min: 8 }),
    async (req, res) => {
        const captchaToken = req.body["g-recaptcha-response"];
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array(), message: "Invalid data!" });
        }
        if (!captchaToken) return res.status(400).json({ message: "Please verify captcha!" });
        let { fullname, username, email, phone, address, password, city, confirmPassword } = req.body
        username = username.replace(/\s+/g, '').toLowerCase();
        const emailExists = await userModel.findOne({ email });
        const usernameExists = await userModel.findOne({ username });
        if (emailExists || usernameExists) {
            return res.status(400).json({
                message: "Please try a different username or email!"
            });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({
                message: "Passwords do not match!"
            });
        }
        const hashPassword = await bcrypt.hash(password, 10);

        const joiningDate = new Date();

        let Reffer = req.session.reffer
        let from = "";
        if (Reffer && Reffer.status) {
            from = req.session.reffer.from;
        }

        await userModel.create({
            joiningDate,
            fullname,
            provider: "local",
            username,
            email,
            phone,
            city,
            address,
            password: hashPassword,
            spinDate: joiningDate,
            Reffer: {
                from,
                refferCode: username,
                url: `${process.env.BASE_URL}/user/register?reffer=${username}`,
            }
        })

        if (Reffer) {
            const refferUser = await userModel.findOne({ username: Reffer.from });
            if (Reffer.status) {
                // console.log(`True FriendShip`);
                refferUser.Reffer.yourReffers.push(userData.username);
                let msg = {
                    textContent: `
        Well, well… someone actually joined through the link! <br>
        Unlike the ones who sold out for our <strong>100Yuu</strong> coins, you two just proved that friendship still exists in this economy.<br>
        Loyalty level: Premium 💙
        `,
                    sendingDate: new Date(),
                    seen: true
                }
                refferUser.YuuCoin += 100;
                refferUser.messages.push(msg);
                await refferUser.save();
            }
            else if (!Reffer.status) {
                // console.log(`LoL Fake FriendShip`);
                const newUser = await userModel.findOne({ username: userData.username });
                newUser.YuuCoin += 100;
                await newUser.save();

                let msg = {
                    textContent: `
        It appears that your friend just reject your referral link — all for <strong>100Yuu</strong> coins. <br>
        Interesting how loyalty seems to lose its shine when there’s a small number of valuable Yuu attached to it. Perhaps your friendship was worth a less than our <strong>100Yuu</strong> after all. <br>
        To prevent fight between both of you we can't give you his username to you 🙂
        `,
                    sendingDate: new Date(),
                    seen: true
                }
                refferUser.messages.push(msg);
                await refferUser.save();
            }
        }

        delete req.session.reffer

        return res.status(201).json({ success: true, message: "User registered successfully" });
    })

router.get("/login", optionalVerifyToken, (req, res) => {
    const token = req.user;
    if (token) {
        return res.redirect("/shop")
    }
    res.render("login", { slugify });
})
router.post("/login",
    body("email").trim().isLength({ min: 13 }),
    body("password").trim().isLength({ min: 8 }),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array(), message: "Invalid data!" });
        }

        const { email, password } = req.body;
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "Email or Password is incorrect!" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Email or Password is incorrect!" });
        }

        const token = jwt.sign(
            { _QCUI_UI: user._id },
            process.env.SECRET_KEY,
            { expiresIn: "24h" }
        );

        res.cookie("ULGG", token, {
            // httpOnly: true,
            // secure: true,
            maxAge: 24 * 60 * 60 * 1000
        });

        // ----For Testing----
        // const token = jwt.sign(
        //     { _QCUI_UI: user._id },
        //     process.env.SECRET_KEY,
        //     { expiresIn: "1m" }
        // );

        // res.cookie("ULGG", token, {
        //     // httpOnly: true,
        //     // secure: true,
        //     maxAge: 60 * 1000
        // });

        if (user.isAdmin) {
            return res.status(200).json({ message: "Admin" });
        } else {
            return res.status(200).json({ message: "User" });
        }
    });

module.exports = router
