const slugify = require("slugify");
const { check } = require("express-validator");
const { validateMiddleware } = require("../../middlewares/validatorMiddleware");

exports.getSubCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid SubCategory id formate"),
  validateMiddleware,
];

exports.createSubCategoryValidor = [
  check("name")
    .isLength({ min: 2 })
    .withMessage("min 3 characters")
    .isLength({ max: 32 })
    .withMessage("max 32 characters")
    .notEmpty()
    .withMessage("SubCategory is required")
    .custom((val, { req }) => (req.body.slug = slugify(val))),
  check("category")
    .notEmpty()
    .withMessage("category id cannot be empty")
    .isMongoId()
    .withMessage("Invalid SubCategory id formate"),
  validateMiddleware,
];
exports.deleteSubCategoryValidor = [
  check("id").isMongoId().withMessage("Invalid SubCategory id formate"),
  validateMiddleware,
];
exports.updateSubCategoryValidor = [
  check("name")
    .isLength({ min: 3 })
    .withMessage("min 3 characters")
    .isLength({ max: 32 })
    .withMessage("max 32 characters")
    .notEmpty()
    .withMessage("SubCategory is required")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check("id")
    .exists()
    .notEmpty()
    .withMessage("SubCategory is required")
    .isMongoId()
    .withMessage("Invalid SubCategory id formate"),
  validateMiddleware,
];
