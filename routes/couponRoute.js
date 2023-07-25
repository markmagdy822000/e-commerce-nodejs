const express = require("express");
const { protect, allowedTo } = require("../services/authService");

const {
  getCoupons,
  getCoupon,
  createCoupons,
  updateCoupon,
  deleteCoupon,
} = require("../services/couponService");

const router = express.Router();

router.use(protect, allowedTo("admin", "manager"));

router.route("/").get(getCoupons).post(createCoupons);
router.route("/:id").get(getCoupon).put(updateCoupon).delete(deleteCoupon);

module.exports = router;
