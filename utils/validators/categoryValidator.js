const slugify = require("slugify");
const { check } = require("express-validator");
const { validateMiddleware } = require("../../middlewares/validatorMiddleware");

const getCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid category id formate"),
  validateMiddleware,
];

const createCategoryValidor = [
  check("name")
    .isLength({ min: 3 })
    .withMessage("min 3 characters")
    .isLength({ max: 32 })
    .withMessage("max 32 characters")
    .notEmpty()
    .withMessage("Category is required")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  validateMiddleware,
];
const deleteCategoryValidor = [
  check("id").isMongoId().withMessage("Invalid category id formate"),
  validateMiddleware,
];
const updateCategoryValidor = [
  check("name")
    .optional()
    .isLength({ min: 3 })
    .withMessage("min 3 characters")
    .isLength({ max: 32 })
    .withMessage("max 32 characters")
    .notEmpty()
    .withMessage("Category is required")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check("id")
    .exists()
    .notEmpty()
    .withMessage("Category is required")
    .isMongoId()
    .withMessage("Invalid category id formate"),
  validateMiddleware,
];

module.exports = {
  getCategoryValidator,
  createCategoryValidor,
  deleteCategoryValidor,
  updateCategoryValidor,
};
