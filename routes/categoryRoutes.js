const express = require("express");
const verifyToken = require("../middleWares/jerifyToken");
const {
  getCategories,
  getCategoryById,
  createCategory,
} = require("../controllers/CategoryController");

const router = express.Router();

// Define routes for Outcome model
router.get("/:userId", verifyToken, getCategories); // Get all categories
router.post("/:userId", verifyToken, createCategory); // Get all categories

router.get("/category/:categoryId", verifyToken, getCategoryById); // Get  category by id

module.exports = router;
