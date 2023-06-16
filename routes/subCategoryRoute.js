const express = require("express");
// merge => allow to access param of other routes
const router = express.Router({ mergeParams: true });
const {
  createSubCategory,
  getSubCategories,
  getSubCategory,
  deleteSubCategory,
  updateSubCategory,
  setCategoryIdToBody,
  createFilterObject,
} = require("../services/subCategoryService");

const { protect, allowedTo } = require("../services/authService");

const {
  createSubCategoryValidor,
  getSubCategoryValidator,
  deleteSubCategoryValidor,
  updateSubCategoryValidor,
} = require("../utils/validators/subCategoryValidator");

router
  .route("/")
  .post(
    protect,
    allowedTo("admin", "manager"),
    setCategoryIdToBody,
    createSubCategoryValidor,
    createSubCategory
  )
  .get(createFilterObject, getSubCategories);

router
  .route("/:id")
  .get(getSubCategoryValidator, getSubCategory)
  .put(
    protect,
    allowedTo("admin", "manager"),
    updateSubCategoryValidor,
    updateSubCategory
  )
  .delete(
    protect,
    allowedTo("admin"),
    deleteSubCategoryValidor,
    deleteSubCategory
  );

module.exports = router;
