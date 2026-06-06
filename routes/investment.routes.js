const express = require("express");
const { body } = require("express-validator");
const {
  createInvestment,
  listInvestments,
  getInvestment,
  updateInvestment,
  deleteInvestment,
  submitApplication,
  listApplications,
  getApplication,
  deleteApplication,
} = require("../controllers/investment.controller");
const {
  authenticate,
  authorizeAdmin,
} = require("../middleware/auth.middleware");

const router = express.Router();

router.post(
  "/applications",
  [
    body("fullName").trim().notEmpty().withMessage("Full name is required."),
    body("email")
      .isEmail()
      .withMessage("A valid email address is required.")
      .normalizeEmail(),
    body("phoneNumber")
      .trim()
      .notEmpty()
      .withMessage("Phone number is required."),
    body("investmentInterest").optional().trim(),
    body("message").optional().trim(),
  ],
  submitApplication,
);

router.get("/applications", authenticate, authorizeAdmin, listApplications);

router.get("/applications/:id", authenticate, authorizeAdmin, getApplication);

router.delete(
  "/applications/:id",
  authenticate,
  authorizeAdmin,
  deleteApplication,
);


router.post(
  "/",
  authenticate,
  authorizeAdmin,
  [
    body("title").trim().notEmpty().withMessage("Title is required."),
    body("description")
      .trim()
      .notEmpty()
      .withMessage("Description is required."),
    body("targetRoi").optional().trim(),
    body("timeline").optional().trim(),
    body("minimumInvestment").optional().trim(),
  ],
  createInvestment,
);

router.get("/", listInvestments);

router.get("/:id", getInvestment);

router.put(
  "/:id",
  authenticate,
  authorizeAdmin,
  [
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
    body("targetRoi").optional().trim(),
    body("timeline").optional().trim(),
    body("minimumInvestment").optional().trim(),
  ],
  updateInvestment,
);

router.delete("/:id", authenticate, authorizeAdmin, deleteInvestment);

module.exports = router;
