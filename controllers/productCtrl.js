const Products = require('../models/productModel')
const catchAsyncErrors = require('../utils/catchAsyncErrors')

// Filter, sorting and paginating

class APIfeatures {
    constructor(query, queryString){
        this.query = query;
        this.queryString = queryString;
    }
    filtering(){
       const queryObj = {...this.queryString} //queryString = req.query

       const excludedFields = ['page', 'sort', 'limit']
       excludedFields.forEach(el => delete(queryObj[el]))
       
       let queryStr = JSON.stringify(queryObj)
       queryStr = queryStr.replace(/\b(gte|gt|lt|lte|regex)\b/g, match => '$' + match)

    //    gte = greater than or equal
    //    lte = lesser than or equal
    //    lt = lesser than
    //    gt = greater than
       this.query.find(JSON.parse(queryStr))
         
       return this;
    }

    sorting(){
        if(this.queryString.sort){
            const sortBy = this.queryString.sort.split(',').join(' ')
            this.query = this.query.sort(sortBy)
        }else{
            this.query = this.query.sort('-createdAt')
        }

        return this;
    }

    paginating(){
        const page = this.queryString.page * 1 || 1
        const limit = this.queryString.limit * 1 || 9
        const skip = (page - 1) * limit;
        this.query = this.query.skip(skip).limit(limit)
        return this;
    }
}

const productCtrl = {
    getProducts: catchAsyncErrors(async(req, res) =>{
        try {
            const features = new APIfeatures(Products.find(), req.query)
            .filtering().sorting().paginating()

            const products = await features.query

            res.json({
                status: 'success',
                result: products.length,
                products: products
            })
            
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    }),
    createProduct: catchAsyncErrors(async(req, res) =>{
        try {
            const {product_id, title, price, description, content, images, category, stock} = req.body;
            if(!images) return res.status(400).json({msg: "No image upload"})

            const product = await Products.findOne({product_id})
            if(product)
                return res.status(400).json({msg: "This product already exists."})
            
            if(stock === 0 || !stock)
                return res.status(400).json({msg:"You need to enter stock number more than 0"})

            const newProduct = new Products({
                product_id, title: title.toLowerCase(), price, description, content, images, category, stock
            })

            await newProduct.save()
            res.json({msg: "Created a product"})

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    }),
    deleteProduct: catchAsyncErrors(async(req, res) =>{
        try {
            await Products.findByIdAndDelete(req.params.id)
            res.json({msg: "Deleted a Product"})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    }),
    updateProduct: catchAsyncErrors(async(req, res) =>{
        try {
            const {title, price, description, content, images, category, stock} = req.body;
            if(!images) return res.status(400).json({msg: "No image upload"})
            
            if(stock === 0 || !stock || stock<0)
                return res.status(400).json({msg:"You need to enter stock number more than 0"})


            await Products.findOneAndUpdate({_id: req.params.id}, {
                title: title?.toLowerCase(), price, description, content, images, category, stock
            })

            res.json({msg: "Updated a Product"})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    }),
    getSingleProduct: catchAsyncErrors(async(req, res) =>{
        try{
            const product = await Products.findById({_id:req.params.id});

            if(!product)
                return res.status(404).json({msg: "No product found with this id"});

            res.json({msg:"Product found",product});
        } catch (err){
            return res.status(500).json({msg: err.message})
        }
    }),
    createProductReview: catchAsyncErrors(async(req, res)=>{
        const { product_id, comment, rating } = req.body;
        const review = {
            user: req.user.id,
            name: req.user.name,
            rating: Number(rating),
            comment: comment,
        };

        const product = await Products.findById({_id:product_id});

        const isReviewd = product.reviews.find((rev) => rev.user.toHexString() === req.user.id.toString())

        if(isReviewd){
            product.reviews.forEach((rev) => {
                if (rev.user.toHexString() === req.user.id.toString())
                  (rev.rating = rating), (rev.comment = comment);
              });
        } else {
            product.reviews.push(review);
            product.numOfReviews = product.reviews.length;
        }

        let avg = 0;

        product.reviews.forEach((rev) => {
            avg += rev.rating;
        });

        product.ratings = avg / product.reviews.length;

        await product.save({ validateBeforeSave: false });

        res.json({msg:"Review added"});

    }),
    getSingleProductReviews: catchAsyncErrors(async(req, res)=>{
        const product = await Products.findById(req.query.id);

        if(!product)
            res.status(404).json({msg:"No product found with this id"});

        res.json({msg:"Fetched reviews",reviews:product.reviews});

    }),
    deleteProductReview: catchAsyncErrors(async(req, res)=>{
        const product = await Products.findById(req.query.productId);

        if (!product) 
            res.status(404).json({msg:"No product found with this id"});
      
        const reviews = product.reviews.filter(
          (rev) => rev._id.toString() !== req.query.id.toString()
        );
      
        let avg = 0;
      
        reviews.forEach((rev) => {
          avg += rev.rating;
        });
      
        let ratings = 0;
      
        if (reviews.length === 0) {
          ratings = 0;
        } else {
          ratings = avg / reviews.length;
        }
      
        const numOfReviews = reviews.length;
      
        await Products.findByIdAndUpdate(
          req.query.productId,
          {
            reviews,
            ratings,
            numOfReviews,
          },
          {
            new: true,
            runValidators: true,
            useFindAndModify: false,
          }
        );
      
        res.json({msg:"Deleted"});
    })
}


module.exports = productCtrl