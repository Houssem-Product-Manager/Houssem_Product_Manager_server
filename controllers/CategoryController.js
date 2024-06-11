const Category = require("../models/Category");

// Create Category
const createCategory = async (req, res) => {
  try {
    const { cat } = req.body;
    const ownerId = req.params.userId; // Assuming the authenticated user's ID is stored in req.user._id
    const category = new Category({ name: cat, owner: ownerId });
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Read Categories
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ owner: req.params.userId });
    res.status(200).json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Read Category by ID
const getCategoryById = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const category = await Category.findById(categoryId).populate("outcomes");
    if (!category) {
      return res.status(404).json({ error: "Category famech" });
    }
    res.status(200).json(category);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update Category
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const category = await Category.findOneAndUpdate(
      { _id: id, owner: req.user._id },
      { name },
      { new: true }
    );
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    res.status(200).json(category);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete Category
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findOneAndDelete({
      _id: id,
      owner: req.user._id,
    });
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
