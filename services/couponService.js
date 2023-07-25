// const asyncHandler = require("express-async-handler");
const { Coupon } = require("../models/couponModel");

const {
  getOne,
  getAll,
  createOne,
  deleteOne,
  updateOne,
} = require("./handlersFactory");

// @desc Get list of coupons
// @route GET /api/v1/coupons
// @access Private/Admin-Manager
const getCoupons = getAll(Coupon, "");

// @desc Create coupon
// @route POST /api/v1/coupon
// @access Private
const getCoupon = getOne(Coupon);

// @desc Update specific coupon
// @route PUT /api/v1/coupon
// @access Private
const updateCoupon = updateOne(Coupon);

// @desc create a coupon
// @route POST /api/v1/coupon
// @access Private
const createCoupons = createOne(Coupon);

// @desc delete specific coupon
// @route DELETE /api/v1/coupon
// @access Private
const deleteCoupon = deleteOne(Coupon);

module.exports = {
  getCoupons,
  deleteCoupon,
  getCoupon,
  createCoupons,
  updateCoupon,
};
