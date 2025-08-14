const express = require("express");
const { body, validationResult } = require("express-validator")
let bcrypt = require("bcrypt");
const optionalVerifyToken = require("../middleware/optionalVerifyToken");
const jwt = require("jsonwebtoken");
const slugify = require("slugify");
const sendEmail = require("../utils/sendOTP");
const userModel = require("../models/usersModel");
const productModel = require("../models/productsModel");
const orderModel = require("../models/ordersModel");
const uploadOnCloudinary = require("../config/cloudinary");
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
router.get("/my-account", optionalVerifyToken, userRoute("users/my-account"));
router.post("/updateProfilePic", optionalVerifyToken, upload.single("file"), async (req, res) => {
    const filePath = req.file.path
    let folderName = "profile_pics";
    const imageUrl = await uploadOnCloudinary(filePath, folderName);
    if (!imageUrl) {
        return res.status(500).json({ success: false, message: "Cloudinary upload failed" });
    }
    const token = req.user;
    const user = await userModel.findById(token._QCUI_UI);
    user.userImg = imageUrl;
    await user.save();
    res.redirect("/user/my-account");
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
    const token = req.user;
    if (!token) return res.redirect("/user/login");
    const user = await userModel.findById(token._QCUI_UI);
    if (!user) return res.redirect("/user/login");
    const EditToken = req.cookies.UEANT;
    if (!EditToken) return res.redirect("/user/my-account");
    res.clearCookie('UEANT');
    res.render("users/edit-my-acc", { user });
});
router.post("/updateUser",
    body("NewObj.Name").trim().isLength({ min: 3 }),
    body("NewObj.Username").trim().isLength({ min: 5 }),
    body("NewObj.Email").trim().isEmail().isLength({ min: 13 }),
    body("NewObj.Phone_Number").trim().isLength({ min: 10 }),
    body("NewObj.Address").trim().isLength({ min: 5 }),
    body("NewObj.City").trim().isLength({ min: 5 }),
    optionalVerifyToken, async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array(), message: "Invalid data!" });
        }
        const { Name, Username, Email, Phone_Number, Address, City } = req.body.NewObj;
        const token = req.user;
        const user = await userModel.findById(token._QCUI_UI);
        user.fullname = Name;
        user.username = Username;
        user.email = Email;
        user.phone = Phone_Number;
        user.address = Address;
        user.city = City;
        await user.save();
        return res.status(200).json({ success: true });
    })

router.get("/my-orders", optionalVerifyToken, async (req, res) => {
    const token = req.user;
    if (!token) return res.redirect("/user/login");
    const user = await userModel.findById(token._QCUI_UI);
    if (!user) return res.redirect("/user/login");
    const orders = await orderModel.find({ "userDetails.userId": token._QCUI_UI });
    user.userOrders = orders;
    await user.save();
    res.render("users/my-orders", { user });
});

router.get("/my-wishlist", optionalVerifyToken, async (req, res) => {
    const token = req.user;
    if (!token) return res.redirect("/user/login");
    const user = await userModel.findById(token._QCUI_UI);
    if (!user) return res.redirect("/user/login");
    const products = await productModel.find({ _id: user.userWishlist });
    res.render("users/my-wishlist", { user, products, slugify });
});

router.get("/reward-and-redeem", optionalVerifyToken, userRoute("users/reward-and-redeem"));

router.get("/payment", optionalVerifyToken, userRoute("users/payment"));

router.get("/change-password", optionalVerifyToken, userRoute("users/change-password"));
router.post("/change-pass", optionalVerifyToken, async (req, res) => {
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

router.get("/settings", optionalVerifyToken, userRoute("users/setting"));

router.get("/register", (req, res) => {
    res.render("register")
})
router.post("/register",
    body("fullname").trim().isLength({ min: 3 }),
    body("username").trim().isLength({ min: 5 }),
    body("email").trim().isEmail().isLength({ min: 13 }),
    body("phone").trim().isLength({ min: 10 }),
    body("password").trim().isLength({ min: 8 }),
    async (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array(), message: "Invalid data!" });
        }
        const { fullname, username, email, phone, address, password, city, confirmPassword } = req.body
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
        const newUser = await userModel.create({
            fullname,
            provider: "local",
            username,
            email,
            phone,
            city,
            address,
            password: hashPassword
        })
        const user = {
            fullname,
            username,
            phone,
            city,
            address
        }
        return res.status(201).json({ success: true, message: "User registered successfully", user });
    })

router.get("/login", optionalVerifyToken, (req, res) => {
    const token = req.user;
    if (token) {
        return res.redirect("/shop")
    }
    res.render("login");
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

        const token = jwt.sign({
            _QCUI_UI: user._id,
        }, process.env.SECRET_KEY, {
            expiresIn: "12h"
        });

        res.cookie("ULGG", token);
        if (user.isAdmin) {
            return res.status(200).json({ message: "Admin" });
        } else {
            return res.status(200).json({ message: "User" });
        }
    });

router.get("/sendmail", optionalVerifyToken, async (req, res) => {
    const otp = Math.floor(100000 + Math.random() * 900000);
    const token = req.user;
    if (!token) return res.redirect("/user/login");
    const user = await userModel.findById(token._QCUI_UI);
    if (!user) return res.redirect("/user/login");
    const html = `<div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 40px;">
        <div style="max-width: 600px; margin: auto; background: white; padding: 20px 30px; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #333;">Verify Your Email Address</h2>
          <p style="font-size: 16px; color: #555;">
            Hi ${user.username},
          </p>
          <p style="font-size: 16px; color: #555;">
            To complete your sign up with <strong>QuickCart</strong>, please use the verification code below:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; color: #4CAF50; letter-spacing: 5px;">${otp}</span>
          </div>
          <p style="font-size: 14px; color: #888;">
            This code is valid for the next 10 minutes. Please do not share this code with anyone.
          </p>
          <p style="font-size: 14px; color: #888;">
            If you did not request this, you can safely ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="font-size: 12px; color: #aaa; text-align: center;">
            &copy; ${new Date().getFullYear()} QuickCart. All rights reserved.
          </p>
        </div>
      </div>`

    await sendEmail(user.email, html);
    return res.status(200).json({ success: true });
})

module.exports = router
