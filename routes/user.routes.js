const express = require("express");
const { body, validationResult } = require("express-validator")
const bcrypt = require("bcrypt");
const optionalVerifyToken = require("../middleware/optionalVerifyToken");
const jwt = require("jsonwebtoken");
const slugify = require("slugify");
const userModel = require("../models/usersModel");
const productModel = require("../models/productsModel");
const orderModel = require("../models/ordersModel");
const { couponModel } = require("../models/offersModel");
const { uploadOnCloudinary } = require("../config/cloudinary");
const upload = require("../middleware/multerConfig");
const { encrypt, decrypt } = require("../utils/encrypt");
const fs = require("fs");
const path = require('node:path');
const router = express.Router();

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

router.get("/account", optionalVerifyToken, async (req, res) => {
    try {
        const token = req.user;
        if (!token) return res.redirect("/user/login");

        const user = await userModel.findOne(
            { _id: token._QCUI_UI },
            {
                userImg: 1,
                fullname: 1,
                username: 1,
                phone: 1,
                address: 1,
                city: 1,
                email: 1,
                emailVerified: 1,
                YuuCoin: 1
            }
        );
        if (!user) return res.redirect("/user/login");

        res.render("users/my-account", { user });
    } catch (error) {
        console.error("ERROR:", error);
        return res.status(500).render("errors/500", {
            title: "500 | Internal Server Error",
            message: "Something went wrong while loading this page. Please try again later.",
        });
    }
});
router.post("/updateProfilePic", optionalVerifyToken, upload.single("file"), async (req, res) => {
    try {
        const filePath = req.file.buffer
        let folderName = "profile_pics";
        const imageUrl = await uploadOnCloudinary(filePath, folderName);
        if (!imageUrl) {
            return res.status(500).json({ success: false, message: "Cloudinary upload failed" });
        }
        const token = req.user;
        if (!token) return res.redirect("/user/login");
        let foundUser = await userModel.findById(token._QCUI_UI);
        if (!foundUser) return res.redirect("/user/login");
        foundUser.userImg = imageUrl;
        await foundUser.save();

        res.redirect("/user/account");
    } catch (error) {
        console.error("ERROR:", error);
        return res.status(500).render("errors/500", {
            title: "500 | Internal Server Error",
            message: "Something went wrong while loading this page. Please try again later.",
        });
    }
})
router.post("/verifyUser", optionalVerifyToken,
    body("pass").trim().isLength({ min: 8 }),
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ success: false, message: "Password is Too Short!" });
            }
            const { pass } = req.body;
            const token = req.user;
            if (!token) return res.redirect("/user/login");
            let user = await userModel.findById(token._QCUI_UI);
            if (!user) return res.redirect("/user/login");
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
        } catch (error) {
            console.error("ERROR:", error);
            return res.status(500).render("errors/500", {
                title: "500 | Internal Server Error",
                message: "Something went wrong while loading this page. Please try again later.",
            });
        }
    })
router.get("/edit-my-account", optionalVerifyToken, async (req, res) => {
    try {
        res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");

        const token = req.user;
        if (!token) return res.redirect("/user/login");

        const EditToken = req.cookies.UEANT;
        if (!EditToken) return res.redirect("/user/account");
        res.clearCookie('UEANT');

        const user = await userModel.findOne(
            { _id: token._QCUI_UI },
            {
                userImg: 1,
                fullname: 1,
                username: 1,
                phone: 1,
                address: 1,
                city: 1,
                email: 1,
                emailVerified: 1,
                YuuCoin: 1
            }
        );
        if (!user) return res.redirect("/user/login");

        res.render("users/edit-my-acc", { user });
    } catch (error) {
        console.error("ERROR:", error);
        return res.status(500).render("errors/500", {
            title: "500 | Internal Server Error",
            message: "Something went wrong while loading this page. Please try again later.",
        });
    }
});
router.post("/updateUser",
    body("NewObj.Name").trim().isLength({ min: 3 }),
    body("NewObj.Phone_Number").trim().isLength({ min: 10 }),
    body("NewObj.Address").trim().isLength({ min: 5 }),
    body("NewObj.City").trim().isLength({ min: 5 }),
    optionalVerifyToken, async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ success: false, message: "Invalid data!" });
            }
            const { Name, Phone_Number, Address, City } = req.body.NewObj;
            const token = req.user;
            if (!token) return res.redirect("/user/login");
            let user = await userModel.findById(token._QCUI_UI);
            if (!user) return res.redirect("/user/login");
            user.fullname = Name;
            user.phone = Phone_Number;
            user.address = Address;
            user.city = City;
            await user.save();
            return res.status(200).json({ success: true });
        } catch (error) {
            console.error("ERROR:", error);
            return res.status(500).render("errors/500", {
                title: "500 | Internal Server Error",
                message: "Something went wrong while loading this page. Please try again later.",
            });
        }
    })
router.post("/change-password", optionalVerifyToken, async (req, res) => {
    try {
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
    } catch (error) {
        console.error("ERROR:", error);
        return res.status(500).render("errors/500", {
            title: "500 | Internal Server Error",
            message: "Something went wrong while loading this page. Please try again later.",
        });
    }
})
router.get("/reward-center", optionalVerifyToken, async (req, res) => {
    try {
        const token = req.user;
        if (!token) return res.redirect("/user/login");

        const user = await userModel.findOne(
            { _id: token._QCUI_UI },
            {
                joiningDate: 1,
                userImg: 1,
                fullname: 1,
                username: 1,
                phone: 1,
                address: 1,
                city: 1,
                email: 1,
                emailVerified: 1,
                "Reffer.url": 1,
                YuuCoin: 1
            }
        );
        if (!user) return res.redirect("/user/login");

        res.render("users/reward", { user });
    } catch (error) {
        console.error("ERROR:", error);
        return res.status(500).render("errors/500", {
            title: "500 | Internal Server Error",
            message: "Something went wrong while loading this page. Please try again later.",
        });
    }
});
router.get("/messages", optionalVerifyToken, async (req, res) => {
    try {
        const token = req.user;
        if (!token) return res.redirect("/user/login");

        const user = await userModel.findOne(
            { _id: token._QCUI_UI },
            {
                userImg: 1,
                fullname: 1,
                username: 1,
                phone: 1,
                address: 1,
                city: 1,
                email: 1,
                emailVerified: 1,
                messages: 1,
                YuuCoin: 1
            }
        );
        if (!user) return res.redirect("/user/login");

        res.render("users/messages", { user });
    } catch (error) {
        console.error("ERROR:", error);
        return res.status(500).render("errors/500", {
            title: "500 | Internal Server Error",
            message: "Something went wrong while loading this page. Please try again later.",
        });
    }
});
router.post("/editMessage", optionalVerifyToken, async (req, res) => {
    try {
        const { id } = req.body;
        const token = req.user;
        if (!token) return res.redirect("/user/login");

        await userModel.findOneAndUpdate(
            { _id: token._QCUI_UI, "messages._id": id },
            { $set: { "messages.$.seen": false } },
            { new: true }
        );

        res.status(200).json({ success: true });
    } catch (error) {
        console.error("ERROR:", error);
        return res.status(500).render("errors/500", {
            title: "500 | Internal Server Error",
            message: "Something went wrong while loading this page. Please try again later.",
        });
    }
})
router.get("/orders", optionalVerifyToken, async (req, res) => {
    try {
        const token = req.user;
        if (!token) return res.redirect("/user/login");
        let foundUser = await userModel.findById(token._QCUI_UI);
        if (!foundUser) return res.redirect("/user/login");

        const orders = await orderModel.find({ "userDetails.userId": token._QCUI_UI });
        foundUser.userOrders = orders;
        await foundUser.save();

        foundUser = foundUser.toObject();
        foundUser.userOrders = foundUser.userOrders.map(order => {
            const { _id, ...rest } = order;

            if (rest.userDetails?.userId) {
                const { userId, ...uDetails } = rest.userDetails;
                rest.userDetails = uDetails;
            }

            return rest;
        });

        const user = pickFields(foundUser, ["userImg", "fullname", "username", "phone", "address", "city", "userOrders"]);

        res.render("users/my-orders", { user, slugify });
    } catch (error) {
        console.error("ERROR:", error);
        return res.status(500).render("errors/500", {
            title: "500 | Internal Server Error",
            message: "Something went wrong while loading this page. Please try again later.",
        });
    }
});
router.get("/wishlist", optionalVerifyToken, async (req, res) => {
    try {
        const token = req.user;
        if (!token) return res.redirect("/user/login");
        const user = await userModel.findById(token._QCUI_UI);
        if (!user) return res.redirect("/user/login");

        let foundProducts = await productModel.find({ _id: user.userWishlist });

        const products = foundProducts.map((product) => {
            product = product.toObject();
            product = pickFields(product, ["_id", "image", "proName", "proImg", "proPrice", "proPrice", "proOrignalPrice", "proDiscount", "proBuyer", "proRating", "proNoOfReviews", "customization"]);

            return product;
        });

        res.render("users/my-wishlist", { products, slugify });
    } catch (error) {
        console.error("ERROR:", error);
        return res.status(500).render("errors/500", {
            title: "500 | Internal Server Error",
            message: "Something went wrong while loading this page. Please try again later.",
        });
    }
});
router.get("/settings", optionalVerifyToken, async (req, res) => {
    try {
        const token = req.user;
        if (!token) return res.redirect("/user/login");
        let foundUser = await userModel.findById(token._QCUI_UI);
        if (!foundUser) return res.redirect("/user/login");
        res.render("users/setting");
    } catch (error) {
        console.error("ERROR:", error);
        return res.status(500).render("errors/500", {
            title: "500 | Internal Server Error",
            message: "Something went wrong while loading this page. Please try again later.",
        });
    }
});

router.get("/register", async (req, res) => {
    try {
        const reffer = req.query.reffer;

        if (reffer) {
            const refferUser = await userModel.findOne({ username: reffer });
            if (!refferUser) return res.redirect("/user/register");
        }

        res.render("register")
    } catch (error) {
        console.error("ERROR:", error);
        return res.status(500).render("errors/500", {
            title: "500 | Internal Server Error",
            message: "Something went wrong while loading this page. Please try again later.",
        });
    }
})
router.post("/refferAprove", async (req, res) => {
    try {
        const { reffer } = req.body;
        req.session.reffer = {
            from: reffer,
            status: true
        }
        req.session.save();

        res.status(200).json({ message: "success" });
    } catch (error) {
        console.error("ERROR:", error);
        return res.status(500).render("errors/500", {
            title: "500 | Internal Server Error",
            message: "Something went wrong while loading this page. Please try again later.",
        });
    }
})
router.post("/refferReject", async (req, res) => {
    try {
        const { reffer } = req.body;
        req.session.reffer = {
            from: reffer,
            status: false
        }
        req.session.save();

        res.status(200).json({ message: "success" });
    } catch (error) {
        console.error("ERROR:", error);
        return res.status(500).render("errors/500", {
            title: "500 | Internal Server Error",
            message: "Something went wrong while loading this page. Please try again later.",
        });
    }
})
router.post("/register",
    body("fullname").trim().isLength({ min: 3 }),
    body("username").trim().isLength({ min: 5 }),
    body("email").trim().isEmail().isLength({ min: 13 }),
    body("phone").trim().isLength({ min: 10 }),
    body("password").trim().isLength({ min: 8 }),
    async (req, res) => {
        try {
            const captchaToken = req.body["g-recaptcha-response"];
            if (!captchaToken) return res.status(400).json({ message: "Please verify captcha!" });
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array(), message: "Invalid data!" });
            }
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
            let accept = null;
            if (Reffer) {
                from = Reffer.from;
                accept = Reffer.status
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
                Reffer: {
                    from,
                    Status: accept,
                    refferCode: username,
                    url: `${process.env.BASE_URL}/user/register?reffer=${username}`,
                },
                messages: [{
                    textContent: `Assalam o Alaikum, <strong style="color:#FB8500;">${fullname}!</strong><br>
            Welcome to <strong style="color:#FB8500;">YuuCart</strong><br>
            We’re delighted to have you join our community!<br>
            Explore, shop, and enjoy a seamless experience — we hope you’ll love everything we have to offer.<br><br>
            <strong>With Warm Regards,</strong><br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<strong style="color:#FB8500;">The YuuTeam</strong>`,
                    sendingDate: new Date(),
                    seen: true
                }],
            })

            // if (Reffer) {
            //     const refferUser = await userModel.findOne({ username: Reffer.from });
            //     const newUser = await userModel.findOne({ username: username });
            //     if (Reffer.status) {
            //         // console.log(`True FriendShip`);
            //         let msg = {
            //             textContent: `Well, well… someone actually joined through the link! <br>
            //     Unlike the ones who sold out for our <strong>100Yuu</strong> coins, your friend <strong style="color:#FB8500;">${username}</strong> just proved that friendship still exists in this economy.<br>
            //     Loyalty level: Premium 💙`,
            //             sendingDate: new Date(),
            //             seen: true
            //         }
            //         refferUser.YuuCoin += 100;
            //         refferUser.Yuutx.push({ desc: "Referral Bonus", Yuu: 100 });
            //         refferUser.Reffer.yourReffers.push(username);
            //         refferUser.messages.push(msg);
            //         await refferUser.save();

            //         let newMsg = {
            //             textContent: `Well, well… someone actually joined through the link! <br>
            //     Unlike the ones who sold out for our <strong>100Yuu</strong> coins, you just proved that friendship still exists in this economy.<br>
            //     Loyalty level: Premium 💙`,
            //             sendingDate: new Date(),
            //             seen: true
            //         }
            //         newUser.messages.push(newMsg);
            //         await newUser.save();
            //     }
            //     else if (!Reffer.status) {
            //         // console.log(`LoL Fake FriendShip`);
            //         newUser.YuuCoin += 100;
            //         newUser.Yuutx.push({ desc: "Betray Bonus", Yuu: 100 });
            //         await newUser.save();

            //         let msg = {
            //             textContent: `
            //     It appears that your friend just reject your referral link — all for <strong>100Yuu</strong> coins. <br>
            //     Interesting how loyalty seems to lose its shine when there’s a small number of valuable Yuu attached to it. Perhaps your friendship was worth a less than our <strong>100Yuu</strong> after all. <br>
            //     To prevent fight between both of you we can't give you his username to you 🙂`,
            //             sendingDate: new Date(),
            //             seen: true
            //         }
            //         refferUser.messages.push(msg);
            //         await refferUser.save();
            //     }
            // }

            delete req.session.reffer

            return res.status(201).json({ success: true, message: "User registered successfully" });
        } catch (error) {
            console.error("ERROR:", error);
            return res.status(500).render("errors/500", {
                title: "500 | Internal Server Error",
                message: "Something went wrong while loading this page. Please try again later.",
            });
        }
    })

router.get("/login", optionalVerifyToken, (req, res) => {
    try {
        const token = req.user;
        if (token) {
            return res.redirect("/shop")
        }
        res.render("login", { slugify });
    } catch (error) {
        console.error("ERROR:", error);
        return res.status(500).render("errors/500", {
            title: "500 | Internal Server Error",
            message: "Something went wrong while loading this page. Please try again later.",
        });
    }
})
router.post("/login",
    body("email").trim().isLength({ min: 13 }),
    body("password").trim().isLength({ min: 8 }),
    async (req, res) => {
        try {
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
        } catch (error) {
            console.error("ERROR:", error);
            return res.status(500).render("errors/500", {
                title: "500 | Internal Server Error",
                message: "Something went wrong while loading this page. Please try again later.",
            });
        }
    });

module.exports = router
