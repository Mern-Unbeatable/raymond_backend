const express = require("express");
const { body } = require("express-validator");
const {
  createPortfolio,
  listPortfolios,
  getPortfolio,
  updatePortfolio,
  deletePortfolio,
  addImages,
  deleteImage,
} = require("../controllers/portfolio.controller");
const {
  authenticate,
  authorizeAdmin,
} = require("../middleware/auth.middleware");
const createUpload = require("../middleware/upload.middleware");
const { errorResponse } = require("../utils/response");

const router = express.Router();

// Handle image-only uploads (up to 20 files)
const handleImages = (req, res, next) => {
  createUpload("portfolio").array("images", 20)(req, res, (err) => {
    if (err) return errorResponse(res, 400, err.message);
    next();
  });
};

const PROPERTY_TYPES = [
  "SINGLE_FAMILY_HOME",
  "TOWNHOMES",
  "LAND",
  "COMMERCIAL",
];

const portfolioValidators = [
  body("title").trim().notEmpty().withMessage("Title is required."),
  body("description").trim().notEmpty().withMessage("Description is required."),
  body("projectOverview")
    .trim()
    .notEmpty()
    .withMessage("Project overview is required."),
  body("location").trim().notEmpty().withMessage("Location is required."),
  body("propertyType")
    .trim()
    .notEmpty()
    .withMessage("Property type is required.")
    .isIn(PROPERTY_TYPES)
    .withMessage(`propertyType must be one of: ${PROPERTY_TYPES.join(", ")}.`),
  body("area").trim().notEmpty().withMessage("Area is required."),
  body("duration").trim().notEmpty().withMessage("Duration is required."),
  body("budget").optional().trim(),
  body("roi").optional().trim(),
  body("featuredHighlight")
    .trim()
    .notEmpty()
    .withMessage("Featured highlight is required."),
];

const updateValidators = [
  body("title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Title cannot be empty."),
  body("description")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Description cannot be empty."),
  body("projectOverview")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Project overview cannot be empty."),
  body("location")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Location cannot be empty."),
  body("propertyType")
    .optional()
    .trim()
    .isIn(PROPERTY_TYPES)
    .withMessage(`propertyType must be one of: ${PROPERTY_TYPES.join(", ")}.`),
  body("area")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Area cannot be empty."),
  body("duration")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Duration cannot be empty."),
  body("budget").optional().trim(),
  body("roi").optional().trim(),
  body("featuredHighlight")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Featured highlight cannot be empty."),
];

router.get("/", listPortfolios);

router.get("/:id", getPortfolio);

router.post(
  "/",
  authenticate,
  authorizeAdmin,
  handleImages,
  portfolioValidators,
  createPortfolio,
);

router.put(
  "/:id",
  authenticate,
  authorizeAdmin,
  updateValidators,
  updatePortfolio,
);

router.delete("/:id", authenticate, authorizeAdmin, deletePortfolio);

router.post(
  "/:id/images",
  authenticate,
  authorizeAdmin,
  handleImages,
  addImages,
);

router.delete(
  "/:id/images/:imageId",
  authenticate,
  authorizeAdmin,
  deleteImage,
);

module.exports = router;
