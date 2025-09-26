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
    createdAt: {
        type: Date,
        default: Date.now
    },
    Reviews: [
        {
            userId: {
                type: String,
                required: true
            },
            name: {
                type: String,
                required: true
            },
            username: {
                type: String,
                required: true
            },
            rating: {
                type: Number,
                required: true
            },
            meta: [
                { metaImg: String }
            ],
            review: {
                type: String,
                required: true
            },
            time: {
                type: Date,
                default: Date.now
            }
        }
    ],
    AnswerQuestions: [
        {
            userId: {
                type: String,
                required: true
            },
            name: {
                type: String,
                required: true
            },
            username: {
                type: String,
                required: true
            },
            question: {
                type: String,
                required: true
            },
            answer: {
                type: String,
                required: true
            },
            time: {
                type: Date,
                default: Date.now
            }
        }
    ]
})

const productModel = mongoose.model("prducts", productSchema);

module.exports = productModel