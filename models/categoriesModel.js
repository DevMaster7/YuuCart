const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    AddedBy: String,
    categoryName: String,
    products: [],
    subCategories: [
        {
            subName: String,
            products: []
        }
    ]
});

const categoryModel = mongoose.model("categories", categorySchema);
module.exports = categoryModel
