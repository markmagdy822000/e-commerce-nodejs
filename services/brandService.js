const asyncHandler = require("express-async-handler");

const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");

const { uploadSingleImage } = require("../middlewares/uploadimageMiddleware");
const { Brand } = require("../models/brandModel");

const {
  getOne,
  getAll,
  createOne,
  deleteOne,
  updateOne,
} = require("./handlersFactory");
// @desc Get list of brands
// @route GET /api/v1/brands
// @access Public
const getBrands = getAll(Brand, "");

const uploadBrandImage = uploadSingleImage("image");

const resizeImage = asyncHandler(async (req, res, next) => {
  const filename = `brand-${uuidv4()}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(600, 600)
    .toFormat("jpeg")
    .jpeg({ quality: 95 })
    .toFile(`uploads/brands/${filename}`);

  // Save image into our db
  req.body.image = filename;

  next();
});
// @desc Create brand
// @route POST /api/v1/brand
// @access Private
const getBrand = getOne(Brand);

// @desc Update specific brand
// @route PUT /api/v1/brand
// @access Private
const updateBrand = updateOne(Brand);

// @desc create a brand
// @route POST /api/v1/brand
// @access Private
const createBrands = createOne(Brand);

// @desc delete specific brand
// @route DELETE /api/v1/brand
// @access Private
const deleteBrand = deleteOne(Brand);

module.exports = {
  getBrands,
  deleteBrand,
  getBrand,
  createBrands,
  updateBrand,
  resizeImage,
  uploadBrandImage,
};
