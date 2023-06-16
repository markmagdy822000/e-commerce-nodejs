const express = require("express");

const app = express();
const router = express.Router();

const {
  getProductValidator,
  createProductValidator,
  deleteProductValidator,
  updateProductValidator,
} = require("../utils/validators/productValidator");
const { protect, allowedTo } = require("../services/authService");
const reviewsRoute = require("./reviewRoute");
const {
  getProducts,
  getProduct,
  createProducts,
  updateProduct,
  deleteProduct,
  uploadProductImages,
  resizeProductImage,
} = require("../services/productService");

router
  .route("/")
  .get(getProducts)
  .post(
    protect,
    allowedTo("admin", "manager"),
    uploadProductImages,
    resizeProductImage,
    createProductValidator,
    createProducts
  );

router
  .route("/:id")
  .get(getProductValidator, getProduct)
  .put(
    protect,
    allowedTo("admin", "manager"),
    uploadProductImages,
    resizeProductImage,
    updateProductValidator,
    updateProduct
  )
  .delete(protect, allowedTo("admin"), deleteProductValidator, deleteProduct);

router.use("/:productId/reviews", reviewsRoute);
module.exports = router;
