const express = require("express");
const {
  getUserValidator,
  createUserValidator,
  updateUserValidator,
  deleteUserValidator,
  updateLoggedUserValidator,
  changePasswordValidator,
} = require("../utils/validators/userValidator");

const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  changeUserPassword,
  deleteUser,
  uploadUserImage,
  resizeImage,
  getLoggedUsersData,
  updateLoggedUserPassword,
  deleteLoggedUserData,
  updateLoggedUserData,
} = require("../services/userService");

const router = express.Router();

const { protect, allowedTo } = require("../services/authService");

// User should  Be logged in to access these routes
router.use(protect);

router.get("/getMe", getLoggedUsersData, getUser);
router.put("/changeMyPassword", updateLoggedUserPassword);
router.put("/updateMe", updateLoggedUserValidator, updateLoggedUserData);
router.delete("/deleteMe", deleteLoggedUserData);

// all below routes are protected (Admin or Manager)
router.use(allowedTo("admin", "manager"));

router
  .route("/")
  .get(getUsers)
  .post(uploadUserImage, resizeImage, createUserValidator, createUser);
router
  .route("/:id")
  .get(getUserValidator, getUser)
  .put(uploadUserImage, resizeImage, updateUserValidator, updateUser)
  .delete(deleteUserValidator, deleteUser);

router
  .route("/changePassword/:id")
  .put(changePasswordValidator, changeUserPassword);
module.exports = router;
