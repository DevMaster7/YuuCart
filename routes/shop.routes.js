const express = require("express");
const mongoose = require("mongoose");
const slugify = require("slugify");
const optionalVerifyToken = require("../middleware/optionalVerifyToken");
const productModel = require("../models/productsModel");
const userModel = require("../models/usersModel");
const { couponModel } = require("../models/offersModel");
const orderModel = require("../models/ordersModel");
const router = express.Router();

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
    }
    catch (error) {
        console.error("ERROR:", error);
        return res.status(500).send("Internal server error");
    }
});

router.get("/:slug-:id", optionalVerifyToken, async (req, res) => {
    try {
        const tokenUser = req.user;
        const { slug, id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).render("PNF")
        }

        const product = await productModel.findById(id);
        const products = await productModel.find();
        if (!product) {
            return res.status(404).render("PNF")
        }

        const expectedSlug = slugify(product.proName, { lower: true });

        if (slug !== expectedSlug) {
            return res.status(404).render("PNF")
        }
        if (!tokenUser) {
            res.render("product", { product, products, slugify, userCart: [], user: [] });
        } else {
            const user = await userModel.findById(tokenUser._QCUI_UI);
            const userCart = user?.userCart || [];
            res.render("product", { product, products, slugify, userCart, user });
        }
    } catch (error) {
        console.error("ERROR:", error);
        return res.status(500).send("Internal server error");
    }
});

router.get("/search", optionalVerifyToken, async (req, res) => {
    const search = req.query.query;
    if (!search || search.trim() === "") {
        return res.status(400).render("PNF")
    }
    try {
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
        return res.status(500).send("Internal server error");
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
    }
    catch (error) {
        console.error("ERROR:", error);
        return res.status(500).send("Internal server error");
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
    } catch (err) {
        console.error("Error adding to cart:", err);
        res.status(500).json({ error: "Server error" });
    }
});

router.post("/delete-from-cart", optionalVerifyToken, async (req, res) => {
    const productIDs = req.body.productIDs;
    const tokenUser = req.user._QCUI_UI;
    const user = await userModel.findById(tokenUser);
    if (!user) return res.status(404).render("PNF");
    user.userCart = user.userCart.filter(id => !productIDs.includes(id));
    await user.save();
    res.status(200).json({ success: true });
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
    } catch (err) {
        console.error("Error adding to wishlist:", err);
        res.status(500).json({ error: "Server error" });
    }
})

router.post("/remove-from-wishlist", optionalVerifyToken, async (req, res) => {
    const { proID } = req.body;
    const tokenUser = req.user._QCUI_UI;
    const user = await userModel.findById(tokenUser);
    if (!user) return res.status(404).render("PNF");
    user.userWishlist = user.userWishlist.filter(id => !proID.includes(id));
    await user.save();
    res.status(200).json({ success: true });
})

router.get("/checkout", optionalVerifyToken, async (req, res) => {
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
})

router.post("/checkout", optionalVerifyToken, async (req, res) => {
    const { productData } = req.body
    req.session.productData = productData;
    return res.status(200).json({ success: true });
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

        res.status(200).json({
            success: true,
            coupon: {
                couponCode: foundCoupon.couponCode,
                benefitType: foundCoupon.benefitType,
                benefitValue: foundCoupon.benefitValue
            },
            message: "Coupon Applied Successfully!"
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server error occurred." });
    }
});

router.post("/place-order", optionalVerifyToken, async (req, res) => {
    const userID = req.user._QCUI_UI;
    const user = await userModel.findById(userID);
    if (user.address == undefined || user.address == "" || user.city == undefined || user.city == "" || user.phone == undefined || user.phone == "" || !user.emailVerified) {
        return res.status(400).json({ success: false, message: "Please Fill All The Details!" });
    }
    const { couponName } = req.body;
    if (couponName !== null) {
        const foundCoupon = await couponModel.findOne({ couponCode: couponName });
        foundCoupon.couponLimit -= 1;
        if (foundCoupon.couponLimit <= 0) {
            foundCoupon.Status = false;
        }
        if (new Date(foundCoupon.couponEndingDate) < new Date()) {
            foundCoupon.Status = false;
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
    res.status(200).json({ success: true, message: "Order Placed Successfully!" });
})

module.exports = router