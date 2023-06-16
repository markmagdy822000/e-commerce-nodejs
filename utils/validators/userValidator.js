const slugify = require("slugify");
const bcrypt = require("bcryptjs");
const { check } = require("express-validator");
const { validateMiddleware } = require("../../middlewares/validatorMiddleware");
const User = require("../../models/userModel");

const getUserValidator = [
  check("id").isMongoId().withMessage("Invalid user id formate"),
  validateMiddleware,
];

const ApiError = require("../apiError");
// current password => the password in the database (that would be old one after this update)
// password => new Password
// confirmPassword => Confirm new Password
const changePasswordValidator = [
  check("currentPassword")
    .notEmpty()
    .withMessage("currentPassword is required"),
  check("passwordConfirm")
    .notEmpty()
    .withMessage("passwordConfirm is required"),

  check("password")
    .notEmpty()
    .withMessage("old password is required")
    .custom(async (value, { req }) => {
      const user = await User.findById(req.params.id);
      if (!user)
        throw new Error(`there is no user for this id :${req.params.id}`);
      const isCorrectPassword = await bcrypt.compare(
        req.body.currentPassword,
        user.password
      );
      if (!isCorrectPassword) throw new Error(`Incorrect current Password`);

      // check pass with passwordConfirm
      if (value != req.body.passwordConfirm)
        throw new Error(`Confirm Password not equal to Password`);
      return true;
    }),
  validateMiddleware,
];
const createUserValidator = [
  check("name")
    .notEmpty()
    .withMessage("user is required")

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

  check("profileImage").optional(),
  check("role").optional(),
  check("phone")
    .optional()
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage("Enter a Valid phone number for EG and SA"),
  validateMiddleware,
];

const deleteUserValidator = [
  check("id").isMongoId().withMessage("Invalid user id formate"),
  validateMiddleware,
];
// eslint-disable-next-line no-sparse-arrays
const updateUserValidator = [
  check("name")
    .optional()
    .isLength({ min: 3 })
    .withMessage("min 3 characters")
    .isLength({ max: 32 })
    .withMessage("max 32 characters")
    .notEmpty()
    .withMessage("user is required")
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check("id")
    .exists()
    .notEmpty()
    .withMessage("user is required")
    .isMongoId()
    .withMessage("Invalid user id formate"),
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
  check("profileImage").optional(),
  check("role").optional(),
  check("phone")
    .optional()
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage("Enter a Valid phone number for EG and SA"),

  validateMiddleware,
];

const updateLoggedUserValidator = [
  check("name")
    .optional()
    .isLength({ min: 3 })
    .withMessage("min 3 characters")
    .isLength({ max: 32 })
    .withMessage("max 32 characters")
    .notEmpty()
    .withMessage("user is required")
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
  check("phone")
    .optional()
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage("Enter a Valid phone number for EG and SA"),

  validateMiddleware,
];
module.exports = {
  getUserValidator,
  createUserValidator,
  deleteUserValidator,
  updateLoggedUserValidator,
  updateUserValidator,
  changePasswordValidator,
};
