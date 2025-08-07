const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    AddedBy: String,
    image: String,
    galleryImages: [String],
    proName: String,
    proPrice: Number,
    proOrignalPrice: {
        type: Number,
        default: 0,
    },
    proDiscount: {
        type: Number,
        default: 0,
    },
    proBuyer: {
        type: Number,
        default: 0,
    },
    proRating: {
        type: Number,
        default: 0,
    },
    proNoOfReviews: {
        type: Number,
        default: 0,
    },
    proDescription: String,
    proCategory: {
        type: String,
        lowercase: true
    },
    stock: {
        type: Boolean,
        default: true
    },
    customization: Boolean,
    sizeAndPrice: [
        {
            size: String,
            price: Number,
        },
    ],
    colorAndPrice: [
        {
            color: String,
            price: Number,
        },
    ],
})

const productModel = mongoose.model("prducts", productSchema);

module.exports = productModel