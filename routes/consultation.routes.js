const express = require("express");
const { body } = require("express-validator");
const {
  submitConsultation,
  listConsultations,
  getConsultation,
  deleteConsultation,
} = require("../controllers/consultation.controller");
const {
  authenticate,
  authorizeAdmin,
} = require("../middleware/auth.middleware");

const router = express.Router();

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
    body("preferredConsultationDate")
      .optional({ nullable: true, checkFalsy: true })
      .isISO8601()
      .withMessage(
        "Preferred consultation date must be a valid ISO 8601 date.",
      ),
    body("preferredTime").optional().trim(),
    body("additionalInformation").optional().trim(),
  ],
  submitConsultation,
);

router.get("/", authenticate, authorizeAdmin, listConsultations);

router.get("/:id", authenticate, authorizeAdmin, getConsultation);

router.delete("/:id", authenticate, authorizeAdmin, deleteConsultation);

module.exports = router;
