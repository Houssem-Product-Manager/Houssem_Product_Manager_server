const mongoose = require("mongoose");
const { Schema } = mongoose;

const outcomeSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  value: {
    type: Number,
    default: 0,
  },
  suggestions: [
    {
      type: Number,
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  updatedDate: {
    type: Date,
    default: Date.now, // Set default value to the current date
  },
  img: { type: String },
  valueHistory: [
    {
      value: { type: Number, required: true },
      date: { type: Date, default: Date.now },
    },
  ],
});

// Middleware to update the 'updatedDate' field before each update operation
outcomeSchema.pre("update", function (next) {
  this.update({}, { $set: { updatedDate: new Date() } });
  next();
});

const Outcome = mongoose.model("Outcome", outcomeSchema);

module.exports = Outcome;
