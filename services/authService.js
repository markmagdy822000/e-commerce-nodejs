const crypto = require("crypto");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const ApiError = require("../utils/apiError");
const sendEmail = require("../utils/sendEmail");
const User = require("../models/userModel");

const createToken = (payload) =>
  jwt.sign({ userId: payload }, process.env.JWT_SECRETE_KEY, {
    expiresIn: process.env.JWT_EXPIRE_TIME,
  });

// @desc Signup
// @route POST /api/v1/auth/signup
// @access Public
const signup = asyncHandler(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });
  // JWT_SECRETE_KEYzzz
  // JWT_EXPIRE_TIME
  const token = createToken(user._id);

  res.status(201).json({ data: user, token });
});

// @desc login
// @route POST /api/v1/auth/login
// @access Public
const login = asyncHandler(async (req, res, next) => {
  // 1- From req => check if email and pass exists (validation layer)
  // DONE
  // 2- From DB => check if email exist and pass is correct,
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  // const isCorrect = await bcrypt.compare(password, user.password);
  // if (!isCorrect) res.status(404).json(`wrong password`);
  const isCorrect = await bcrypt.compare(password, user.password);
  if (!isCorrect) return next(new ApiError(`Invalid email or password`));
  // 3- genertae token
  const token = createToken(user._id);

  // 4- send response to client side
  res.status(200).json({ data: user, token });
});

const protect = asyncHandler(async (req, res, next) => {
  // 1- check if token exists, then get it

  const { authorization } = req.headers;
  let token;
  if (authorization && authorization.startsWith("Bearer")) {
    token = authorization.split(" ")[1];
  }

  if (!token)
    return next(
      new ApiError(
        `you aren't login, Please login to get access to this page`,
        401
      )
    );
  // 2- verify token (check if correct and not valid (no change happen))
  const decoded = jwt.verify(token, process.env.JWT_SECRETE_KEY);

  // 3- check if user exists

  const currentUser = await User.findById(decoded.userId);
  console.log("currentUser", currentUser);
  if (!currentUser) return next(new ApiError(`user is no longer exists`, 401));

  // 4- check if user doesn't change password after token is created

  if (currentUser.passwordChangedAt) {
    const passChangedTimestamp = parseInt(
      currentUser.passwordChangedAt.getTime() / 1000,
      10
    );

    if (passChangedTimestamp > decoded.iat)
      return next(new ApiError(`password changed please login again`, 401));
  }

  req.user = currentUser;
  next();
});

const allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(
        new ApiError(`you are not authorized to access this route`, 403)
      );

    next();
  });

const forgotPassword = asyncHandler(async (req, res, next) => {
  // get user by email
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return next(
      new ApiError(`no user exists with email ${req.body.email}`, 404)
    );

  // create 6 digit code

  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

  const hashedResetcode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");

  user.passwordResetCode = hashedResetcode;
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000; //expires after 10 minutes
  user.passwordResetVerified = false;

  await user.save();
  const message = `Hi ${user.name},\nWe received a request to reset the password of your E-shop account. \n ${resetCode}`;
  try {
    await sendEmail({
      email: user.email,
      subject: `Your Password reset code (valid for 10 minutes)`,
      message,
    });
    // send to user and store in DB
  } catch (error) {
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerified = undefined;
    await user.save();

    return next(new ApiError(`There is an error in sending email`, 500));
  }
  res
    .status(200)
    .json({ status: "success", message: "Reset code sent to email" });
});

const verifyPassResetCode = asyncHandler(async (req, res, next) => {
  const hashedResetcode = crypto
    .createHash("sha256")
    .update(req.body.resetCode)
    .digest("hex");
  const user = await User.findOne({
    passwordResetCode: hashedResetcode,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new ApiError(`Invalid reset code`));
  }
  user.passwordResetVerified = true;
  await user.save();
  res.status(200).json({ status: "success" });
});

const resetPassword = asyncHandler(async (req, res, next) => {
  // 1- get user based on email
  const { email, newPassword } = req.body;
  const user = await User.findOne({ email });
  if (!user) return next(new ApiError(`no user found${email}`, 404));

  // 2- check if reset code verified
  if (!user.passwordResetVerified)
    return next(new ApiError(`reset code is not verified`), 400);

  user.password = newPassword;
  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;
  user.passwordResetVerified = undefined;
  await user.save();
  const token = createToken(user._id);

  res.status(200).json({ token });
});

module.exports = {
  signup,
  login,
  protect,
  allowedTo,
  forgotPassword,
  verifyPassResetCode,
  resetPassword,
};
