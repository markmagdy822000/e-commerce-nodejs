const mongoose = require("mongoose");
// const { findOneAndDelete } = require("./productModel");
const Product = require("./productModel");

const reviewSchema = new mongoose.Schema(
  {
    title: { type: "string" },
    ratings: {
      type: Number,
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
reviewSchema.statics.calcAverageRatingsAndQuantity = async function (
  productId
) {
  const result = await this.aggregate([
    {
      $match: { product: productId },
    },
    {
      $group: {
        _id: "product",
        avgRatings: { $avg: "$ratings" },
        ratingsQuantity: { $sum: 1 },
      },
    },
  ]);
  console.log(result);
  if (result.length > 0)
    //array is not empty
    await Product.findOneAndUpdate(
      {
        _id: productId,
      },
      {
        ratingAverage: result[0].avgRatings,
        ratingQuantity: result[0].ratingsQuantity,
      }
    );
};

reviewSchema.post("save", async function () {
  await this.constructor.calcAverageRatingsAndQuantity(this.product); //review.product // await to call the function
});
reviewSchema.post("remove", async function () {
  await this.constructor.calcAverageRatingsAndQuantity(this.product); //review.product // await to call the function
});

const Review = mongoose.model("Review", reviewSchema);
module.exports = { Review };
