const express = require("express");
const mongoose = require("mongoose");
const productModel = require("../models/productsModel");
const coupanModel = require("../models/coupansModel");
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

function allowPage(pageName) {
  return async (req, res, next) => {
    const user = await userModel.findById(req.user._QCUI_UI);
    if (!user?.allowed?.[pageName]) {
      return res.status(403).render("admins/adminErr");
    }
    next();
  };
}

// Dashboard
router.get("/admin-data", async (req, res) => {
  // Data related to users
  let allUsers = await userModel.find();
  const firstUser = await userModel.findOne().sort({ joiningDate: 1 });
  const agg = await userModel.aggregate([
    {
      $group: {
        _id: {
          year: { $year: "$joiningDate" },
          month: { $month: "$joiningDate" },
          day: { $dayOfMonth: "$joiningDate" }
        },
        count: { $sum: 1 }
      }
    }
  ]);

  let allOrders = await orderModel.find();
  let allProducts = await productModel.find();
  let allCoupans = await coupanModel.find();

  let data = {
    allUsers,
    userChartDetails: {
      firstUser,
      agg
    },
    allOrders,
    allProducts,
    allCoupans
  }
  res.status(200).json({ data })
})
router.get("/", verifyAdmin, async (req, res) => {
  const users = await userModel.find();
  const orders = await orderModel.find();
  const products = await productModel.find();
  const coupans = await coupanModel.find();
  res.render("admins/admin-dashboard", { users, orders, products, coupans });
});

// Orders
router.get("/manage-orders", verifyAdmin, allowPage("manageOrders"), async (req, res) => {
  const users = await userModel.find();
  const orders = await orderModel.find();
  res.render("admins/manage-orders", { users, orders });
})
router.get('/manage-orders/search', verifyAdmin, allowPage("manageOrders"), async (req, res) => {
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
  res.render("admins/manage-orders", { orders });
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

// Users
router.get("/manage-users", verifyAdmin, allowPage("manageUsers"), async (req, res) => {
  const users = await userModel.find();
  res.render("admins/manage-users", { users });
})
router.get('/manage-users/search', verifyAdmin, allowPage("manageUsers"), async (req, res) => {
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
  res.render("admins/manage-users", { users });
});
router.post("/change-user-role", verifyAdmin, async (req, res) => {
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
router.post("/change-user-allocation", verifyAdmin, async (req, res) => {
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

// Products
router.get("/manage-products", verifyAdmin, allowPage("manageProducts"), async (req, res) => {
  const products = await productModel.find();
  res.render("admins/manage-products", { products, slugify });
});
router.get('/manage-products/search', verifyAdmin, allowPage("manageProducts"), async (req, res) => {
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
  res.render("admins/manage-products", { products, slugify });
});
router.post("/manage-products/delete-product", verifyAdmin, async (req, res) => {
  const { productID } = req.body;
  const product = await productModel.findByIdAndDelete(productID);
  if (!product) return res.status(404).json({ success: false, message: "Product not found" });
  res.status(200).json({ success: true });
});
router.post("/manage-products/edit-product", verifyAdmin,
  upload.array("notIncludedImgs"),
  async (req, res) => {
    const files = req.files;
    const newData = JSON.parse(req.body.newData);

    let folderName = "product_pics";
    for (const file of files) {
      const url = await uploadOnCloudinary(file.path, folderName);
      if (!url) {
        return res.status(500).json({ success: false, message: "Cloudinary upload failed" });
      }
      newData.galleryImages.push(url);
    }

    const product = await productModel.findById(newData._id);
    product.proName = newData.proName
    product.galleryImages = newData.galleryImages
    product.proPrice = Math.ceil(newData.proPrice) || 0
    product.proOrignalPrice = Math.ceil(newData.proOrignalPrice) || 0
    product.proDiscount = newData.proDiscount || 0
    product.proBuyer = newData.proBuyer || 0
    product.proRating = newData.proRating || 0
    product.proNoOfReviews = newData.proNoOfReviews || 0
    product.proCategory = newData.proCategory
    product.stock = newData.stock
    product.customization = newData.customization
    product.sizeAndPrice = newData.sizeAndPrice
    product.colorAndPrice = newData.colorAndPrice
    await product.save();
    res.status(200).json({ success: true });
  });
router.post("/manage-products/apply-discount", verifyAdmin, async (req, res) => {
  const { filterProducts } = req.body;
  const discount = Number(req.body.discount);

  await productModel.updateMany(
    { _id: { $in: filterProducts } },
    [
      {
        $set: {
          proOrignalPrice: { $ceil: "$proPrice" },
          proPrice: { $ceil: { $subtract: ["$proPrice", { $divide: [{ $multiply: ["$proPrice", discount] }, 100] }] } },
          proDiscount: discount
        }
      }
    ]
  );
  res.status(200).json({ success: true });
});
router.get("/manage-products/add-products", verifyAdmin, allowPage("manageProducts"), (req, res) => {
  res.render("admins/add-products")
})
router.post("/manage-products/add-products", verifyAdmin, optionalVerifyToken, upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'galleryURLs', minCount: 1, maxCount: 10 }
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

  let { proName, proPrice, proOrignalPrice, proDiscount, proBuyer, proRating, proNoOfReviews, proDescription, proCategory, choose, sizes, sizePrices, colors, colorPrices } = req.body;
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

  if (choose == undefined || choose == null) {
    choose = false
  }

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
  res.redirect("/admin/manage-products/add-products")
})

// Coupans
router.get("/manage-coupans", verifyAdmin, allowPage("manageCoupans"), async (req, res) => {
  let coupans = await coupanModel.find();
  for (const coupan of coupans) {
    if (new Date(coupan.coupanEndingDate) < new Date()) {
      coupan.Status = false;
      await coupan.save();
    }
  }
  res.render("admins/manage-coupans", { coupans });
});
// router.get('/manage-coupans/search', verifyAdmin, allowPage("manageCoupans"), async (req, res) => {
//   const search = req.query.query;
//   if (!search || search.trim() === "") {
//     return res.status(400).render("PNF")
//   }
//   const orConditions = [
//     { proName: { $regex: search, $options: 'i' } },
//     { proCategory: { $regex: search, $options: 'i' } },
//     { proDescription: { $regex: search, $options: 'i' } },
//   ];
//   if (mongoose.Types.ObjectId.isValid(search)) {
//     orConditions.push({ _id: search });
//   }
//   const coupans = await productModel.find({ $or: orConditions });
//   res.render("admins/manage-coupans", { coupans, slugify });
// });
router.post("/manage-coupans/edit-coupans", verifyAdmin, async (req, res) => {
  const { id, Status, coupanCode, coupanDiscount, coupanLimit, coupanEndingDate, coupanDescription } = req.body;
  await coupanModel.findByIdAndUpdate(id, {
    Status,
    coupanCode,
    coupanDiscount,
    coupanLimit,
    coupanDescription,
    coupanEndingDate,
  });
  res.status(200).json({ success: true, message: "Coupans updated successfully" });
})
router.get("/manage-coupans/add-coupans", verifyAdmin, allowPage("manageCoupans"), (req, res) => {
  res.render("admins/add-coupans")
})
router.post("/manage-coupans/add-coupans", verifyAdmin, optionalVerifyToken, async (req, res) => {
  const token = req.user
  const user = await userModel.findById(token._QCUI_UI);
  const { coupanCode, coupanDiscount, coupanLimit, coupanEndDate, coupanDescription } = req.body;
  const newCoupan = await coupanModel.create({
    AddedBy: user.username,
    coupanCode,
    coupanDiscount,
    coupanLimit,
    coupanDescription,
    coupanEndingDate: coupanEndDate,
  })
  res.redirect("/admin/manage-coupans");
})

module.exports = router;
