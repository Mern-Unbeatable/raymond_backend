const { validationResult } = require("express-validator");
const renovationService = require("../services/renovation.service");
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
      phoneNumber,
      email,
      propertyLocation,
      propertyType,
      renovationType,
      budgetRange,
      projectDetails,
    } = req.body;
    const request = await renovationService.createRequest({
      fullName,
      phoneNumber,
      email,
      propertyLocation,
      propertyType,
      renovationType,
      budgetRange,
      projectDetails,
    });
    return successResponse(res, 201, "Renovation request submitted.", request);
  } catch (error) {
    next(error);
  }
};

const listRequests = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await renovationService.listRequests({ page, limit });
    return successResponse(res, 200, "Renovation requests retrieved.", result);
  } catch (error) {
    next(error);
  }
};

const getRequest = async (req, res, next) => {
  try {
    const request = await renovationService.getRequest(req.params.id);
    return successResponse(res, 200, "Renovation request retrieved.", request);
  } catch (error) {
    next(error);
  }
};

const deleteRequest = async (req, res, next) => {
  try {
    await renovationService.deleteRequest(req.params.id);
    return successResponse(res, 200, "Renovation request deleted.", null);
  } catch (error) {
    next(error);
  }
};

module.exports = { submitRequest, listRequests, getRequest, deleteRequest };
