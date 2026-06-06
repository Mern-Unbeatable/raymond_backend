const express = require("express");
const { body } = require("express-validator");
const {
  submitApplication,
  listApplications,
  getApplication,
  deleteApplication,
} = require("../controllers/mortgage.controller");
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

router.post(
  "/",
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
    body("employmentStatus").optional().trim(),
    body("annualIncome")
      .optional({ nullable: true, checkFalsy: true })
      .isNumeric()
      .withMessage("Annual income must be a number."),
    body("desiredLoanAmount")
      .optional({ nullable: true, checkFalsy: true })
      .isNumeric()
      .withMessage("Desired loan amount must be a number."),
    body("loanType").optional().trim(),
    body("loanTerm")
      .optional({ nullable: true, checkFalsy: true })
      .isInt({ min: 1 })
      .withMessage("Loan term must be a positive integer."),
    body("propertyType")
      .optional({ nullable: true, checkFalsy: true })
      .isIn(PROPERTY_TYPES)
      .withMessage(
        `propertyType must be one of: ${PROPERTY_TYPES.join(", ")}.`,
      ),

    body("mortgagePurchaseAmount")
      .optional({ nullable: true, checkFalsy: true })
      .isNumeric(),
    body("mortgageDownPayment")
      .optional({ nullable: true, checkFalsy: true })
      .isNumeric(),
    body("mortgageInterestRate")
      .optional({ nullable: true, checkFalsy: true })
      .isNumeric(),
    body("mortgageLoanTerm")
      .optional({ nullable: true, checkFalsy: true })
      .isInt({ min: 1 }),
    body("mortgageEstMonthly")
      .optional({ nullable: true, checkFalsy: true })
      .isNumeric(),
    body("mortgagePrincipalInterest")
      .optional({ nullable: true, checkFalsy: true })
      .isNumeric(),
    body("mortgagePropertyTax")
      .optional({ nullable: true, checkFalsy: true })
      .isNumeric(),
    body("mortgageHomeInsurance")
      .optional({ nullable: true, checkFalsy: true })
      .isNumeric(),

    body("refinanceLoanAmount")
      .optional({ nullable: true, checkFalsy: true })
      .isNumeric(),
    body("refinanceHomeValue")
      .optional({ nullable: true, checkFalsy: true })
      .isNumeric(),
    body("refinanceInterestRate")
      .optional({ nullable: true, checkFalsy: true })
      .isNumeric(),
    body("refinanceFico")
      .optional({ nullable: true, checkFalsy: true })
      .isInt({ min: 0, max: 1500 })
      .withMessage("FICO score must be between 0 and 1500."),
    body("refinanceLoanTerm")
      .optional({ nullable: true, checkFalsy: true })
      .isInt({ min: 1 }),
    body("refinanceEstMonthly")
      .optional({ nullable: true, checkFalsy: true })
      .isNumeric(),
    body("refinancePrincipalInterest")
      .optional({ nullable: true, checkFalsy: true })
      .isNumeric(),
    body("refinancePropertyTax")
      .optional({ nullable: true, checkFalsy: true })
      .isNumeric(),
    body("refinanceHomeInsurance")
      .optional({ nullable: true, checkFalsy: true })
      .isNumeric(),
    body("refinanceHoa")
      .optional({ nullable: true, checkFalsy: true })
      .isNumeric(),

    body("message").optional().trim(),
  ],
  submitApplication,
);

router.get("/", authenticate, authorizeAdmin, listApplications);

router.get("/:id", authenticate, authorizeAdmin, getApplication);

router.delete("/:id", authenticate, authorizeAdmin, deleteApplication);

module.exports = router;
