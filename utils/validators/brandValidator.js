const slugify = require("slugify");
const { check } = require("express-validator");
const { validateMiddleware } = require("../../middlewares/validatorMiddleware");

const getBrandValidator = [
  check("id").isMongoId().withMessage("Invalid brand id formate"),
  validateMiddleware,
];

const createBrandValidor = [
  check("name")
    .isLength({ min: 3 })
    .withMessage("min 3 characters")
    .isLength({ max: 32 })
    .withMessage("max 32 characters")
    .notEmpty()
    .withMessage("Brand is required")
    .custom((val, { req }) => {
      console.log(req.body);
      req.body.slug = slugify(val);
      return true;
    }),
  validateMiddleware,
];
const deleteBrandValidor = [
  check("id").isMongoId().withMessage("Invalid brand id formate"),
  validateMiddleware,
];
const updateBrandValidor = [
  check("name")
    .optional()
    .isLength({ min: 3 })
    .withMessage("min 3 characters")
    .isLength({ max: 32 })
    .withMessage("max 32 characters")
    .notEmpty()
    .withMessage("Brand is required")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check("id")
    .exists()
    .notEmpty()
    .withMessage("Brand is required")
    .isMongoId()
    .withMessage("Invalid brand id formate"),
  validateMiddleware,
];

module.exports = {
  getBrandValidator,
  createBrandValidor,
  deleteBrandValidor,
  updateBrandValidor,
};
