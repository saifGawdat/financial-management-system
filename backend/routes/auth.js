const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const authController = require("../controllers/authController");
const auth = require("../middleware/auth");

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Please enter a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  authController.register
);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please enter a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  authController.login
);

// @route   POST /api/auth/google
// @desc    Google Login
// @access  Public
router.post("/google", authController.googleLogin);
// @route   DELETE /api/auth/delete-account
// @desc    Delete user account
// @access  Private
router.delete("/delete-account", auth, authController.deleteAccount);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get("/me", auth, authController.getMe);

module.exports = router;
