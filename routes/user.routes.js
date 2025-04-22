const express = require("express");
const userModel = require("../models/users");
const { body, validationResult } = require("express-validator")
let bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const router = express.Router();

router.get("/register", (req, res) => {
    res.render("register")
})
router.post("/register",
    body("username").trim().isLength({ min: 5 }),
    body("email").trim().isEmail().isLength({ min: 13 }),
    body("password").trim().isLength({ min: 8 }),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array(), message: "Invalid data" });
        }
        const { fullname, username, email, password, city } = req.body
        const hashPassword = await bcrypt.hash(password, 10);
        const newUser = await userModel.create({
            fullname,
            username,
            email,
            city,
            password: hashPassword
        })
        res.redirect("/login")
    })

router.get("/login", (req, res) => {
    res.render("login");
})
router.post("/login",
    body("email").trim().isLength({ min: 5 }),
    body("password").trim().isLength({ min: 8 }),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array(), message: "Invalid data" });
        }

        const { email, password } = req.body;
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "Email or Password is incorrect" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Email or Password is incorrect" });
        }

        const token = jwt.sign({
            id: user._id,
            username: user.username,
            email: user.email,
            isAdmin: user.isAdmin
        }, process.env.SECRET_KEY, {
            expiresIn: "1h"
        });

        res.cookie("token", token);

        if (user.isAdmin) {
            return res.redirect("/admin/dashboard");
        } else {
            return res.redirect("/shop");
        }
    });

router.get("/shop", (req, res) => {
    res.render("shop");
})
router.get("/register/terms-and-conditions", (req, res) => {
    res.render("terms");
})


module.exports = router