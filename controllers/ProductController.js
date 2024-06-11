const mongoose = require("mongoose");
const Product = require("../models/Product");
const User = require("../models/User");
const cloudinary = require("cloudinary").v2; // Ensure cloudinary is properly configured in your project

const createProduct = async (req, res) => {
  try {
    const { name, numberInStock, buyingPrice, buyingDate, photo, priceToSell } =
      req.body.product;
    const userId = req.userId;

    // Check if a product with the same name already exists
    const existingProduct = await Product.findOne({ name });

    if (existingProduct) {
      return res
        .status(400)
        .json({ error: "Product with this name already exists" });
    }

    // Upload product image to Cloudinary
    const uploadedImage = await cloudinary.uploader.upload(photo, {
      public_id: `product_images/${name}`, // Use a meaningful identifier for the file name
      allowed_formats: ["jpg", "jpeg", "png"], // Allow only specific image formats
    });

    // Create a new Product instance
    const newProduct = new Product({
      creationDate: new Date(),
      name,
      numberInStock,
      photo: uploadedImage.secure_url, // Save the image URL
      buyingPrice,
      buyer: userId, // Assign the user ID to the seller field
      buyingDate,
      priceToSell,
    });

    // Save the new product to the database
    await newProduct.save();

    res
      .status(201)
      .json({ message: "Product created successfully", product: newProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getAllProducts = async (req, res) => {
  try {
    // Query products where the seller field matches the provided user ID
    const products = await Product.find()
      .populate("buyer")
      .populate({
        path: "sales",
        populate: {
          path: "seller",
          model: "User",
        },
      });

    if (!products || products.length === 0) {
      return res.status(404).json({ error: "No products found" });
    }

    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getProduct = async (req, res) => {
  try {
    const { id } = req.userId;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    // Find the product by ID
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Extract the public ID from the Cloudinary URL
    const publicId = product.photo.split("/").pop().split(".")[0];

    // Delete the product from the database
    await Product.findByIdAndDelete(productId);

    // Delete the image from Cloudinary
    await cloudinary.uploader.destroy(`product_images/${publicId}`);

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { productId } = req.params; // Use req.params to get the product ID
    const {
      name,
      numberInStock,
      sellingPrice,
      buyingDate,
      photo,
      priceToSell,
    } = req.body.product;

    let updateData = {
      name,
      numberInStock,
      sellingPrice,
      priceToSell,
    };

    // Only include buyingDate in updateData if it is not null
    if (buyingDate !== null) {
      updateData.buyingDate = buyingDate;
    }

    // If there's a new image, upload it to Cloudinary
    if (photo) {
      const uploadedImage = await cloudinary.uploader.upload(photo, {
        public_id: `product_images/${productId}`, // Use product ID for the file name
        allowed_formats: ["jpg", "jpeg", "png"], // Allow only specific image formats
        overwrite: true, // Overwrite the existing image with the same public_id
        invalidate: true, // Invalidate the old image in the CDN cache
      });
      updateData.photo = uploadedImage.secure_url; // Save the new image URL
    }

    const product = await Product.findByIdAndUpdate(productId, updateData, {
      new: true,
    });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.status(200).json({ message: "Product updated successfully", product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const sellProduct = async (req, res) => {
  try {
    const id = req.params.productId;
    const sellerId = req.userId;
    const { sellingPrice, qte, comment } = req.body;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (product.numberInStock <= 0) {
      return res.status(400).json({ error: "Product is out of stock" });
    }
    if (!sellingPrice) {
      return res.status(400).json({ error: "selling price is required" });
    }

    // Create a new sales record
    const saleRecord = {
      seller: sellerId,
      sellingPrice,
      quantitySold: qte,
      comment
    };

    // Update the product's number in stock and add the sales record
    product.numberInStock -= Number(qte);
    product.sales.push(saleRecord);

    await product.save();

    res.status(200).json({ message: "Product sold successfully", product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const increaseProductStock = async (req, res) => {
  try {
    const { id } = req.userId;
    const { increaseValue } = req.body; // The amount to increase the stock by

    // Validate increaseValue
    if (
      !increaseValue ||
      isNaN(Number(increaseValue)) ||
      Number(increaseValue) <= 0
    ) {
      return res
        .status(400)
        .json({ error: "Please enter a valid positive number" });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Increase the product's number in stock
    product.numberInStock += Number(increaseValue);

    // Save the changes to the product
    await product.save();

    res
      .status(200)
      .json({ message: "Product stock increased successfully", product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProduct,
  deleteProduct,
  updateProduct,
  sellProduct,
  increaseProductStock,
};
