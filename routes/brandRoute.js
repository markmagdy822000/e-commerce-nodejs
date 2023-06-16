const express = require("express");
const {
  getBrandValidator,
  createBrandValidor,
  deleteBrandValidor,
  updateBrandValidor,
} = require("../utils/validators/brandValidator");
const { protect, allowedTo } = require("../services/authService");

const {
  getBrands,
  getBrand,
  createBrands,
  updateBrand,
  deleteBrand,
  resizeImage,
  uploadBrandImage,
} = require("../services/brandService");

const router = express.Router();

router
  .route("/")
  .get(getBrands)
  .post(
    protect,
    allowedTo("admin", "manager"),
    uploadBrandImage,
    resizeImage,
    createBrandValidor,
    createBrands
  );

router
  .route("/:id")
  .get(getBrandValidator, getBrand)
  .put(
    protect,
    allowedTo("admin", "manager"),
    uploadBrandImage,
    resizeImage,
    updateBrandValidor,
    updateBrand
  )
  .delete(protect, allowedTo("admin"), deleteBrandValidor, deleteBrand);

module.exports = router;
