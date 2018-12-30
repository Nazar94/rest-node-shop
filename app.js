const express = require('express')
const app = express()
const morgan = require('morgan')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')

const productRoutes = require('./api/routes/products')
const orderRoutes = require('./api/routes/orders')
const userRoutes = require('./api/routes/users')
const uri = 'mongodb://localhost:27017/shop2'
//Use morgan:
app.use(morgan('dev'))
//use body-parser
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
//make uploads folder available ti everyone
app.use('/uploads', express.static('uploads'))
//connecting to database
mongoose.connect(uri, { useNewUrlParser: true }).then(
  (res) => {
    console.log('Connected to database successfully')
  }
).catch(()=> {
  console.log('Connection to daabase is failed')
})

//CORS handling

app.use((req, res, next)=> {
  res.header('Access-Control-Allow-Origin', '*')
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Request-With, Content-Type, Accept, Authorization'
  )
  if(req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET')
    return res.status(200).json({})
  }
  next()
})


app.use('/products', productRoutes)
app.use('/orders', orderRoutes)
app.use('/user', userRoutes)
//Handling errors
app.use((req, res, next) => {
  const error = new Error('Not found')
  error.status = 404
  next(error)
})

app.use((error, req, res, next) => {
  res.status(error.status || 500)
  res.json({
    error: {
      message: error.message
    }
  })
})

module.exports = app