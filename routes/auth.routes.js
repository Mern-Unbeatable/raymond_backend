const express = require("express");
const { body } = require("express-validator");
const {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  verifyOtp,
  resetPassword,
  logout,
} = require("../controllers/auth.controller");
const { authenticate } = require("../middleware/auth.middleware");
const createUpload = require("../middleware/upload.middleware");
const { errorResponse } = require("../utils/response");

const router = express.Router();

// Helper: wrap multer so errors are returned as JSON
const handleUpload = (field) => (req, res, next) => {
  createUpload("profile").single(field)(req, res, (err) => {
    if (err) return errorResponse(res, 400, err.message);
    next();
  });
};

router.post(
  "/register",
  handleUpload("profileImage"),
  [
    body("name").trim().notEmpty().withMessage("Name is required."),
    body("phoneNumber")
      .trim()
      .notEmpty()
      .withMessage("Phone number is required."),
    body("email")
      .isEmail()
      .withMessage("A valid email is required.")
      .normalizeEmail(),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters."),
    body("address").optional().trim(),
    body("postcode").optional().trim(),
  ],
  register,
);

router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .withMessage("A valid email is required.")
      .normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required."),
  ],
  login,
);

router.post(
  "/forgot-password",
  [
    body("email")
      .isEmail()
      .withMessage("A valid email is required.")
      .normalizeEmail(),
  ],
  forgotPassword,
);

router.post(
  "/verify-otp",
  [
    body("email")
      .isEmail()
      .withMessage("A valid email is required.")
      .normalizeEmail(),
    body("otp")
      .trim()
      .isLength({ min: 5, max: 5 })
      .withMessage("OTP must be 5 digits."),
  ],
  verifyOtp,
);

router.post(
  "/reset-password",
  [
    body("newPassword")
      .isLength({ min: 3 })
      .withMessage("New password must be at least 3 characters."),
    body("confirmedPassword")
      .notEmpty()
      .withMessage("Confirmed password is required."),
  ],
  resetPassword,
);


router.get("/me", authenticate, getProfile);

router.put(
  "/update-profile",
  authenticate,
  handleUpload("profileImage"),
  [
    body("name")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Name cannot be empty."),
    body("phoneNumber")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Phone number cannot be empty."),
    body("address").optional().trim(),
    body("postcode").optional().trim(),
  ],
  updateProfile,
);

router.put(
  "/change-password",
  authenticate,
  [
    body("oldPassword").notEmpty().withMessage("Old password is required."),
    body("newPassword")
      .isLength({ min: 3 })
      .withMessage("New password must be at least 3 characters."),
    body("confirmedPassword")
      .notEmpty()
      .withMessage("Confirmed password is required."),
  ],
  changePassword,
);

router.post("/logout", authenticate, logout);

module.exports = router;
