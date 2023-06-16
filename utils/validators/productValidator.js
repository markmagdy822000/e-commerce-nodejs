const slugify = require("slugify");
const { check } = require("express-validator");
const { validateMiddleware } = require("../../middlewares/validatorMiddleware");
const { Category } = require("../../models/categoryModel");
const subCategory = require("../../models/subCategoryModel");

const createProductValidator = [
  check("title")
    .isLength({ min: 3 })
    .withMessage("min 3 characters")
    .notEmpty()
    .withMessage("Product is required")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),

  check("description")
    .notEmpty()
    .withMessage("Product description is required")
    .isLength({ max: 2000 })
    .withMessage("Too long description"),

  check("quantity")
    .notEmpty()
    .withMessage("Product quantity is required")
    .isNumeric()
    .withMessage("Product quantity must be number"),
  check("sold")
    .optional()
    .isNumeric()
    .withMessage("Product quantity must be number"),
  check("price")
    .notEmpty()
    .withMessage("Product price is required")
    .isNumeric()
    .withMessage("")
    .isLength({ max: 32 })
    .withMessage("to long price"),
  check("priceAfterDiscount")
    .optional()
    .isNumeric()
    .toFloat()
    .isNumeric()
    .withMessage("Product quantity must be number")
    .custom((value, { req }) => {
      if (req.body.price <= value)
        throw new Error("price before discount must be lower after discount");
      return true;
    }),
  check("colors")
    .optional()
    .isArray()
    .withMessage("colors must be array of strings"),
  check("imageCover").notEmpty().withMessage("Product is required"),
  check("category")
    .notEmpty()
    .withMessage("Product is required")
    .isMongoId()
    .withMessage("Invalid Id formate")
    .custom((categoryId) =>
      // access data base need to use promise or async handler
      Category.findById(categoryId).then((category) => {
        if (!category)
          return Promise.reject(
            new Error(`No category found for this id ${categoryId}`)
          );
      })
    ),

  check("subCategories")
    .optional()
    .isMongoId()
    .withMessage("Invalid Id Formate")
    .custom((subcategoriesIds) =>
      subCategory
        .find({ _id: { $exists: true, $in: subcategoriesIds } })
        .then((results) => {
          if (
            results.length < 1 ||
            results.length !== subcategoriesIds.length
          ) {
            return Promise.reject(
              new Error(`Invalid Subcategory of id ${subcategoriesIds}`)
            );
          }
        })
    )

    .custom((val, { req }) =>
      subCategory
        .find({ category: req.body.category })
        .then((subcategories) => {
          const subcategoriesInDB = [];
          subcategories.forEach((subcategory) =>
            subcategoriesInDB.push(subcategory._id.toString())
          );

          const checker = (target, arr) => target.every((v) => arr.includes(v));
          if (!checker(val, subcategoriesInDB)) {
            return Promise.reject(
              new Error(
                `These subcategories don't belong to category ${req.body.category}`
              )
            );
          }
        })
    ),

  check("brand")
    .optional()
    .isMongoId()
    .withMessage("Invalid Id formate for Brand"),
  check("ratingsAverage")
    .optional()
    .isNumeric()
    .withMessage("rating average must be a number")
    .isLength({ min: 1 })
    .withMessage("rating average must be at least 1")
    .isLength({ max: 5 })
    .withMessage("rating average must be at most 5"),
  check("ratingsQuantity")
    .optional()
    .isNumeric()
    .withMessage("rating qUNTITY must be a number"),
  validateMiddleware,
];

const getProductValidator = [
  check("id").isMongoId().withMessage("Invalid Id Format"),
  validateMiddleware,
];
const updateProductValidator = [
  check("id").isMongoId().withMessage("Invalid Id Format"),
  check("title")
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  validateMiddleware,
];
const deleteProductValidator = [
  check("id").isMongoId().withMessage("Invalid Id Format"),
  validateMiddleware,
];
module.exports = {
  createProductValidator,
  getProductValidator,
  updateProductValidator,
  deleteProductValidator,
};
