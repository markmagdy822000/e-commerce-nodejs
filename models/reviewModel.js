const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    title: { type: "string" },
    ratings: {
      type: String,
      min: [1, "Min ratings value"],
      max: [5, "Max ratings value"],
      required: [true, "rating is required"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Review must belong to user"],
    },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
      required: [true, "Review must belong to product"],
    },
  },
  { timestamsps: true }
);

reviewSchema.pre(/^find/, function (next) {
  this.populate({ path: "user", select: "name" });
  next();
});
const Review = mongoose.model("Review", reviewSchema);
module.exports = { Review };
