const express = require("express");
const { body, query } = require("express-validator");
const {
  submitInquiry,
  listInquiries,
  getMyInquiries,
  getInquiry,
  updateStatus,
  deleteInquiry,
} = require("../controllers/inquiry.controller");
const {
  authenticate,
  authorizeAdmin,
} = require("../middleware/auth.middleware");

const router = express.Router();

const STATUSES = ["NEW", "CONTRACTED", "CLOSED"];

router.post(
  "/:propertyId",
  (req, res, next) => {
    
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      return authenticate(req, res, next);
    }
    next();
  },
  [
    body("fullName").trim().notEmpty().withMessage("Full name is required."),
    body("email")
      .isEmail()
      .withMessage("A valid email is required.")
      .normalizeEmail(),
    body("phoneNumber")
      .trim()
      .notEmpty()
      .withMessage("Phone number is required."),
    body("message").trim().notEmpty().withMessage("Message is required."),
  ],
  submitInquiry,
);

router.get("/my", authenticate, getMyInquiries);


router.get(
  "/",
  authenticate,
  authorizeAdmin,
  [
    query("status")
      .optional()
      .isIn(STATUSES)
      .withMessage(`status must be one of: ${STATUSES.join(", ")}.`),
  ],
  listInquiries,
);


router.get("/:id", authenticate, getInquiry);


router.patch(
  "/:id/status",
  authenticate,
  authorizeAdmin,
  [
    body("status")
      .isIn(STATUSES)
      .withMessage(`status must be one of: ${STATUSES.join(", ")}.`),
  ],
  updateStatus,
);


router.delete("/:id", authenticate, authorizeAdmin, deleteInquiry);

module.exports = router;
