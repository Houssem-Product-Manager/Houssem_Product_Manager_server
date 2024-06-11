const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SaleSchema = new Schema({
  seller: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  sellingDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  sellingPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  quantitySold: {
    type: Number,
    required: true,
    min: 1,
  },
  comment: {
    type: String,
  },
});

const ProductSchema = new Schema({
  creationDate: {
    type: Date,
    default: Date.now,
  },
  name: {
    type: String,
    required: true,
  },
  numberInStock: {
    type: Number,
    required: true,
    min: 0,
  },
  photo: {
    type: String, // Assuming this is a URL to the photo
    required: true,
  },
  buyingPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  priceToSell: {
    type: Number,
    required: true,
    min: 0,
  },
  buyer: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  buyingDate: {
    type: Date,
    required: true,
  },
  sales: [SaleSchema], // Add an array of sales records
});

const Product = mongoose.model("Product", ProductSchema);

module.exports = Product;
