const express = require("express");
const { body } = require("express-validator");
const {
  createConstruction,
  listConstructions,
  getConstruction,
  updateConstruction,
  deleteConstruction,
  registerInterest,
  listRegistrations,
} = require("../controllers/construction.controller");
const {
  authenticate,
  authorizeAdmin,
} = require("../middleware/auth.middleware");
const createUpload = require("../middleware/upload.middleware");
const { errorResponse } = require("../utils/response");

const router = express.Router();

const handleImages = (req, res, next) => {
  createUpload("construction").array("images", 20)(req, res, (err) => {
    if (err) return errorResponse(res, 400, err.message);
    next();
  });
};

const constructionValidators = [
  body("title").trim().notEmpty().withMessage("Title is required."),
  body("price")
    .optional()
    .isDecimal()
    .withMessage("price must be a valid decimal."),
  body("bedrooms")
    .optional()
    .isInt({ min: 0 })
    .withMessage("bedrooms must be a non-negative integer."),
  body("bathrooms")
    .optional()
    .isInt({ min: 0 })
    .withMessage("bathrooms must be a non-negative integer."),
  body("area").optional().trim(),
  body("developer").optional().trim(),
  body("location").optional().trim(),
  body("description").optional().trim(),
  body("expectedRoi").optional().trim(),
  body("areaGrowth").optional().trim(),
  body("atBooking").optional().trim(),
  body("foundationComplete").optional().trim(),
  body("structureComplete").optional().trim(),
  body("ninetyDaysHandover").optional().trim(),
  body("atCompletion").optional().trim(),
  body("paymentNote").optional().trim(),
];

const registerValidators = [
  body("fullName").trim().notEmpty().withMessage("Full name is required."),
  body("email")
    .isEmail()
    .withMessage("A valid email is required.")
    .normalizeEmail(),
  body("phoneNumber")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required."),
];


router.post(
  "/",
  authenticate,
  authorizeAdmin,
  handleImages,
  constructionValidators,
  createConstruction,
);

router.get("/", listConstructions);

router.get("/:id", getConstruction);

router.put(
  "/:id",
  authenticate,
  authorizeAdmin,
  handleImages,
  constructionValidators,
  updateConstruction,
);

router.delete("/:id", authenticate, authorizeAdmin, deleteConstruction);

router.post("/:id/register", registerValidators, registerInterest);

router.get(
  "/:id/registrations",
  authenticate,
  authorizeAdmin,
  listRegistrations,
);

module.exports = router;
