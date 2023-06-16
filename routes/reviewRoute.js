const express = require("express");
const {
  createReviewValidor,
  getReviewValidator,
  deleteReviewValidor,
  updateReviewValidor,
} = require("../utils/validators/reviewValidator");
const { protect, allowedTo } = require("../services/authService");

const {
  getReviews,
  getReview,
  createReviews,
  updateReview,
  deleteReview,
  setProductIdAndUserId,
  createFilterObject,
} = require("../services/reviewService");

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(createFilterObject, getReviews)
  .post(
    protect,
    allowedTo("user"),
    setProductIdAndUserId,
    createReviewValidor,
    createReviews
  );

router
  .route("/:id")
  .get(getReviewValidator, getReview)
  .put(protect, allowedTo("user"), updateReviewValidor, updateReview)
  .delete(
    protect,
    allowedTo("user", "manager", "admin"),
    deleteReviewValidor,
    deleteReview
  );

module.exports = router;
