const express = require("express");
const {
  getOutcomesSum,
  getOutcomesValueForCurrentWeek,
  getOutcomesValueForCurrentMonth,
  getCustomOutcomesValuePerDay,
  getOutcomesForCurrentMonth,
  getAverageSpendingPerDay,
  getUserBalance,
  increaseBalance,
  decreaseBalance,
} = require("../controllers/DashboardingController");
const verifyToken = require("../middleWares/jerifyToken");
const router = express.Router();
router.get("/sum/:id", verifyToken, getOutcomesSum);
router.get("/sum-for-week/:id", verifyToken, getOutcomesValueForCurrentWeek);
router.get("/sum-for-month/:id", verifyToken, getOutcomesValueForCurrentMonth);
router.get("/permonth/:id", verifyToken, getOutcomesForCurrentMonth);
router.get("/Customperday/:id", verifyToken, getCustomOutcomesValuePerDay);
router.get("/average-per-day/:id", verifyToken, getAverageSpendingPerDay);
router.get("/balance/:id", verifyToken, getUserBalance);
router.put("/increase-balance/:id", verifyToken, increaseBalance);
router.put("/decrease-balance/:id", verifyToken, decreaseBalance);

module.exports = router;
