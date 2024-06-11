const Outcome = require("../models/Outcome");
const User = require("../models/User");

const getOutcomesSum = async (req, res) => {
  try {
    const { id } = req.params;

    // Query outcomes where the owner field matches the provided user ID
    const outcomes = await Outcome.find({ owner: id });
    if (!outcomes || outcomes.length === 0) {
      return res.status(404).json({ error: "No outcomes found for this user" });
    }

    // Calculate the sum of all outcome values
    const sum = outcomes.reduce((total, outcome) => total + outcome.value, 0);

    // Return only the sum in the response
    res.status(200).json(sum);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
const getOutcomesValueForCurrentWeek = async (req, res) => {
  try {
    const { id } = req.params;
    const currentDate = new Date();
    const startOfWeek = new Date(currentDate);
    const endOfWeek = new Date(currentDate);

    // Calculate the last Sunday
    if (startOfWeek.getDay() !== 0) {
      // If today is not Sunday
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    } else {
      // If today is Sunday
      startOfWeek.setDate(startOfWeek.getDate() - 7);
    }

    // Calculate the next Sunday
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    const outcomes = await Outcome.find({ owner: id });

    if (!outcomes || outcomes.length === 0) {
      return res.status(404).json({ error: "No outcomes found for this user" });
    }

    let totalValueForWeek = 0;

    // Aggregate value history for each outcome within the week from last Sunday to next Sunday
    for (const outcome of outcomes) {
      for (const entry of outcome.valueHistory) {
        const entryDate = new Date(entry.date);
        if (entryDate >= startOfWeek && entryDate < endOfWeek) {
          // Ensure to include up to just before the next Sunday
          totalValueForWeek += entry.value;
        }
      }
    }

    res.status(200).json({ totalValueForWeek });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getOutcomesValueForCurrentMonth = async (req, res) => {
  try {
    const { id } = req.params;
    const currentDate = new Date();
    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const endOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );

    const outcomes = await Outcome.find({ owner: id });

    if (!outcomes || outcomes.length === 0) {
      return res.status(404).json({ error: "No outcomes found for this user" });
    }

    let totalValueForMonth = 0;

    for (const outcome of outcomes) {
      for (const entry of outcome.valueHistory) {
        if (entry.date >= startOfMonth && entry.date <= endOfMonth) {
          totalValueForMonth += entry.value;
        }
      }
    }

    res.status(200).json(totalValueForMonth);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getCustomOutcomesValuePerDay = async (req, res) => {
  try {
    const { id } = req.params;
    const endDateInput = req.query.startDate; // Get the date from the query and treat it as the end date
    const endDate = new Date(endDateInput);

    const startDate = new Date(endDateInput); // Copy the end date
    startDate.setDate(startDate.getDate() - 7); // Subtract 7 days to set the start date

    const outcomes = await Outcome.find({ owner: id });

    if (!outcomes || outcomes.length === 0) {
      return res.status(404).json({ error: "No outcomes found for this user" });
    }

    let outcomeValuesPerDay = {};

    // Iterate through each outcome
    for (const outcome of outcomes) {
      let outcomeValues = {};

      // Initialize outcomeValues object with zero values for each day in the date range
      let currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        outcomeValues[currentDate.toISOString().split("T")[0]] = 0;
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Aggregate value history for the outcome per day within the date range
      for (const entry of outcome.valueHistory) {
        const entryDate = new Date(entry.date);
        if (entryDate >= startDate && entryDate <= endDate) {
          const day = entryDate.toISOString().split("T")[0];
          outcomeValues[day] += entry.value;
        }
      }

      // Add the outcome's values per day to the main object
      outcomeValuesPerDay[outcome.name] = outcomeValues;
    }

    res.status(200).json(outcomeValuesPerDay);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// outcomes for current month
const getOutcomesForCurrentMonth = async (req, res) => {
  try {
    const { id } = req.params;
    const currentDate = new Date();
    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const endOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );

    const outcomes = await Outcome.find({ owner: id });

    if (!outcomes || outcomes.length === 0) {
      return res.status(404).json({ error: "No outcomes found for this user" });
    }

    let outcomesData = [];

    for (const outcome of outcomes) {
      let totalValueForOutcome = 0;
      for (const entry of outcome.valueHistory) {
        if (entry.date >= startOfMonth && entry.date <= endOfMonth) {
          totalValueForOutcome += entry.value;
        }
      }
      outcomesData.push({ name: outcome.name, value: totalValueForOutcome });
    }

    res.status(200).json(outcomesData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getAverageSpendingPerDay = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    // Convert start and end dates to Date objects
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Query outcomes where the owner field matches the provided user ID
    const outcomes = await Outcome.find({ owner: id });

    if (!outcomes || outcomes.length === 0) {
      return res.status(404).json({ error: "No outcomes found for this user" });
    }

    let totalSpending = 0;
    const uniqueDays = new Set(); // Use a set to store unique dates

    // Iterate through outcomes and calculate total spending and count unique days
    for (const outcome of outcomes) {
      for (const entry of outcome.valueHistory) {
        const entryDate = new Date(entry.date);
        // Format the date to yyyy-mm-dd to ensure comparison is by day and not time
        const formattedDate = entryDate.toISOString().split("T")[0];
        if (entryDate >= start && entryDate <= end) {
          totalSpending += entry.value;
          uniqueDays.add(formattedDate); // Add to set which only stores unique values
        }
      }
    }

    // Calculate the average spending per day
    const averageSpendingPerDay =
      uniqueDays.size === 0 ? 0 : totalSpending / uniqueDays.size;

    res.status(200).json(averageSpendingPerDay);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getUserBalance = async (req, res) => {
  try {
    const { id } = req.params;

    // Query the user model to find the user by ID
    const user = await User.findById(id);

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    // Extract the balance from the user object
    const balance = user.balance;

    // Return the balance in the response
    res.status(200).json(balance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
// increase balance
const increaseBalance = async (req, res) => {
  try {
    const { id } = req.params; // User ID
    const { amount } = req.body; // Amount to increase

    // Find the user by ID and update the balance
    const user = await User.findByIdAndUpdate(
      id,
      { $inc: { balance: amount } },
      { new: true }
    );

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ balance: user.balance });
  } catch (error) {
    console.error("Error increasing balance:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
// decrease balance
const decreaseBalance = async (req, res) => {
  try {
    const { id } = req.params; // User ID
    const { amount } = req.body; // Amount to decrease

    // Find the user by ID and update the balance
    const user = await User.findByIdAndUpdate(
      id,
      { $inc: { balance: -amount } },
      { new: true }
    );

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ balance: user.balance });
  } catch (error) {
    console.error("Error decreasing balance:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getOutcomesSum,
  getOutcomesValueForCurrentWeek,
  getOutcomesValueForCurrentMonth,
  getCustomOutcomesValuePerDay,
  getOutcomesForCurrentMonth,
  getAverageSpendingPerDay,
  getUserBalance,
  increaseBalance,
  decreaseBalance,
};
