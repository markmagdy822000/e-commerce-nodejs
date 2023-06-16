const asyncHandler = require("express-async-handler");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");
const bcrypt = require("bcryptjs");
const ApiError = require("../utils/apiError");
const createToken = require("../utils/createToken");
const {
  getAll,
  getOne,
  createOne,
  updateOne,
  deleteOne,
  inActive,
} = require("./handlersFactory");
const { uploadSingleImage } = require("../middlewares/uploadimageMiddleware");
const User = require("../models/userModel");

// Upload single image
exports.uploadUserImage = uploadSingleImage("profileImage");

// Image processing
exports.resizeImage = asyncHandler(async (req, res, next) => {
  const filename = `user-${uuidv4()}-${Date.now()}.jpeg`;
  if (req.file) {
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toFile(`uploads/users/${filename}`);

    // Save image into our db
    req.body.image = filename;
  }
  next();
});

// @desc    Get list of users
// @route   GET /api/v1/users
// @access  Private
exports.getUsers = getAll(User);

// @desc    Get specific user by id
// @route   GET /api/v1/users/:id
// @access  Private
exports.getUser = getOne(User);

// @desc    Create user
// @route   POST  /api/v1/users
// @access  Private
exports.createUser = createOne(User);

// @desc    Update specific user
// @route   PUT /api/v1/users/:id
// @access  Private
exports.updateUser = asyncHandler(async (req, res, next) => {
  const document = await User.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      slug: req.body.slug,
      email: req.body.email,
      phone: req.body.phone,
      profileImage: req.body.profileImage,
      role: req.body.role,
      active: req.body.active,
    },
    {
      new: true,
    }
  );

  if (!document)
    return next(
      new ApiError(`No ${User} found with this id ${req.params.id}`, 404)
    );
  res.status(200).json({ data: document });
});

exports.changeUserPassword = asyncHandler(async (req, res, next) => {
  const document = await User.findByIdAndUpdate(
    req.params.id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
    }
  );

  if (!document)
    return next(
      new ApiError(`No ${User} found with this id ${req.params.id}`, 404)
    );
  res.status(200).json({ data: document });
});

// @desc    Delete specific user
// @route   DELETE /api/v1/users/:id
// @access  Private
// exports.deleteUser = inActive(User);
exports.deleteUser = deleteOne(User);

// @desc      get logged users data
// @route     Get /api/v1/users/getMe
// @access    Private/Protect
exports.getLoggedUsersData = asyncHandler(async (req, res, next) => {
  req.params.id = req.user._id;
  next();
});

exports.updateLoggedUserPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    { new: true }
  );
  // Generate user password token
  const token = createToken(user._id);
  res.status(200).json({ data: user, token });
});

exports.updateLoggedUserData = asyncHandler(async (req, res, next) => {
  const { name, email, phone } = req.body;
  const updateUser = await User.findOneAndUpdate(
    req.user_id,
    {
      name,
      email,
      phone,
    },
    { new: true }
  );
  res.status(200).json({ data: updateUser });
});

exports.deleteLoggedUserData = asyncHandler(async (req, res, next) => {
  await User.findOneAndDelete(req.user_id, { active: false });
  res.status(204).json({ status: "success" });
});
