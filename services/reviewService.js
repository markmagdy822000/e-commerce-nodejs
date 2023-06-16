const asyncHandler = require("express-async-handler");

const { Review } = require("../models/reviewModel");

const {
  getOne,
  getAll,
  createOne,
  deleteOne,
  updateOne,
} = require("./handlersFactory");

const createFilterObject = asyncHandler(async (req, res, next) => {
  if (req.params.productId)
    req.filterObject = { product: req.params.productId };
  next();
});

const setProductIdAndUserId = asyncHandler(async (req, res, next) => {
  if (!req.body.produst) req.body.product = req.params.productId;
  if (!req.body.user) req.body.user = req.user._id;
  next();
});

// @desc Get list of reviews
// @route GET /api/v1/reviews
// @access Public
const getReviews = getAll(Review, "");

// @desc Create review
// @route POST /api/v1/review
// @access Private
const getReview = getOne(Review);

// @desc Update specific review
// @route PUT /api/v1/review
// @access Private/Protect/User
const updateReview = updateOne(Review);

// @desc create a review
// @route POST /api/v1/review
// @access Private?Protect/User
const createReviews = createOne(Review);

// @desc delete specific review
// @route DELETE /api/v1/review
// @access Private/Protect/User-Admin-Manager
const deleteReview = deleteOne(Review);

module.exports = {
  getReviews,
  deleteReview,
  getReview,
  createReviews,
  updateReview,
  createFilterObject,
  setProductIdAndUserId,
};
