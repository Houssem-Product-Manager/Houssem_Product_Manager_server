const mongoose = require("mongoose");
const { Schema } = mongoose;

const categorySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  outcomes: [
    {
      type: Schema.Types.ObjectId,
      ref: "Outcome",
    },
  ],
  sum: {
    type: Number,
    default: 0,
  },
});

// Middleware to update the 'sum' field after an outcome is updated
categorySchema.post("findOneAndUpdate", async function (doc, next) {
  try {
    const sum = await this.model.aggregate([
      { $match: { _id: this._conditions._id } },
      {
        $lookup: {
          from: "outcomes",
          localField: "outcomes",
          foreignField: "_id",
          as: "outcomes",
        },
      },
      {
        $unwind: "$outcomes",
      },
      {
        $group: {
          _id: "$_id",
          sum: { $sum: "$outcomes.value" },
        },
      },
    ]);

    await this.model.findByIdAndUpdate(this._conditions._id, {
      sum: sum[0].sum,
    });
    next();
  } catch (error) {
    next(error);
  }
});

const Category = mongoose.model("Category", categorySchema);
module.exports = Category;
