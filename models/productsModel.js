const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    AddedBy: String,
    image: String,
    galleryImages: [String],
    proName: String,
    proPrice: Number,
    proOrignalPrice: {
        type: Number,
        required: true,
    },
    proDelivery: {
        type: Number,
        required: true
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
            username: {
                type: String,
                required: true
            },
            name: {
                type: String,
                required: true
            },
            rating: {
                type: Number,
                required: true
            },
            meta: [],
            comment: {
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
            username: {
                type: String,
                required: true
            },
            name: {
                type: String,
                required: true
            },
            question: {
                type: String,
                required: true
            },
            time: {
                type: Date,
                default: Date.now
            },
            answer: {
                type: String
            },
            answerTime: {
                type: Date
            }
        }
    ]
})

const productModel = mongoose.model("prducts", productSchema);

module.exports = productModel