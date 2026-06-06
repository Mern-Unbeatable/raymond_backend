const { validationResult } = require("express-validator");
const mortgageService = require("../services/mortgage.service");
const { successResponse, errorResponse } = require("../utils/response");

const validate = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errorResponse(res, 400, "Validation failed.", errors.array());
    return false;
  }
  return true;
};

const submitApplication = async (req, res, next) => {
  try {
    if (!validate(req, res)) return;
    const application = await mortgageService.createApplication(req.body);
    return successResponse(
      res,
      201,
      "Mortgage application submitted successfully.",
      application,
    );
  } catch (err) {
    next(err);
  }
};

const listApplications = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await mortgageService.listApplications({ page, limit });
    return successResponse(
      res,
      200,
      "Mortgage applications fetched successfully.",
      result,
    );
  } catch (err) {
    next(err);
  }
};

const getApplication = async (req, res, next) => {
  try {
    const application = await mortgageService.getApplication(req.params.id);
    return successResponse(
      res,
      200,
      "Mortgage application fetched successfully.",
      application,
    );
  } catch (err) {
    next(err);
  }
};

const deleteApplication = async (req, res, next) => {
  try {
    await mortgageService.deleteApplication(req.params.id);
    return successResponse(
      res,
      200,
      "Mortgage application deleted successfully.",
      null,
    );
  } catch (err) {
    next(err);
  }
};

module.exports = {
  submitApplication,
  listApplications,
  getApplication,
  deleteApplication,
};
