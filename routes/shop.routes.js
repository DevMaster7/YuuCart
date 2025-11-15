const express = require("express");
const mongoose = require("mongoose");
const slugify = require("slugify");
const optionalVerifyToken = require("../middleware/optionalVerifyToken");
const productModel = require("../models/productsModel");
const userModel = require("../models/usersModel");
const { couponModel } = require("../models/offersModel");
const { uploadOnCloudinary } = require("../config/cloudinary");
const upload = require("../middleware/multerConfig");
const orderModel = require("../models/ordersModel");
const router = express.Router();
const path = require("path");
const fs = require("fs");

router.get("/", optionalVerifyToken, async (req, res) => {
    try {
        const tokenUser = req.user;
        const products = await productModel.find();
        if (!tokenUser) {
            return res.render('shop', { products, slugify, userCart: [], user: [] });
        } else {
            const user = await userModel.findById(tokenUser._QCUI_UI);
            const userCart = user?.userCart || [];
            return res.render('shop', { products, slugify, userCart, user });
        }
    } catch (error) {
        console.error("ERROR:", error);
        return res.status(500).render("errors/500", {
            title: "500 | Internal Server Error",
            message: "Something went wrong while loading this page. Please try again later.",
        });
    }
});

router.get("/:slug-:id", optionalVerifyToken, async (req, res) => {
    try {
        const tokenUser = req.user;
        const { slug, id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).render("errors/404")
        }

        const product = await productModel.findById(id);
        const products = await productModel.find();
        if (!product) {
            return res.status(404).render("errors/404")
        }
        const allRatings = product.Reviews.map(r => r.rating);
        let starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

        allRatings.forEach(r => {
            if (r >= 4.1) starCounts[5]++;
            else if (r >= 3.1) starCounts[4]++;
            else if (r >= 2.1) starCounts[3]++;
            else if (r >= 1.1) starCounts[2]++;
            else starCounts[0]++;
        });

        const total = allRatings.length;
        let distribution = {
            5: total ? (starCounts[5] / total * 100).toFixed(0) : 0,
            4: total ? (starCounts[4] / total * 100).toFixed(0) : 0,
            3: total ? (starCounts[3] / total * 100).toFixed(0) : 0,
            2: total ? (starCounts[2] / total * 100).toFixed(0) : 0,
            1: total ? (starCounts[1] / total * 100).toFixed(0) : 0,
        };

        const expectedSlug = slugify(product.proName, { lower: true });

        if (slug !== expectedSlug) {
            return res.status(404).render("errors/404")
        }
        if (!tokenUser) {
            res.render("product", { product, products, slugify, userCart: [], user: [] });
        } else {
            const user = await userModel.findById(tokenUser._QCUI_UI);

            function timeAgo(date) {
                const seconds = Math.floor((Date.now() - new Date(date)) / 1000);

                const intervals = {
                    year: 31536000,
                    month: 2592000,
                    week: 604800,
                    day: 86400,
                    hour: 3600,
                    minute: 60,
                };

                if (seconds < 5) return "just now";

                for (const [key, value] of Object.entries(intervals)) {
                    const interval = Math.floor(seconds / value);
                    if (interval >= 1) {
                        return interval === 1 ? `${interval} ${key} ago` : `${interval} ${key}s ago`;
                    }
                }

                return `${seconds} seconds ago`;
            }

            const userCart = user?.userCart || [];
            res.render("product", { product, products, slugify, userCart, user, distribution, timeAgo });
        }
    } catch (error) {
        console.error("ERROR:", error);
        return res.status(500).render("errors/500", {
            title: "500 | Internal Server Error",
            message: "Something went wrong while loading this page. Please try again later.",
        });
    }
});

router.post("/addReview", upload.array("images"), optionalVerifyToken, async (req, res) => {
    try {
        const { id, rating, comment } = req.body.review;
        let userRating = Number(rating);

        if (isNaN(userRating)) {
            return res.status(400).json({ success: false, message: "Invalid rating" });
        }

        if (userRating < 0) userRating = 0;
        if (userRating > 5) userRating = 5;
        const user = await userModel.findById(req.user._QCUI_UI);
        if (!user) return res.redirect("/user/login");

        const product = await productModel.findById(id);
        if (!product) return res.status(404).json({ success: false, message: "Product not found" });

        const hasConfirmed = user.userOrders.some(order =>
            order.productDetails.some(prod => prod.productId.toString() === product._id.toString() && order.orderInfo.orderStatus === "Delivered" && !product.Reviews.some(review => review.username.toString() === user.username.toString()))
        );
        if (!hasConfirmed) {
            return res.status(400).json({ success: false, message: "You have not confirmed your order yet!" });
        }

        const meta = [];
        for (const file of req.files) {
            const url = await uploadOnCloudinary(file.buffer, "reviews");
            meta.push(url);
        }

        const oldTotal = product.proRating * product.proNoOfReviews;
        product.proNoOfReviews += 1;
        product.proRating = (oldTotal + userRating) / product.proNoOfReviews;

        const time = new Date();
        product.Reviews.push({
            username: user.username,
            name: user.fullname,
            rating,
            comment,
            meta,
            time,

        });
        await product.save();

        const allRatings = product.Reviews.map(r => r.rating);
        let starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

        allRatings.forEach(r => {
            if (r >= 4.1) starCounts[5]++;
            else if (r >= 3.1) starCounts[4]++;
            else if (r >= 2.1) starCounts[3]++;
            else if (r >= 1.1) starCounts[2]++;
            else starCounts[0]++;
        });

        const total = allRatings.length;
        let distribution = {
            5: total ? (starCounts[5] / total * 100).toFixed(0) : 0,
            4: total ? (starCounts[4] / total * 100).toFixed(0) : 0,
            3: total ? (starCounts[3] / total * 100).toFixed(0) : 0,
            2: total ? (starCounts[2] / total * 100).toFixed(0) : 0,
            1: total ? (starCounts[1] / total * 100).toFixed(0) : 0,
        };

        res.status(200).json({
            success: true, product: {
                proRating: product.proRating,
                proNoOfReviews: product.proNoOfReviews,
                distribution
            }
        });
    } catch (error) {
        console.error("ERROR:", error);
        return res.status(500).render("errors/500", {
            title: "500 | Internal Server Error",
            message: "Something went wrong while loading this page. Please try again later.",
        });
    }
});

router.get("/search", optionalVerifyToken, async (req, res) => {
    try {
        const search = req.query.query;
        if (!search || search.trim() === "") return res.status(400).render("errors/404")
        const tokenUser = req.user;
        const regex = new RegExp(search, "i");
        const results = await productModel.find({ proName: regex });
        if (!tokenUser) {
            res.render("search-products", { products: results, slugify, userCart: [], user: [] });
        }
        else {
            const user = await userModel.findById(tokenUser._QCUI_UI);
            const userCart = user?.userCart || [];
            res.render("search-products", { products: results, slugify, userCart, user });
        }
    } catch (error) {
        console.error("ERROR:", error);
        return res.status(500).render("errors/500", {
            title: "500 | Internal Server Error",
            message: "Something went wrong while loading this page. Please try again later.",
        });
    }
});

router.get("/cart", optionalVerifyToken, async (req, res) => {
    try {
        const tokenUser = req.user;
        if (!tokenUser) {
            return res.status(401).redirect("/user/login");
        }
        const user = await userModel.findById(tokenUser._QCUI_UI);
        const foundProducts = await productModel.find({ _id: { $in: user.userCart } });
        res.render("cart", { products: foundProducts, user });
    } catch (error) {
        console.error("ERROR:", error);
        return res.status(500).render("errors/500", {
            title: "500 | Internal Server Error",
            message: "Something went wrong while loading this page. Please try again later.",
        });
    }
})

router.post("/add-to-cart", optionalVerifyToken, async (req, res) => {
    try {
        const tokenUser = req.user;
        if (!tokenUser) return res.status(401).json({ success: false, message: "Unauthorized" });
        const { proID } = req.body;
        const user = await userModel.findById(tokenUser._QCUI_UI);
        if (!user.userCart.includes(proID)) {
            user.userCart.push(proID);
            await user.save();
        }
        res.status(200).json({ success: true });
    } catch (error) {
        console.error("ERROR:", error);
        return res.status(500).render("errors/500", {
            title: "500 | Internal Server Error",
            message: "Something went wrong while loading this page. Please try again later.",
        });
    }
});

router.post("/delete-from-cart", optionalVerifyToken, async (req, res) => {
    try {
        const productIDs = req.body.productIDs;
        const tokenUser = req.user._QCUI_UI;
        const user = await userModel.findById(tokenUser);
        if (!user) return res.status(404).render("errors/404");
        user.userCart = user.userCart.filter(id => !productIDs.includes(id));
        await user.save();
        res.status(200).json({ success: true });
    } catch (error) {
        console.error("ERROR:", error);
        return res.status(500).render("errors/500", {
            title: "500 | Internal Server Error",
            message: "Something went wrong while loading this page. Please try again later.",
        });
    }
})

router.post("/add-to-wishlist", optionalVerifyToken, async (req, res) => {
    try {
        const tokenUser = req.user;
        if (!tokenUser) return res.status(401).json({ success: false, message: "Unauthorized" });
        const { proID } = req.body;
        const user = await userModel.findById(tokenUser._QCUI_UI);
        if (!user.userWishlist.includes(proID)) {
            user.userWishlist.push(proID);
            await user.save();
        }
        res.status(200).json({ success: true });
    } catch (error) {
        console.error("ERROR:", error);
        return res.status(500).render("errors/500", {
            title: "500 | Internal Server Error",
            message: "Something went wrong while loading this page. Please try again later.",
        });
    }
})

router.post("/remove-from-wishlist", optionalVerifyToken, async (req, res) => {
    try {
        const { proID } = req.body;
        const tokenUser = req.user._QCUI_UI;
        const user = await userModel.findById(tokenUser);
        if (!user) return res.status(404).render("errors/404");
        user.userWishlist = user.userWishlist.filter(id => !proID.includes(id));
        await user.save();
        res.status(200).json({ success: true });
    } catch (error) {
        console.error("ERROR:", error);
        return res.status(500).render("errors/500", {
            title: "500 | Internal Server Error",
            message: "Something went wrong while loading this page. Please try again later.",
        });
    }
})

router.get("/checkout", optionalVerifyToken, async (req, res) => {
    try {
        const tokenUser = req.user;
        if (!tokenUser) return res.status(401).redirect("/user/login");
        const user = await userModel.findById(tokenUser._QCUI_UI);
        const productData = req.session.productData;
        if (!productData) {
            let url = typeof (req.get('referer'));
            if (url == "undefined") {
                return res.redirect("/shop");
            }
            return res.redirect(req.get('referer'));
        }
        delete req.session.productData;
        return res.render("place-order", { user, productData });
    } catch (error) {
        console.error("ERROR:", error);
        return res.status(500).render("errors/500", {
            title: "500 | Internal Server Error",
            message: "Something went wrong while loading this page. Please try again later.",
        });
    }
})

router.post("/checkout", optionalVerifyToken, async (req, res) => {
    try {
        const { productData } = req.body
        req.session.productData = productData;
        return res.status(200).json({ success: true });
    } catch (error) {
        console.error("ERROR:", error);
        return res.status(500).render("errors/500", {
            title: "500 | Internal Server Error",
            message: "Something went wrong while loading this page. Please try again later.",
        });
    }
})

router.post("/apply-coupon", optionalVerifyToken, async (req, res) => {
    try {
        const { coupon, mainPrice } = req.body;
        const user = await userModel.findById(req.user._QCUI_UI);
        if (!user) return res.redirect("/user/login");

        const foundCoupon = await couponModel.findOne({
            $or: [
                { couponCode: coupon, userList: { $exists: false } },

                { couponCode: coupon, userList: { $in: [user._id] } }
            ]
        });

        // Checking...
        if (!foundCoupon) {
            return res.status(400).json({ success: false, message: "Invalid Coupon Code!" })
        }
        if (!foundCoupon.Status) {
            return res.status(400).json({ success: false, message: "Coupon Not Available Now!" });
        }
        if (foundCoupon.couponEndingDate) {
            if (new Date(foundCoupon.couponEndingDate) < new Date()) {
                return res.status(400).json({ success: false, message: "Coupon Expired!" });
            }
        }
        if (foundCoupon.orderLimit) {
            let orderLimitArr = foundCoupon.orderLimit.split("-");
            orderLimitArr = orderLimitArr
                .map(e => Number(e.replace(/[^0-9]/g, "")))
                .filter(num => !isNaN(num) && num > 0);

            if (orderLimitArr.length == 1) {
                if (mainPrice < orderLimitArr[0]) {
                    return res.status(400).json({ success: false, message: "Coupon Not Applicable For This Order!" });
                }
            } else {
                if (mainPrice < orderLimitArr[0] || mainPrice > orderLimitArr[1]) {
                    return res.status(400).json({ success: false, message: "Coupon Not Applicable For This Order!" });
                }
            }
        }
        res.status(200).json({
            success: true,
            coupon: {
                couponCode: foundCoupon.couponCode,
                benefitType: foundCoupon.benefitType,
                benefitValue: foundCoupon.benefitValue
            },
            message: "Coupon Applied Successfully!"
        });
    } catch (error) {
        console.error("ERROR:", error);
        return res.status(500).render("errors/500", {
            title: "500 | Internal Server Error",
            message: "Something went wrong while loading this page. Please try again later.",
        });
    }
});

router.post("/place-order", optionalVerifyToken, async (req, res) => {
    try {
        const userID = req.user._QCUI_UI;
        const user = await userModel.findById(userID);
        const couponName = req.body.couponName;
        if (user.address == undefined || user.address == "" || user.city == undefined || user.city == "" || user.phone == undefined || user.phone == "" || !user.emailVerified) {
            return res.status(400).json({ success: false, message: "Please Fill All The Details!" });
        }

        if (couponName) {
            const foundCoupon = await couponModel.findOne({ couponCode: couponName });
            if (!foundCoupon) {
                return res.status(400).json({ success: false, message: "Invalid Coupon Code!" });
            }
            if (!foundCoupon.Status) {
                return res.status(400).json({ success: false, message: "Coupon Not Available Now!" });
            }
            if (foundCoupon.couponEndingDate) {
                if (new Date(foundCoupon.couponEndingDate) < new Date()) {
                    return res.status(400).json({ success: false, message: "Coupon Expired!" });
                }
            }

            if (foundCoupon.couponType === "forall") {
                if (typeof foundCoupon.couponLimit === "number") {
                    if (foundCoupon.couponLimit <= 0) {
                        return res.status(400).json({ success: false, message: "Coupon Limit Reached!" });
                    }
                    foundCoupon.couponLimit -= 1;
                }
            } else {
                foundCoupon.userList = foundCoupon.userList.filter(id => id != user._id);
            }

            await foundCoupon.save();
        }


        const productDeliveryData = req.body.productDeliveryData;
        const data = productDeliveryData.map((item) => {
            const newItem = { ...item };
            delete newItem.paymentMethod;
            return newItem;
        });

        await orderModel.create({
            userDetails: {
                userId: userID,
                fullname: user.fullname,
                username: user.username,
                email: user.email,
                phone: user.phone,
                city: user.city,
                address: user.address
            },
            productDetails: data,
            orderInfo: {
                PaymentMethod: productDeliveryData[0].paymentMethod,
            }
        });
        productDeliveryData.forEach(async (pro) => {
            const product = await productModel.findById(pro.productId);
            product.proBuyer += 1;
            await product.save();
        })
        res.status(200).json({ success: true, message: "Order Placed Successfully!" });
    } catch (error) {
        console.error("ERROR:", error);
        return res.status(500).render("errors/500", {
            title: "500 | Internal Server Error",
            message: "Something went wrong while loading this page. Please try again later.",
        });
    }
})

module.exports = router