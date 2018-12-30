const express = require('express')
const router = express.Router()
const multer = require('multer')
const checkAuth = require('../middleware/check-auth')
const ProductsController = require('../controllers/products')
const storage = multer.diskStorage({
  destination: function(req, file, cb){
    cb(null, 'uploads/')
  },
  filename: function(req, file, cb){
    cb(null, /*new Date().toISOString()*/ file.originalname)
  }
})

const fileFilter = (req, file, cb) => {
  //reject a file
  if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg'){
    cb(null, true)
  } else {
    // cb(null, false)
    cb(new Error('Wrong file format'), false)
  }
  // cb(null, false)
  //accept file
  // cb(null, true)
}
// const upload = multer({dest: 'uploads/'})
const upload = multer({
  storage: storage,
  limits: {
  fileSize: 1024 * 1024 * 30
  },
  fileFilter: fileFilter
})

router.get('/', ProductsController.products_get_all)

router.post('/', checkAuth, upload.single('productImage'), ProductsController.products_create_product)

router.get('/:productId', ProductsController.products_get_product)

router.patch('/:productId', checkAuth, ProductsController.products_patch_product)

router.delete('/:productId', checkAuth, ProductsController.products_delete_product)

module.exports = router




