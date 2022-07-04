const mongoose = require('mongoose')


const productSchema = new mongoose.Schema({
    product_id:{
        type: String,
        unique: true,
        trim: true,
        required: true,
    },
    title:{
        type: String,
        trim: true,
        required: true
    },
    price:{
        type: Number,
        trim: true,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    content:{
        type: String,
        required: true
    },
    images:{
        type: Object,
        required: true
    },
    category:{
        type: String,
        required: true
    },
    checked:{
        type: Boolean,
        default: false
    },
    ratings:{
        type: Number,
        default: 0,
    },
    numOfReviews:{
        type: Number,
        default: 0
    },
    reviews:[
        {
            //Person who created a review
            user:{
                type: mongoose.Schema.ObjectId,
                ref:"User",
                required: true
            },
            name:{
                type: String,
                required: true,
            },
            rating:{
                type: Number,
                required: true
            },
            comment:{
                type: String,
            },
            time:{
                type: Date,
                default: Date.now()
            },
        }
    ],
    //Who created the product
    user:{
        type: mongoose.Schema.ObjectId,
        ref: "User",
    },
    stock:{
        type: Number,
        required: true,
    },
    sold:{
        type: Number,
        default: 0
    }
}, {
    timestamps: true //important
})


module.exports = mongoose.model("Products", productSchema)