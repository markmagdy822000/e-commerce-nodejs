const asyncHandler = require("express-async-handler");

const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");

const ApiError = require("../utils/apiError");
const { uploadSingleImage } = require("../middlewares/uploadimageMiddleware");
const {
  getOne,
  getAll,
  createOne,
  deleteOne,
  updateOne,
} = require("./handlersFactory");
const { Category } = require("../models/categoryModel");

const uploadCategoryImage = uploadSingleImage("image");

const resizeImage = asyncHandler(async (req, res, next) => {
  const filename = `category-${uuidv4()}-${Date.now()}.jpeg`;

  if (req.file)
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toFile(`uploads/categories/${filename}`);

  // Save image into our db

  req.body.image = filename;

  next();
});
// Field name in the schema
// @access Public
const getCategories = getAll(Category);

// @access Private
const getCategory = getOne(Category);

// @access Private
const updateCategory = updateOne(Category);

// @access Private
const createCategories = createOne(Category);

// @access Private
const deleteCategory = deleteOne(Category);

module.exports = {
  getCategories,
  deleteCategory,
  getCategory,
  createCategories,
  updateCategory,
  uploadCategoryImage,
  resizeImage,
};
