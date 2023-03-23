const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  userID: {
    type: String,
    required: true
  },
  price: {
    type: Number,
  },
  make: {
    type: String,
  },
  model: {
    type: String,
  },
  location: {
    type: String,
  },
  image: {
    type: String,
  },
  mileage: {
    type: Number,
  },
  year: {
    type: Number,
  },
  description: {
    type: String,
  },
  title: {
    type: String,
  },
  contact: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

 const Product = mongoose.model('post', PostSchema);
 module.exports = Product;