const express = require("express");
const {
  createOutcome,
  getAllOutcomes,
  getOutcome,
  increaseOutcome,
  deleteOutcome,
  deleteSuggestion,
  addSuggestion,
  deleteOutcomes,
} = require("../controllers/outcomesController");
const verifyToken = require("../middleWares/jerifyToken");

const router = express.Router();

// Define routes for Outcome model
router.post("/:userId", verifyToken, createOutcome); // Create a new outcome
router.get("/:userId", verifyToken, getAllOutcomes); // Get all outcomes
router.get("/outcome/:id", verifyToken, getOutcome); // Get a specific outcome by ID
router.put("/:id/increase", verifyToken, increaseOutcome); // Increase the value of an outcome by ID
router.delete("/:id", verifyToken, deleteOutcome); // Delete an outcome by ID
router.post("/delete/:id", verifyToken, deleteOutcomes); // Delete multiple outcomes by IDs

router.delete("/:id/suggestions/:index", verifyToken, deleteSuggestion); // Delete a suggestion from an outcome by ID and suggestion index
router.post("/:id/suggestions", verifyToken, addSuggestion); // Add a suggestion to an outcome by ID

module.exports = router;
