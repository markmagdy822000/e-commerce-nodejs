const asyncHandler = require("express-async-handler");
const SubCategory = require("../models/subCategoryModel");

const {
  getOne,
  getAll,
  createOne,
  deleteOne,
  updateOne,
} = require("./handlersFactory");
// get  api/v1/categories/:categoryId/subCategories

const createFilterObject = asyncHandler(async (req, res, next) => {
  let filterObject = {};
  if (req.params.categoryId) filterObject = { category: req.params.categoryId };
  req.filterObject = filterObject;
  next();
});

const getSubCategories = getAll(SubCategory, "");
const getSubCategory = getOne(SubCategory);

// @desc Create subCategory
// @route POST /api/v1/subCategory
// @access Private
const setCategoryIdToBody = asyncHandler(async (req, res, next) => {
  if (!req.body.category) req.body.category = req.params.categoryId;
  next();
});
const createSubCategory = createOne(SubCategory);

const updateSubCategory = updateOne(SubCategory);

const deleteSubCategory = deleteOne(SubCategory);

module.exports = {
  createSubCategory,
  getSubCategory,
  getSubCategories,
  deleteSubCategory,
  updateSubCategory,
  setCategoryIdToBody,
  createFilterObject,
};
