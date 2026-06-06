const express = require("express");
const { body, query } = require("express-validator");
const {
  createProperty,
  listProperties,
  getProperty,
  updateProperty,
  deleteProperty,
  addImages,
  deleteImage,
  getLocationSuggestions,
} = require("../controllers/property.controller");
const {
  authenticate,
  authorizeAdmin,
} = require("../middleware/auth.middleware");
const createUpload = require("../middleware/upload.middleware");
const { errorResponse } = require("../utils/response");

const router = express.Router();

const PROPERTY_TYPES = [
  "SINGLE_FAMILY_HOME",
  "TOWNHOMES",
  "LAND",
  "COMMERCIAL",
];
const LISTING_TYPES = ["WHOLESALE", "REGULAR"];

// For create: accept images (up to 20) + optional single video
const handlePropertyFiles = (req, res, next) => {
  createUpload("property").fields([
    { name: "images", maxCount: 20 },
    { name: "video", maxCount: 1 },
  ])(req, res, (err) => {
    if (err) return errorResponse(res, 400, err.message);
    next();
  });
};

const handleImages =
  (maxCount = 20) =>
  (req, res, next) => {
    createUpload("property").array("images", maxCount)(req, res, (err) => {
      if (err) return errorResponse(res, 400, err.message);
      next();
    });
  };

const createValidators = [
  body("title").trim().notEmpty().withMessage("Title is required."),
  body("propertyType")
    .isIn(PROPERTY_TYPES)
    .withMessage(`propertyType must be one of: ${PROPERTY_TYPES.join(", ")}.`),
  body("area").trim().notEmpty().withMessage("Area is required."),
  body("description").trim().notEmpty().withMessage("Description is required."),
  body("streetAddress")
    .trim()
    .notEmpty()
    .withMessage("Street address is required."),
  body("city").trim().notEmpty().withMessage("City is required."),
  body("state").trim().notEmpty().withMessage("State is required."),
  body("zipCode").trim().notEmpty().withMessage("Zip code is required."),
  body("listingType")
    .isIn(LISTING_TYPES)
    .withMessage(`listingType must be one of: ${LISTING_TYPES.join(", ")}.`),
  body("contactName")
    .trim()
    .notEmpty()
    .withMessage("Contact name is required."),
  body("contactNumber")
    .trim()
    .notEmpty()
    .withMessage("Contact number is required."),
  body("contactEmail")
    .isEmail()
    .withMessage("A valid contact email is required.")
    .normalizeEmail(),
  body("bedrooms")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Bedrooms must be a non-negative integer."),
  body("bathrooms")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Bathrooms must be a non-negative integer."),
  body("askingPrice")
    .optional()
    .isDecimal()
    .withMessage("askingPrice must be a valid decimal number."),
  body("purchasePrice")
    .optional()
    .isDecimal()
    .withMessage("purchasePrice must be a valid decimal number."),
  body("estimatedRenovationCost")
    .optional()
    .isDecimal()
    .withMessage("estimatedRenovationCost must be a valid decimal number."),
  body("arv")
    .optional()
    .isDecimal()
    .withMessage("arv must be a valid decimal number."),
  body("discount")
    .optional()
    .isDecimal()
    .withMessage("discount must be a valid decimal number."),
];

const updateValidators = [
  body("title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Title cannot be empty."),
  body("propertyType")
    .optional()
    .isIn(PROPERTY_TYPES)
    .withMessage(`propertyType must be one of: ${PROPERTY_TYPES.join(", ")}.`),
  body("listingType")
    .optional()
    .isIn(LISTING_TYPES)
    .withMessage(`listingType must be one of: ${LISTING_TYPES.join(", ")}.`),
  body("contactEmail")
    .optional()
    .isEmail()
    .withMessage("A valid contact email is required.")
    .normalizeEmail(),
  body("bedrooms")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Bedrooms must be a non-negative integer."),
  body("bathrooms")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Bathrooms must be a non-negative integer."),
  body("askingPrice")
    .optional()
    .isDecimal()
    .withMessage("askingPrice must be a valid decimal number."),
  body("purchasePrice")
    .optional()
    .isDecimal()
    .withMessage("purchasePrice must be a valid decimal number."),
  body("estimatedRenovationCost")
    .optional()
    .isDecimal()
    .withMessage("estimatedRenovationCost must be a valid decimal number."),
  body("arv")
    .optional()
    .isDecimal()
    .withMessage("arv must be a valid decimal number."),
  body("discount")
    .optional()
    .isDecimal()
    .withMessage("discount must be a valid decimal number."),
];

router.post(
  "/",
  authenticate,
  authorizeAdmin,
  handlePropertyFiles,
  createValidators,
  createProperty,
);

router.get(
  "/",
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("page must be a positive integer."),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("limit must be between 1 and 100."),
    query("propertyType")
      .optional()
      .customSanitizer((v) => (Array.isArray(v) ? v : [v]))
      .custom((arr) => arr.every((t) => PROPERTY_TYPES.includes(t)))
      .withMessage(
        `propertyType must be one of: ${PROPERTY_TYPES.join(", ")}.`,
      ),
    query("listingType")
      .optional()
      .isIn(LISTING_TYPES)
      .withMessage(`listingType must be one of: ${LISTING_TYPES.join(", ")}.`),
    query("city").optional().trim(),
    query("state").optional().trim(),
    query("location").optional().trim(),
    query("priceRange")
      .optional()
      .isIn([
        "UNDER_200K",
        "250K_500K",
        "501K_750K",
        "751K_1M",
        "1M_PLUS",
        "ALL",
      ])
      .withMessage(
        "priceRange must be one of: UNDER_200K, 250K_500K, 501K_750K, 751K_1M, 1M_PLUS, ALL.",
      ),
    query("latitude")
      .optional()
      .isFloat({ min: -90, max: 90 })
      .withMessage("latitude must be between -90 and 90."),
    query("longitude")
      .optional()
      .isFloat({ min: -180, max: 180 })
      .withMessage("longitude must be between -180 and 180."),
    query("radius")
      .optional()
      .isFloat({ min: 0.1, max: 500 })
      .withMessage("radius must be between 0.1 and 500 km."),
  ],
  listProperties,
);

router.get(
  "/suggestions",
  [
    query("q").trim().notEmpty().withMessage("q is required."),
    query("limit").optional().isInt({ min: 1, max: 10 }),
  ],
  getLocationSuggestions,
);

router.get("/:id", getProperty);

router.put(
  "/:id",
  authenticate,
  authorizeAdmin,
  handlePropertyFiles,
  updateValidators,
  updateProperty,
);

router.delete("/:id", authenticate, authorizeAdmin, deleteProperty);

router.post(
  "/:id/images",
  authenticate,
  authorizeAdmin,
  handleImages(20),
  addImages,
);

router.delete(
  "/:id/images/:imageId",
  authenticate,
  authorizeAdmin,
  deleteImage,
);

module.exports = router;
