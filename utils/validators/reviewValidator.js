const { check } = require("express-validator");
const { validateMiddleware } = require("../../middlewares/validatorMiddleware");
const { Review } = require("../../models/reviewModel");

const createReviewValidor = [
  check("title").optional(),
  check("ratings")
    .notEmpty()
    .withMessage("title is required")
    .isFloat({ min: 1, max: 5 })
    .withMessage("rating must be between 1 and 5"),
  check("user").isMongoId().withMessage("Invalid user id formate"),
  check("product")
    .isMongoId()
    .withMessage("Invalid product id formate")
    .custom((val, { req }) =>
      Review.findOne({
        user: req.user._id.toString(),
        product: req.body.product,
      }).then((review) => {
        if (review) {
          return Promise.reject(new Error(`You already reviewed this product`));
        }
      })
    ),
  validateMiddleware,
];

const getReviewValidator = [
  check("id").isMongoId().withMessage("Invalid review id formate"),
  validateMiddleware,
];

const deleteReviewValidor = [
  check("id")
    .isMongoId()
    .withMessage("Invalid review id formate")
    .custom((val, { req }) =>
      Review.findById(val).then((review) => {
        if (req.user.role == "user") {
          // make sure logged user (req.user.role) is the same who  made the review (req.params.id)
          if (!review) return Promise.reject(new Error("Review not found"));
          if (req.user._id.toString() != review.user.toString())
            return Promise.reject(new Error("Please, delete your own review"));
        }
        return true;
      })
    ),
  validateMiddleware,
];

const updateReviewValidor = [
  check("id")
    .isMongoId()
    .withMessage("Invalid review id formate")
    .custom((val, { req }) =>
      Review.findById(val).then((review) => {
        if (!review) {
          return Promise.reject(new Error("Review not found"));
        }

        if (req.user._id.toString() !== review.user._id.toString()) {
          return Promise.reject(new Error("Please, update your own review"));
        }
        return val;
      })
    ),
  validateMiddleware,
];

module.exports = {
  getReviewValidator,
  createReviewValidor,
  deleteReviewValidor,
  updateReviewValidor,
};
