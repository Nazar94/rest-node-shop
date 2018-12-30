const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const Product = require('../models/product')
const multer = require('multer')
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

router.get('/', (req, res, next) => {
  Product.find()
    .select('name price _id productImage')
    .exec()
    .then(docs => {
      console.log(docs)
      const response = {
        count: docs.length,
        products: docs.map(doc => {
          return {
            id: doc._id,
            name: doc.name,
            price: doc.price,
            productImage: doc.productImage,
            request: {
              type: 'GET',
              url: 'http://localhost:3000/products/' + doc._id
            }
          }
        })
      }
      // if (docs.length > 0) {
        res.status(200).json(response)
      // } else {
      //   res.status(404).json({
      //     message: 'There are no products'
      //   })
      // }
    })
    .catch(err => {
      console.log(err)
      res.status(500).json({
        error: err
      })
    })
})

router.post('/', upload.single('productImage'), (req, res, next) => {
  console.log(req.file)
  const product = new Product({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    price: req.body.price,
    productImage: req.file.path
  })
  product
    .save()
    .then(result => {
    console.log(result)
      res.status(201).json({
        message:'Created product successfully',
        createdProduct: {
          name: result.name,
          price: result.price,
          _id: result._id,
          request: {
            type: 'GET',
            url: 'http://localhost:3000/products/' + result._id
          }
        }
      })
  })
    .catch(error => {
      console.log(error)
      res.status(500).json({
          error: error
      })
    })
})

router.get('/:productId', (req, res, next) => {
  const id = req.params.productId
  Product.findById(id)
    .select('name price _id productImage')
    .exec()
    .then(doc => {
      console.log(doc)
      if (doc) {
        res.status(200).json({
          product: doc,
          request: {
            type: 'GET',
            description: 'Get all products',
            url: 'http://localhost:3000/products'
          }
        })
      } else {
        res.status(404).json({
          message: 'No valid entry found for provided id'
        })
      }
    })
    .catch(err =>{
      console.log(err)
      res.status(500).json({
          error: err
      })
    })
})

router.patch('/:productId', (req, res, next) => {
  const id = req.params.productId
  const properties = ['propName', 'value']
  const updateOps = {}
  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value
  }
  // Product.update({_id: id}, {$set: {name: req.body.newName, price: req.body.newPrice}})
  Product.update({_id: id}, {$set: updateOps})
    .exec()
    .then(result => {
      if(!result) {
        return res.status(404).json({
          message: "Not found with id " + req.params.productId
        })
      }
      // } for (let i = 0; i <= properties.length; i++) {
      //   if (!req.body.hasOwnProperty(properties[i])) {
      //     res.status(400).json({
      //       message: 'Wrong request body',
      //       actual_wrong_body: req.body,
      //       correct_body: {
      //         "propName": 'name',
      //         "value": "value"
      //       }
      //     })
      //   }
      // }
        console.log(result)
        res.status(200).json({
          message: 'Product updated',
          request: {
            type: 'GET',
            url: 'http://localhost:3000/products/' + id
          }
        })
    })
    .catch(err => {
      console.log(err)
      res.status(500).json({
        error: err
      })
    })
})

router.delete('/:productId', (req, res, next) => {
  const id = req.params.productId
  Product.deleteOne({_id: id})
    .exec()
    .then(result => {
      res.status(200).json({
        message: 'Product deleted',
        request: {
            type: 'POST',
            url: 'http://localhost:3000/products',
            body: {name: 'String', price: 'Number'}
        }
      })
    })
    .catch(err => {
      console.log(err)
      res.status(500).json({
        error: err
      })
    })
})

module.exports = router




