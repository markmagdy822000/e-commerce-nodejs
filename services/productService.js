const asyncHandler = require("express-async-handler");
const multer = require("multer");

const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const { uploadMixOfImages } = require("../middlewares/uploadimageMiddleware");
const ApiError = require("../utils/apiError");
const Product = require("../models/productModel");

const {
  getOne,
  getAll,
  createOne,
  deleteOne,
  updateOne,
} = require("./handlersFactory");

const uploadProductImages = uploadMixOfImages([
  {
    name: "imageCover",
    maxCount: 1,
  },
  {
    name: "images",
    maxCount: 5,
  },
]);

// const multerStorage = multer.memoryStorage();

// const multerFilter = function (req, file, cb) {
//   if (file.mimetype.startsWith("image")) {
//     cb(null, true);
//   } else {
//     cb(new ApiError("Only images is added", 400), false);
//   }
// };
// const upload = multer({ storage: multerStorage, fileFilter: multerFilter });
// const uploadProductImages = upload.fields([
//   {
//     name: "imageCover",
//     maxCount: 1,
//   },
//   {
//     name: "images",
//     maxCount: 5,
//   },
// ]);

const resizeProductImage = asyncHandler(async (req, res, next) => {
  if (req.files.imageCover) {
    const imageCoverFileName = `product-${uuidv4()}-${Date.now()}-cover.jpeg`;

    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toFile(`uploads/products/${imageCoverFileName}`);

    // Save image into our db
    req.body.imageCover = imageCoverFileName;
  }

  if (req.files.images) {
    req.body.images = [];
    await Promise.all(
      req.files.images.map(async (image, index) => {
        const imageName = `product-${uuidv4()}-${Date.now()}-${index + 1}.jpeg`;

        await sharp(image.buffer)
          .resize(2000, 1333)
          .toFormat("jpeg")
          .jpeg({ quality: 95 })
          .toFile(`uploads/products/${imageName}`);

        req.body.images.push(imageName);
      })
    );
    next();
  }
});
const getProducts = getAll(Product, "Products");
const getProduct = getOne(Product, "reviews");
const createProducts = createOne(Product);
const updateProduct = updateOne(Product);
const deleteProduct = deleteOne(Product);

module.exports = {
  getProducts,
  deleteProduct,
  getProduct,
  createProducts,
  updateProduct,
  uploadProductImages,
  resizeProductImage,
};

// @desc Get list of products
// @route GET /api/v1/products
// @access Public
