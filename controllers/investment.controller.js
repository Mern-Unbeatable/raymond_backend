const { validationResult } = require("express-validator");
const investmentService = require("../services/investment.service");
const { successResponse, errorResponse } = require("../utils/response");

const validate = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errorResponse(res, 400, "Validation failed.", errors.array());
    return false;
  }
  return true;
};


const createInvestment = async (req, res, next) => {
  try {
    if (!validate(req, res)) return;
    const { title, description, targetRoi, timeline, minimumInvestment } =
      req.body;
    const investment = await investmentService.createInvestment({
      title,
      description,
      targetRoi,
      timeline,
      minimumInvestment,
    });
    return successResponse(
      res,
      201,
      "Investment created successfully.",
      investment,
    );
  } catch (err) {
    next(err);
  }
};

const listInvestments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await investmentService.listInvestments({ page, limit });
    return successResponse(
      res,
      200,
      "Investments fetched successfully.",
      result,
    );
  } catch (err) {
    next(err);
  }
};

const getInvestment = async (req, res, next) => {
  try {
    const investment = await investmentService.getInvestment(req.params.id);
    return successResponse(
      res,
      200,
      "Investment fetched successfully.",
      investment,
    );
  } catch (err) {
    next(err);
  }
};

const updateInvestment = async (req, res, next) => {
  try {
    if (!validate(req, res)) return;
    const { title, description, targetRoi, timeline, minimumInvestment } =
      req.body;
    const investment = await investmentService.updateInvestment(req.params.id, {
      title,
      description,
      targetRoi,
      timeline,
      minimumInvestment,
    });
    return successResponse(
      res,
      200,
      "Investment updated successfully.",
      investment,
    );
  } catch (err) {
    next(err);
  }
};

const deleteInvestment = async (req, res, next) => {
  try {
    await investmentService.deleteInvestment(req.params.id);
    return successResponse(res, 200, "Investment deleted successfully.", null);
  } catch (err) {
    next(err);
  }
};


const submitApplication = async (req, res, next) => {
  try {
    if (!validate(req, res)) return;
    const { fullName, email, phoneNumber, investmentInterest, message } =
      req.body;
    const application = await investmentService.createApplication({
      fullName,
      email,
      phoneNumber,
      investmentInterest,
      message,
    });
    return successResponse(
      res,
      201,
      "Investment application submitted successfully.",
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
    const result = await investmentService.listApplications({ page, limit });
    return successResponse(
      res,
      200,
      "Investment applications fetched successfully.",
      result,
    );
  } catch (err) {
    next(err);
  }
};

const getApplication = async (req, res, next) => {
  try {
    const application = await investmentService.getApplication(req.params.id);
    return successResponse(
      res,
      200,
      "Investment application fetched successfully.",
      application,
    );
  } catch (err) {
    next(err);
  }
};

const deleteApplication = async (req, res, next) => {
  try {
    await investmentService.deleteApplication(req.params.id);
    return successResponse(
      res,
      200,
      "Investment application deleted successfully.",
      null,
    );
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createInvestment,
  listInvestments,
  getInvestment,
  updateInvestment,
  deleteInvestment,
  submitApplication,
  listApplications,
  getApplication,
  deleteApplication,
};
