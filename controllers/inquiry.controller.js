const { validationResult } = require("express-validator");
const inquiryService = require("../services/inquiry.service");
const { successResponse, errorResponse } = require("../utils/response");

const validate = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errorResponse(res, 400, "Validation failed.", errors.array());
    return false;
  }
  return true;
};


const submitInquiry = async (req, res, next) => {
  try {
    if (!validate(req, res)) return;

    const { propertyId } = req.params;
    const { fullName, email, phoneNumber, message } = req.body;

    const userId = req.user ? req.user.id : null;

    const inquiry = await inquiryService.submitInquiry({
      propertyId,
      fullName,
      email,
      phoneNumber,
      message,
      userId,
    });

    return successResponse(
      res,
      201,
      "Inquiry submitted successfully.",
      inquiry,
    );
  } catch (error) {
    next(error);
  }
};


const listInquiries = async (req, res, next) => {
  try {
    const { status, propertyId } = req.query;
    const inquiries = await inquiryService.listInquiries({
      status,
      propertyId,
    });
    return successResponse(res, 200, "Inquiries retrieved.", inquiries);
  } catch (error) {
    next(error);
  }
};


const getMyInquiries = async (req, res, next) => {
  try {
    const inquiries = await inquiryService.getMyInquiries(req.user.id);
    return successResponse(res, 200, "Your inquiries retrieved.", inquiries);
  } catch (error) {
    next(error);
  }
};


const getInquiry = async (req, res, next) => {
  try {
    const inquiry = await inquiryService.getInquiry(
      req.params.id,
      req.user.id,
      req.user.role,
    );
    return successResponse(res, 200, "Inquiry retrieved.", inquiry);
  } catch (error) {
    next(error);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    if (!validate(req, res)) return;
    const inquiry = await inquiryService.updateStatus(
      req.params.id,
      req.body.status,
    );
    return successResponse(res, 200, "Inquiry status updated.", inquiry);
  } catch (error) {
    next(error);
  }
};

const deleteInquiry = async (req, res, next) => {
  try {
    await inquiryService.deleteInquiry(req.params.id);
    return successResponse(res, 200, "Inquiry deleted.", null);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitInquiry,
  listInquiries,
  getMyInquiries,
  getInquiry,
  updateStatus,
  deleteInquiry,
};
