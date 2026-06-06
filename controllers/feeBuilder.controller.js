const { validationResult } = require("express-validator");
const feeBuilderService = require("../services/feeBuilder.service");
const { successResponse, errorResponse } = require("../utils/response");

const validate = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errorResponse(res, 400, "Validation failed.", errors.array());
    return false;
  }
  return true;
};

const submitRequest = async (req, res, next) => {
  try {
    if (!validate(req, res)) return;
    const {
      fullName,
      email,
      phone,
      projectType,
      estimatedBudget,
      projectDescription,
    } = req.body;
    const request = await feeBuilderService.createRequest({
      fullName,
      email,
      phone,
      projectType,
      estimatedBudget,
      projectDescription,
    });
    return successResponse(res, 201, "Fee builder request submitted.", request);
  } catch (error) {
    next(error);
  }
};

const listRequests = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await feeBuilderService.listRequests({ page, limit });
    return successResponse(res, 200, "Fee builder requests retrieved.", result);
  } catch (error) {
    next(error);
  }
};

const getRequest = async (req, res, next) => {
  try {
    const request = await feeBuilderService.getRequest(req.params.id);
    return successResponse(res, 200, "Fee builder request retrieved.", request);
  } catch (error) {
    next(error);
  }
};

// Admin-only: Delete a fee builder request

const deleteRequest = async (req, res, next) => {
  try {
    await feeBuilderService.deleteRequest(req.params.id);
    return successResponse(res, 200, "Fee builder request deleted.", null);
  } catch (error) {
    next(error);
  }
};

module.exports = { submitRequest, listRequests, getRequest, deleteRequest };
