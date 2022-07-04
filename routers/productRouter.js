const router = require('express').Router()
const productCtrl = require('../controllers/productCtrl')
const auth = require('../middleware/auth')
const authAdmin = require('../middleware/authAdmin')


router.route('/products')
    .get(productCtrl.getProducts)
    .post(auth, authAdmin, productCtrl.createProduct)


router.route('/products/:id')
    .delete(auth, authAdmin, productCtrl.deleteProduct)
    .put(auth, authAdmin, productCtrl.updateProduct)
    .get(auth,authAdmin,productCtrl.getSingleProduct)

router.route('/products/review')
    .post(auth,productCtrl.createProductReview)

router.route('/reviews')
    .get(productCtrl.getSingleProductReviews)
    .delete(auth,authAdmin,productCtrl.deleteProductReview)

module.exports = router