const express = require("express");
const mongoose = require("mongoose");
const productModel = require("../models/productsModel");
const categoriesModel = require("../models/categoriesModel");
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
router.get("/", verifyAdmin, async (req, res) => {
  try {
    const usersCount = await userModel.countDocuments();
    const ordersCount = await orderModel.countDocuments();
    const productsCount = await productModel.countDocuments();
    const couponsCount = await couponModel.countDocuments();
    res.render("admins/admin-dashboard", { usersCount: usersCount, ordersCount: ordersCount, productsCount: productsCount, couponsCount: couponsCount });
  } catch (error) {
    console.error("ERROR:", error);
    return res.status(500).render("errors/500", {
      title: "500 | Internal Server Error",
      message: "Something went wrong while loading this page. Please try again later.",
    });
  }
});
router.post("/toggleCoupon", verifyAdmin, async (req, res) => {
  try {
    const { code, action } = req.body; // frontend se action bhi milega
    const foundCoupon = await couponModel.findOne({ couponCode: code });

    if (!foundCoupon) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }

    // action ke hisaab se Status set karo
    if (action === "pause") {
      foundCoupon.Status = false;
    } else if (action === "resume") {
      foundCoupon.Status = true;
    } else {
      // agar action missing ho ya invalid, toggle kar do (backward compatibility)
      foundCoupon.Status = !foundCoupon.Status;
    }

    await foundCoupon.save();

    return res.status(200).json({ success: true, Status: foundCoupon.Status });
  } catch (error) {
    console.error("ERROR:", error);
    return res.status(500).render("errors/500", {
      title: "500 | Internal Server Error",
      message: "Something went wrong while loading this page. Please try again later.",
    });
  }
})

// Orders
router.get("/manage-orders", verifyAdmin, allowPage("manageOrders"), async (req, res) => {
  try {
    const users = await userModel.find();
    const orders = await orderModel.find();
    res.render("admins/manage-orders", { users, orders });
  } catch (error) {
    console.error("ERROR:", error);
    return res.status(500).render("errors/500", {
      title: "500 | Internal Server Error",
      message: "Something went wrong while loading this page. Please try again later.",
    });
  }
})
router.get('/manage-orders/search', verifyAdmin, allowPage("manageOrders"), async (req, res) => {
  try {
    const search = req.query.query;
    if (!search || search.trim() === "") {
      return res.status(400).render("errors/404")
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
  } catch (error) {
    console.error("ERROR:", error);
    return res.status(500).render("errors/500", {
      title: "500 | Internal Server Error",
      message: "Something went wrong while loading this page. Please try again later.",
    });
  }
});
router.post("/change-orders-status", verifyAdmin, async (req, res) => {
  try {
    const { newStatus, orderID, userID } = req.body;
    const user = await userModel.find({ _id: userID })
    const order = await orderModel.findById(orderID);
    order.orderInfo.orderStatus = newStatus;
    await order.save();
    const orders = await orderModel.find({ "userDetails.userId": userID });
    user[0].userOrders = orders;
    await user[0].save();
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("ERROR:", error);
    return res.status(500).render("errors/500", {
      title: "500 | Internal Server Error",
      message: "Something went wrong while loading this page. Please try again later.",
    });
  }
})

// Users
router.get("/manage-users", verifyAdmin, allowPage("manageUsers"), async (req, res) => {
  try {
    const users = await userModel.find();
    res.render("admins/manage-users", { users });
  } catch (error) {
    console.error("ERROR:", error);
    return res.status(500).render("errors/500", {
      title: "500 | Internal Server Error",
      message: "Something went wrong while loading this page. Please try again later.",
    });
  }
})
router.get('/manage-users/search', verifyAdmin, allowPage("manageUsers"), async (req, res) => {
  try {
    const search = req.query.query;
    if (!search || search.trim() === "") {
      return res.status(400).render("errors/404")
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
  } catch (error) {
    console.error("ERROR:", error);
    return res.status(500).render("errors/500", {
      title: "500 | Internal Server Error",
      message: "Something went wrong while loading this page. Please try again later.",
    });
  }
});
router.post("/change-user-role", verifyAdmin, async (req, res) => {
  try {
    const { userID, roleStatus } = req.body;
    const user = await userModel.findById(userID);
    user.isAdmin = roleStatus;
    if (!roleStatus) {
      user.allowed.manageProducts = false
      user.allowed.manageCoupons = false
      user.allowed.manageOrders = false
      user.allowed.manageUsers = false
    }
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
router.post("/change-user-allocation", verifyAdmin, async (req, res) => {
  try {
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
  } catch (error) {
    console.error("ERROR:", error);
    return res.status(500).render("errors/500", {
      title: "500 | Internal Server Error",
      message: "Something went wrong while loading this page. Please try again later.",
    });
  }
})

// Categories
router.get("/manage-categories", verifyAdmin, allowPage("manageCategories"), async (req, res) => {
  try {
    res.render("admins/manage-cate");
  } catch (error) {
    console.error("ERROR:", error);
    return res.status(500).render("errors/500", {
      title: "500 | Internal Server Error",
      message: "Something went wrong while loading this page. Please try again later.",
    });
  }
});
router.get("/manage-categories/add-category", verifyAdmin, allowPage("manageCategories"),
  async (req, res) => {
    try {
      res.render("admins/add-cate");
    } catch (error) {
      console.error("ERROR:", error);
      return res.status(500).render("errors/500", {
        title: "500 | Internal Server Error",
        message: "Something went wrong while loading this page. Please try again later.",
      });
    }
  })
router.post("/manage-categories/add-category", optionalVerifyToken, verifyAdmin, async (req, res) => {
  try {
    const token = req.user;
    const foundUser = await userModel.findById(token._QCUI_UI);

    let { categoryName, SubName } = req.body;
    categoryName = categoryName.trim();
    let subCategories = [];
    if (SubName) {
      SubName.forEach(name => {
        if (name) {
          subCategories.push({
            subName: name
          })
        }
      })
    }

    await categoriesModel.create({
      AddedBy: foundUser.username,
      categoryName,
      subCategories
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("ERROR:", error);
    return res.status(500).render("errors/500", {
      title: "500 | Internal Server Error",
      message: "Something went wrong while loading this page. Please try again later.",
    });
  }
})

// Products
router.get("/manage-products", verifyAdmin, allowPage("manageProducts"), async (req, res) => {
  try {
    const products = await productModel.find();
    res.render("admins/manage-products", { products, slugify });
  } catch (error) {
    console.error("ERROR:", error);
    return res.status(500).render("errors/500", {
      title: "500 | Internal Server Error",
      message: "Something went wrong while loading this page. Please try again later.",
    });
  }
});
router.get('/manage-products/search', verifyAdmin, allowPage("manageProducts"), async (req, res) => {
  try {
    const search = req.query.query;
    if (!search || search.trim() === "") {
      return res.status(400).render("errors/404")
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
  } catch (error) {
    console.error("ERROR:", error);
    return res.status(500).render("errors/500", {
      title: "500 | Internal Server Error",
      message: "Something went wrong while loading this page. Please try again later.",
    });
  }
});
router.post("/manage-products/delete-product", verifyAdmin, async (req, res) => {
  try {
    const { productID } = req.body;
    const product = await productModel.findByIdAndDelete(productID);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("ERROR:", error);
    return res.status(500).render("errors/500", {
      title: "500 | Internal Server Error",
      message: "Something went wrong while loading this page. Please try again later.",
    });
  }
});
router.post("/manage-products/edit-product", verifyAdmin,
  upload.array("notIncludedImgs"),
  async (req, res) => {
    try {
      const files = req.files;
      const newData = JSON.parse(req.body.newData);

      let folderName = "product_pics";
      for (const file of files) {
        const url = await uploadOnCloudinary(file.buffer, folderName);
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
    } catch (error) {
      console.error("ERROR:", error);
      return res.status(500).render("errors/500", {
        title: "500 | Internal Server Error",
        message: "Something went wrong while loading this page. Please try again later.",
      });
    }
  });
router.post("/manage-products/apply-discount", verifyAdmin, async (req, res) => {
  try {
    const { filterProducts } = req.body;
    const discount = Number(req.body.discount);

    if (discount !== 0) {
      await productModel.updateMany(
        { _id: { $in: filterProducts } },
        [
          {
            $set: {
              proPrice: { $ceil: { $subtract: ["$proOrignalPrice", { $divide: [{ $multiply: ["$proOrignalPrice", discount] }, 100] }] } },
              proDiscount: discount
            }
          }
        ]
      );
    } else {
      await productModel.updateMany(
        { _id: { $in: filterProducts } },
        [
          {
            $set: {
              proPrice: "$proOrignalPrice",
              proDiscount: 0
            }
          }
        ]
      );
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
router.get("/manage-products/add-products", verifyAdmin, allowPage("manageProducts"), (req, res) => {
  try {
    res.render("admins/add-products")
  } catch (error) {
    console.error("ERROR:", error);
    return res.status(500).render("errors/500", {
      title: "500 | Internal Server Error",
      message: "Something went wrong while loading this page. Please try again later.",
    });
  }
})
router.post("/manage-products/add-products", verifyAdmin, optionalVerifyToken,
  upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'galleryURLs', minCount: 1, maxCount: 10 }
  ]), async (req, res) => {
    try {
      const token = req.user;
      const user = await userModel.findById(token._QCUI_UI);

      let thumbnail = req.files['thumbnail'][0].buffer;

      let galleryURLs = req.files['galleryURLs'] || [];
      galleryURLs = galleryURLs.map(e => e.buffer);

      const folderName = "product_pics";

      const imageUrl = await uploadOnCloudinary(thumbnail, folderName);
      if (!imageUrl)
        return res.status(500).json({ success: false, message: "Cloudinary upload failed" });

      let galleryImages = [];
      for (const file of galleryURLs) {
        const url = await uploadOnCloudinary(file, folderName);
        if (!url)
          return res.status(500).json({ success: false, message: "Cloudinary upload failed" });
        galleryImages.push(url);
      }

      let { proName, proOrignalPrice, proDelivery, proDiscount, proBuyer, proRating, proNoOfReviews, proDescription,
        selectedCategories, selectedSubCategories, choose, sizes, sizePrices, colors, colorPrices } = req.body;

      choose = choose === "true" ? true : false;
      const sizeAndPrice = [];
      const colorAndPrice = [];
      if (choose) {
        if (sizes && sizePrices) {
          for (let i = 0; i < sizes.length; i++) {
            if (sizes[i] && sizePrices[i]) {
              sizeAndPrice.push({ size: sizes[i].toUpperCase(), price: Number(sizePrices[i]) });
            }
          }
        }
        if (colors && colorPrices) {
          for (let i = 0; i < colors.length; i++) {
            if (colors[i] && colorPrices[i]) {
              colorAndPrice.push({ color: colors[i], price: Number(colorPrices[i]) });
            }
          }
        }
      }

      const sanitizeNumber = val => val === undefined || val === "" ? undefined : Number(val);

      let proPrice;
      if (sanitizeNumber(proDiscount)) {
        proPrice = proOrignalPrice - (proOrignalPrice * sanitizeNumber(proDiscount)) / 100;
      } else {
        proPrice = proOrignalPrice;
      }

      if (selectedCategories && typeof selectedCategories === "string") {
        selectedCategories = JSON.parse(selectedCategories);
      }
      if (selectedSubCategories && typeof selectedSubCategories === "string") {
        selectedSubCategories = JSON.parse(selectedSubCategories);
      }

      let proCategory = [];
      if ((!selectedCategories || selectedCategories.length === 0) &&
        (!selectedSubCategories || selectedSubCategories.length === 0)) {
        proCategory = ["Uncategorized"];
      } else {
        if (selectedSubCategories && selectedSubCategories.length > 0)
          proCategory = selectedSubCategories;
        else
          proCategory = selectedCategories;
      }

      const newProduct = await productModel.create({
        AddedBy: user.username,
        image: imageUrl,
        galleryImages,
        proName,
        proPrice,
        proOrignalPrice,
        proDelivery,
        proDiscount: sanitizeNumber(proDiscount),
        proBuyer: sanitizeNumber(proBuyer),
        proRating: sanitizeNumber(proRating),
        proNoOfReviews: sanitizeNumber(proNoOfReviews),
        proDescription,
        proCategory,
        customization: choose,
        sizeAndPrice,
        colorAndPrice,
      });

      if (!newProduct)
        return res.status(500).json({ success: false, message: "Product creation failed" });

      const updateCategoryRelations = async (productId) => {

        if ((!selectedCategories || selectedCategories.length === 0) &&
          (!selectedSubCategories || selectedSubCategories.length === 0))
          return;

        if (!selectedSubCategories || selectedSubCategories.length === 0) {
          const cats = await categoriesModel.find({
            categoryName: { $in: selectedCategories }
          });

          for (const cat of cats) {
            cat.products.push(productId);
            await cat.save();
          }
          return;
        }

        for (const entry of selectedSubCategories) {
          const [categoryName, subName] = entry.split("-");

          const category = await categoriesModel.findOne({ categoryName });
          if (!category) continue;

          const sub = category.subCategories
            .find(sc => sc.subName === subName);
          if (!sub) continue;

          sub.products.push(productId);
          await category.save();
        }

      };
      await updateCategoryRelations(newProduct._id);

      return res.redirect("/admin/manage-products/add-products");

    } catch (error) {
      console.error("ERROR:", error);
      return res.status(500).render("errors/500", {
        title: "500 | Internal Server Error",
        message: "Something went wrong while loading this page."
      });
    }
  });

// Coupons
router.get("/manage-coupons", verifyAdmin, allowPage("manageCoupons"), async (req, res) => {
  try {
    let coupons = await couponModel.find();
    for (const coupon of coupons) {
      if (new Date(coupon.couponEndingDate) < new Date()) {
        coupon.Status = false;
        await coupon.save();
      }
    }
    res.render("admins/manage-coupons", { coupons });
  } catch (error) {
    console.error("ERROR:", error);
    return res.status(500).render("errors/500", {
      title: "500 | Internal Server Error",
      message: "Something went wrong while loading this page. Please try again later.",
    });
  }
});
// router.get('/manage-coupons/search', verifyAdmin, allowPage("manageCoupons"), async (req, res) => {
//   const search = req.query.query;
//   if (!search || search.trim() === "") {
//     return res.status(400).render("errors/404")
//   }
//   const orConditions = [
//     { proName: { $regex: search, $options: 'i' } },
//     { proCategory: { $regex: search, $options: 'i' } },
//     { proDescription: { $regex: search, $options: 'i' } },
//   ];
//   if (mongoose.Types.ObjectId.isValid(search)) {
//     orConditions.push({ _id: search });
//   }
//   const coupons = await productModel.find({ $or: orConditions });
//   res.render("admins/manage-coupons", { coupons, slugify });
// });
router.post("/manage-coupons/edit-coupons", verifyAdmin, async (req, res) => {
  try {
    const { id, Status, couponCode, couponDiscount, couponLimit, couponEndingDate, couponDescription } = req.body;
    await couponModel.findByIdAndUpdate(id, {
      Status,
      couponCode,
      couponDiscount,
      couponLimit,
      couponDescription,
      couponEndingDate,
    });
    res.status(200).json({ success: true, message: "Coupons updated successfully" });
  } catch (error) {
    console.error("ERROR:", error);
    return res.status(500).render("errors/500", {
      title: "500 | Internal Server Error",
      message: "Something went wrong while loading this page. Please try again later.",
    });
  }
})
router.get("/manage-coupons/add-coupons", verifyAdmin, allowPage("manageCoupons"), (req, res) => {
  try {
    res.render("admins/add-coupons")
  } catch (error) {
    console.error("ERROR:", error);
    return res.status(500).render("errors/500", {
      title: "500 | Internal Server Error",
      message: "Something went wrong while loading this page. Please try again later.",
    });
  }
})
router.post("/manage-coupons/add-coupons", verifyAdmin, optionalVerifyToken, async (req, res) => {
  try {
    const token = req.user;
    const user = await userModel.findById(token._QCUI_UI);
    const { couponCode, couponTitle, couponSubTitle, couponLimit, couponDescription, couponEndDate, couponCost, couponType, benefitType, benefitValue } = req.body;

    await couponModel.create({
      AddedBy: user.username,
      couponCode,
      couponType,
      couponTitle,
      couponSubTitle,
      couponLimit,
      couponDescription,
      couponEndingDate: couponEndDate,
      couponCost,
      benefitType,
      benefitValue
    });

    res.status(200).json({ success: true, message: "Coupon added successfully" });
  } catch (error) {
    console.error("ERROR:", error);
    return res.status(500).render("errors/500", {
      title: "500 | Internal Server Error",
      message: "Something went wrong while loading this page. Please try again later.",
    });
  }
});

module.exports = router;
