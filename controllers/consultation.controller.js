const { validationResult } = require("express-validator");
const consultationService = require("../services/consultation.service");
const { successResponse, errorResponse } = require("../utils/response");

const validate = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errorResponse(res, 400, "Validation failed.", errors.array());
    return false;
  }
  return true;
};

const submitConsultation = async (req, res, next) => {
  try {
    if (!validate(req, res)) return;
    const {
      fullName,
      email,
      phoneNumber,
      preferredConsultationDate,
      preferredTime,
      additionalInformation,
    } = req.body;

    const consultation = await consultationService.createConsultation({
      fullName,
      email,
      phoneNumber,
      preferredConsultationDate,
      preferredTime,
      additionalInformation,
    });

    return successResponse(
      res,
      201,
      "Consultation request submitted successfully.",
      consultation,
    );
  } catch (err) {
    next(err);
  }
};

const listConsultations = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await consultationService.listConsultations({ page, limit });
    return successResponse(
      res,
      200,
      "Consultations fetched successfully.",
      result,
    );
  } catch (err) {
    next(err);
  }
};

const getConsultation = async (req, res, next) => {
  try {
    const consultation = await consultationService.getConsultation(
      req.params.id,
    );
    return successResponse(
      res,
      200,
      "Consultation fetched successfully.",
      consultation,
    );
  } catch (err) {
    next(err);
  }
};

const deleteConsultation = async (req, res, next) => {
  try {
    await consultationService.deleteConsultation(req.params.id);
    return successResponse(
      res,
      200,
      "Consultation deleted successfully.",
      null,
    );
  } catch (err) {
    next(err);
  }
};

module.exports = {
  submitConsultation,
  listConsultations,
  getConsultation,
  deleteConsultation,
};
