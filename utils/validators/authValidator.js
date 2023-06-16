const slugify = require("slugify");
// const bcrypt = require("bcryptjs");
const { check } = require("express-validator");
const { validateMiddleware } = require("../../middlewares/validatorMiddleware");
const User = require("../../models/userModel");

// const ApiError = require("../apiError");
// current password => the password in the database (that would be old one after this update)
// password => new Password
// confirmPassword => Confirm new Password

const loginValidator = [
  check("email").notEmpty().withMessage("email is required"),
  check("password")
    .notEmpty()
    .withMessage("password is required")
    .isLength({ min: 6 })
    .withMessage("password should be 6 chars min"),
  validateMiddleware,
];

const signupValidator = [
  check("name")
    .notEmpty()
    .withMessage("username is required")

    .isLength({ min: 3 })
    .withMessage("min 3 characters")

    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please enter a valid email")

    // since unique email => go to DB and check if its exists before or not
    .custom(async (val) => {
      await User.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(
            new Error("email should unique, its alreatdy exists")
          );
        }
      });
    }),
  check("password")
    .notEmpty()
    .withMessage("Please enter Passowrd")

    .isLength({ min: 6 })
    .withMessage("Enter Password of at least 6 characters")
    .custom((password, { req }) => {
      if (password != req.body.passwordConfirm)
        throw new Error("Passwords do not match Confirmation");
      return true;
    }),

  check("passwordConfirm")
    .notEmpty()
    .withMessage("Enter Confirmation Password"),

  validateMiddleware,
];
module.exports = {
  signupValidator,
  loginValidator,
};
