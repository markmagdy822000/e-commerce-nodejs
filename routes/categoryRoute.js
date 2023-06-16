const express = require("express");

const multer = require("multer");

const router = express.Router();

const {
  getCategoryValidator,
  createCategoryValidor,
  deleteCategoryValidor,
  updateCategoryValidor,
} = require("../utils/validators/categoryValidator");
const { protect, allowedTo } = require("../services/authService");
const {
  getCategories,
  getCategory,
  createCategories,
  uploadCategoryImage,
  updateCategory,
  deleteCategory,
  resizeImage,
} = require("../services/categoryService");
const subCategoryRoute = require("./subCategoryRoute");

const upload = multer({ dest: "uploads/categories" });
router
  .route("/")

  .get(getCategories)
  .post(
    protect,
    allowedTo("admin", "manager"),
    uploadCategoryImage,
    resizeImage,
    createCategoryValidor,
    createCategories
  );

router
  .route("/:id")
  .get(getCategoryValidator, getCategory)
  .put(
    protect,
    allowedTo("admin", "manager"),
    uploadCategoryImage,
    resizeImage,
    updateCategoryValidor,
    updateCategory
  )
  .delete(protect, allowedTo("admin"), deleteCategoryValidor, deleteCategory);

router.use("/:categoryId/subCategories", subCategoryRoute);

module.exports = router;
