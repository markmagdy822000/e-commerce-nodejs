const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");

const addAddress = asyncHandler(async (req, res, next) => {
  // $addToSet => add productId to wishlist array if productId not exist
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: { addresses: req.body },
    },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    data: user.addresses,
  });
});

const removeAdress = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      // you have array of addresses for each user, we search for a specific address with a property in the address object (_id from database is same as addressId from frontend)
      $pull: { addresses: { _id: req.body.addressId } },
    },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    message: "Address removed.",
    data: user.addresses,
  });
});

const getAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate("addresses");

  res.status(200).json({
    status: "success",
    result: user.addresses.length,
    data: user.addresses,
  });
});

module.exports = {
  removeAdress,
  addAddress,
  getAddress,
};
