const express = require("express");
const { body } = require("express-validator");
const {
  submitRequest,
  listRequests,
  getRequest,
  deleteRequest,
} = require("../controllers/feeBuilder.controller");
const {
  authenticate,
  authorizeAdmin,
} = require("../middleware/auth.middleware");

const router = express.Router();

const FEE_BUILDER_PROJECT_TYPES = [
  "ARCHITECTURAL_PLANNING",
  "CUSTOM_HOME_BUILD",
  "DESIGN_BUILD_MANAGEMENT",
  "TURNKEY_FINISH",
];

router.post(
  "/",
  [
    body("fullName").trim().notEmpty().withMessage("Full name is required."),
    body("email")
      .isEmail()
      .withMessage("A valid email is required.")
      .normalizeEmail(),
    body("phone").optional().trim(),
    body("projectType")
      .isIn(FEE_BUILDER_PROJECT_TYPES)
      .withMessage(
        `projectType must be one of: ${FEE_BUILDER_PROJECT_TYPES.join(", ")}.`,
      ),
    body("estimatedBudget").optional().trim(),
    body("projectDescription").optional().trim(),
  ],
  submitRequest,
);

router.get("/", authenticate, authorizeAdmin, listRequests);

router.get("/:id", authenticate, authorizeAdmin, getRequest);

router.delete("/:id", authenticate, authorizeAdmin, deleteRequest);

module.exports = router;
