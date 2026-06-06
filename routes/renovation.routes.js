const express = require("express");
const { body } = require("express-validator");
const {
  submitRequest,
  listRequests,
  getRequest,
  deleteRequest,
} = require("../controllers/renovation.controller");
const {
  authenticate,
  authorizeAdmin,
} = require("../middleware/auth.middleware");

const router = express.Router();

const PROPERTY_TYPES = [
  "SINGLE_FAMILY_HOME",
  "TOWNHOMES",
  "LAND",
  "COMMERCIAL",
];

const RENOVATION_TYPES = [
  "KITCHEN_RENOVATION",
  "BATHROOM_REMODELING",
  "FULL_HOME_MAKEOVER",
  "OFFICE_RENOVATION",
];

router.post(
  "/",
  [
    body("fullName").trim().notEmpty().withMessage("Full name is required."),
    body("email")
      .isEmail()
      .withMessage("A valid email is required.")
      .normalizeEmail(),
    body("phoneNumber").optional().trim(),
    body("propertyLocation").optional().trim(),
    body("propertyType")
      .optional()
      .isIn(PROPERTY_TYPES)
      .withMessage(
        `propertyType must be one of: ${PROPERTY_TYPES.join(", ")}.`,
      ),
    body("renovationType")
      .optional()
      .isIn(RENOVATION_TYPES)
      .withMessage(
        `renovationType must be one of: ${RENOVATION_TYPES.join(", ")}.`,
      ),
    body("budgetRange").optional().trim(),
    body("projectDetails").optional().trim(),
  ],
  submitRequest,
);

router.get("/", authenticate, authorizeAdmin, listRequests);

router.get("/:id", authenticate, authorizeAdmin, getRequest);

router.delete("/:id", authenticate, authorizeAdmin, deleteRequest);

module.exports = router;
