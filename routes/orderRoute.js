const express = require("express");

const { protect, allowedTo } = require("../services/authService");
const {
  createCashOrder,
  filterOrderForLoggedUser,
  findSpecificOrder,
  findAllOrders,
  updateOrderToPaid,
  updateOrderDeliverd,
  checkoutSession,
} = require("../services/orderService");

const router = express.Router();
router.use(protect);

router.get("/checkout-session/:cartId", allowedTo("user"), checkoutSession);

router.route("/:cartId").post(allowedTo("user"), createCashOrder);
router
  .route("/")
  .get(
    allowedTo("user", "admin", "manager"),
    filterOrderForLoggedUser,
    findAllOrders
  );
router.route("/").get(filterOrderForLoggedUser, findAllOrders);

router.route("/:id").get(findSpecificOrder);
router.route("/:id/pay").put(allowedTo("admin", "manager"), updateOrderToPaid);
router
  .route("/:id/deliver")
  .put(allowedTo("admin", "manager"), updateOrderDeliverd);
module.exports = router;
