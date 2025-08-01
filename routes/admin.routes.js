const express = require("express");
const mongoose = require("mongoose");
const productModel = require("../models/productsModel");
const coupanModel = require("../models/coupansModel");
const userModel = require("../models/usersModel");
const orderModel = require("../models/ordersModel");
const slugify = require("slugify");
const verifyAdmin = require("../middleware/verifyAdmin");
const optionalVerifyToken = require("../middleware/optionalVerifyToken");
const uploadOnCloudinary = require("../config/cloudinary");
const upload = require("../middleware/multerConfig");
const fs = require("fs");
const path = require('node:path');
const router = express.Router();

function allowPage(pageName) {
  return async (req, res, next) => {
    const user = await userModel.findById(req.user._QCUI_UI);
    if (!user?.allowed?.[pageName]) {
      return res.status(403).render("admins/adminErr");
    }
    next();
  };
}

router.get("/", verifyAdmin, async (req, res) => {
  const users = await userModel.find();
  const orders = await orderModel.find();
  const products = await productModel.find();
  const coupans = await coupanModel.find();
  res.render("admins/admin-dashboard", { users, orders, products, coupans });
});

router.get("/manage-orders", verifyAdmin, allowPage("manageOrders"), async (req, res) => {
  const users = await userModel.find();
  const orders = await orderModel.find();
  res.render("admins/admin-order", { users, orders });
})
router.get('/manage-orders/search', async (req, res) => {
  const search = req.query.query;
  if (!search || search.trim() === "") {
    return res.status(400).render("PNF")
  }
  const orConditions = [
    { "userDetails.userId": { $regex: search, $options: 'i' } },
    { "userDetails.username": { $regex: search, $options: 'i' } },
    { "userDetails.email": { $regex: search, $options: 'i' } }
  ];
  if (mongoose.Types.ObjectId.isValid(search)) {
    orConditions.push({ _id: search });
  }
  const orders = await orderModel.find({ $or: orConditions });
  res.render("admins/admin-order", { orders });
});
router.post("/change-orders-status", verifyAdmin, async (req, res) => {
  const { newStatus, orderID, userID } = req.body;
  const user = await userModel.find({ _id: userID })
  const order = await orderModel.findById(orderID);
  order.orderInfo.orderStatus = newStatus;
  await order.save();
  const orders = await orderModel.find({ "userDetails.userId": userID });
  user[0].userOrders = orders;
  await user[0].save();
  res.status(200).json({ success: true });
})

router.get("/manage-users", verifyAdmin, allowPage("manageUsers"), async (req, res) => {
  const users = await userModel.find();
  res.render("admins/admin-user", { users });
})
router.get('/manage-users/search', async (req, res) => {
  const search = req.query.query;
  if (!search || search.trim() === "") {
    return res.status(400).render("PNF")
  }
  const orConditions = [
    { username: { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } }
  ];
  if (mongoose.Types.ObjectId.isValid(search)) {
    orConditions.push({ _id: search });
  }
  const users = await userModel.find({ $or: orConditions });
  res.render("admins/admin-user", { users });
});
router.post("/change-user-role", async (req, res) => {
  const { userID, roleStatus } = req.body;
  const user = await userModel.findById(userID);
  user.isAdmin = roleStatus;
  if (!roleStatus) {
    user.allowed.manageProducts = false
    user.allowed.manageCoupans = false
    user.allowed.manageOrders = false
    user.allowed.manageUsers = false
  }
  await user.save();
  res.status(200).json({ success: true });
})
router.post("/change-user-allocation", async (req, res) => {
  const { userID, key, value } = req.body;
  const user = await userModel.findById(userID);
  if (user.isAdmin) {
    user.allowed[key] = value;
    await user.save();
    res.status(200).json({ success: true });
  }
  else {
    res.status(401).json({ success: false, message: "Unauthorized" });
  }
})

router.get("/manage-products", verifyAdmin, allowPage("manageProducts"), async (req, res) => {
  const products = await productModel.find();
  res.render("admins/admin-product", { products, slugify });
});
router.get('/manage-products/search', async (req, res) => {
  const search = req.query.query;
  if (!search || search.trim() === "") {
    return res.status(400).render("PNF")
  }
  const orConditions = [
    { proName: { $regex: search, $options: 'i' } },
    { proCategory: { $regex: search, $options: 'i' } },
    { proDescription: { $regex: search, $options: 'i' } },
  ];
  if (mongoose.Types.ObjectId.isValid(search)) {
    orConditions.push({ _id: search });
  }
  const products = await productModel.find({ $or: orConditions });
  res.render("admins/admin-product", { products, slugify });
});
router.post("/manage-products/delete-product", async (req, res) => {
  const { productID } = req.body;
  const product = await productModel.findByIdAndDelete(productID);
  console.log(product);
  if (!product) return res.status(404).json({ success: false, message: "Product not found" });
  res.status(200).json({ success: true });
});
router.post("/manage-products/edit-product", async (req, res) => {
  const data = req.body.newData;
  const product = await productModel.findById(data._id);
  product.proName = data.proName
  product.proPrice = data.proPrice
  product.proOrignalPrice = data.proOrignalPrice
  product.proDiscount = data.proDiscount
  product.proBuyer = data.proBuyer
  product.proRating = data.proRating
  product.proNoOfReviews = data.proNoOfReviews
  product.proCategory = data.proCategory
  product.stock = data.stock
  product.customization = data.customization
  product.sizeAndPrice = data.sizeAndPrice
  product.colorAndPrice = data.colorAndPrice
  // product.stock = data.stock
  await product.save();
  res.status(200).json({ success: true });
});
router.get("/manage-products/add-products", verifyAdmin, (req, res) => {
  res.render("admins/admin-add-products")
})
router.post("/manage-products/add-products", optionalVerifyToken, upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'galleryURLs', minCount: 2, maxCount: 10 }
]), async (req, res) => {
  const token = req.user
  const user = await userModel.findById(token._QCUI_UI);
  let thumbnail = req.files['thumbnail'];
  thumbnail = thumbnail[0].path;
  let galleryURLs = req.files['galleryURLs'] || [];
  galleryURLs = galleryURLs.map((e) => {
    return e.path;
  })
  let folderName = "product_pics";
  const imageUrl = await uploadOnCloudinary(thumbnail, folderName);
  if (!imageUrl) {
    return res.status(500).json({ success: false, message: "Cloudinary upload failed" });
  }
  let galleryImages = []
  for (const file of galleryURLs) {
    const url = await uploadOnCloudinary(file, folderName);
    if (!url) {
      return res.status(500).json({ success: false, message: "Cloudinary upload failed" });
    }
    galleryImages.push(url);
  }

  const { proName, proPrice, proOrignalPrice, proDiscount, proBuyer, proRating, proNoOfReviews, proDescription, proCategory, choose, sizes, sizePrices, colors, colorPrices } = req.body;
  const sizeAndPrice = [];
  if (sizes && sizePrices) {
    for (let i = 0; i < sizes.length; i++) {
      if (sizes[i] && sizePrices[i]) {
        sizeAndPrice.push({ size: sizes[i].toUpperCase(), price: Number(sizePrices[i]) });
      }
    }
  }
  const colorAndPrice = [];
  if (colors && colorPrices) {
    for (let i = 0; i < colors.length; i++) {
      if (colors[i] && colorPrices[i]) {
        colorAndPrice.push({ color: colors[i], price: Number(colorPrices[i]) });
      }
    }
  }

  const sanitizeNumber = (val) => {
    return val === undefined || val === "" ? undefined : Number(val);
  };

  await productModel.create({
    AddedBy: user.username,
    image: imageUrl,
    galleryImages,
    proName,
    proPrice,
    proOrignalPrice: sanitizeNumber(proOrignalPrice),
    proDiscount: sanitizeNumber(proDiscount),
    proBuyer: sanitizeNumber(proBuyer),
    proRating: sanitizeNumber(proRating),
    proNoOfReviews: sanitizeNumber(proNoOfReviews),
    proDescription,
    proCategory,
    customization: choose,
    sizeAndPrice,
    colorAndPrice,
  })
  res.redirect("/admin/manage-products")
})

router.get("/manage-coupans", verifyAdmin, allowPage("manageCoupans"), async (req, res) => {
  res.render("admins/admin-coupan");
})
router.post("/add-coupan", async (req, res) => {
  const { coupanCode, coupanDiscount, coupanLimit, coupanStartDate, coupanEndDate, choose, coupanDescription } = req.body;
  const newCoupan = await coupanModel.create({
    coupanCode,
    coupanDiscount,
    coupanLimit,
    coupanStartDate,
    coupanEndDate,
    choose,
    coupanDescription
  })
  res.redirect("/admin/manage-coupans")
})

module.exports = router;
