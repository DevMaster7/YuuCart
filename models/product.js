const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    imgUrl: String,
    proName: String,
    proPrice: Number,
    proCategory: String,
    proDescription: String,
    proId: String,
    proBuyer: String,
    proRating: Number
})

const productModel = mongoose.model("prducts", productSchema);

module.exports = productModel