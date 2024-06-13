const mongoose = require("mongoose");
const Product = require("../models/Product");
const User = require("../models/User");

// Calculate total revenue, profit, and sales volume
const calculateRevenueAndProfit = (products) => {
  let totalRevenue = 0;
  let totalCost = 0;
  let salesVolume = 0;
  let totalMoneySpent = 0;

  products.forEach((product) => {
    product.sales.forEach((sale) => {
      totalRevenue += sale.sellingPrice * sale.quantitySold;
      totalCost += product.buyingPrice * sale.quantitySold;
      salesVolume += sale.quantitySold;
    });
    totalMoneySpent +=
      product.buyingPrice *
      (product.numberInStock +
        product.sales.reduce((acc, sale) => acc + sale.quantitySold, 0));
  });

  const totalProfit = totalRevenue - totalCost;

  return {
    totalRevenue,
    totalProfit,
    salesVolume,
    totalMoneySpent,
  };
};

// Get best-selling products
const getBestSellingProducts = (products) => {
  return products.sort((a, b) => b.sales.length - a.sales.length).slice(0, 5);
};

// Get product-wise profit
const getProductWiseProfit = (products) => {
  return products.map((product) => {
    // Calculate the total profit for each product
    const totalProfit = product.sales.reduce((acc, sale) => {
      return (
        acc + (sale.sellingPrice - product.buyingPrice) * sale.quantitySold
      );
    }, 0);

    return {
      name: product.name,
      profit: totalProfit,
    };
  });
};

// Get inventory value
const getInventoryValue = (products) => {
  return products.reduce(
    (acc, product) => acc + product.buyingPrice * product.numberInStock,
    0
  );
};

// Dashboard stats
const getDashboardStats = async (req, res) => {
  try {
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

    const { totalRevenue, totalProfit, salesVolume, totalMoneySpent } =
      calculateRevenueAndProfit(products);
    const bestSellingProducts = getBestSellingProducts(products);
    const productWiseProfit = getProductWiseProfit(products);
    const inventoryValue = getInventoryValue(products);

    res.status(200).json({
      totalRevenue,
      totalProfit,
      salesVolume,
      bestSellingProducts,
      productWiseProfit,
      inventoryValue,
      totalMoneySpent,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getDashboardStats,
};
