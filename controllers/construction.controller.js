const { validationResult } = require("express-validator");
const constructionService = require("../services/construction.service");
const { successResponse, errorResponse } = require("../utils/response");

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

const validate = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errorResponse(res, 400, "Validation failed.", errors.array());
    return false;
  }
  return true;
};

const toDecimal = (val) => (val !== undefined && val !== "" ? val : undefined);
const toInt = (val) =>
  val !== undefined && val !== "" ? parseInt(val, 10) : undefined;

// POST /api/v1/constructions — Admin
const createConstruction = async (req, res, next) => {
  try {
    if (!validate(req, res)) return;

    const {
      title,
      price,
      bedrooms,
      bathrooms,
      area,
      developer,
      location,
      description,
      expectedRoi,
      areaGrowth,
      atBooking,
      foundationComplete,
      structureComplete,
      ninetyDaysHandover,
      atCompletion,
      paymentNote,
    } = req.body;

    const imageUrls = req.files
      ? req.files.map((f) => `${BASE_URL}/uploads/construction/${f.filename}`)
      : [];

    const construction = await constructionService.createConstruction({
      title,
      price: toDecimal(price),
      bedrooms: toInt(bedrooms),
      bathrooms: toInt(bathrooms),
      area,
      developer,
      location,
      description,
      expectedRoi,
      areaGrowth,
      atBooking,
      foundationComplete,
      structureComplete,
      ninetyDaysHandover,
      atCompletion,
      paymentNote,
      imageUrls,
    });

    return successResponse(res, 201, "Construction created.", construction);
  } catch (error) {
    next(error);
  }
};

// GET /api/v1/constructions — Public
const listConstructions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await constructionService.listConstructions({ page, limit });
    return successResponse(res, 200, "Constructions retrieved.", result);
  } catch (error) {
    next(error);
  }
};

const getConstruction = async (req, res, next) => {
  try {
    const construction = await constructionService.getConstruction(
      req.params.id,
    );
    return successResponse(res, 200, "Construction retrieved.", construction);
  } catch (error) {
    next(error);
  }
};

const updateConstruction = async (req, res, next) => {
  try {
    if (!validate(req, res)) return;

    const {
      title,
      price,
      bedrooms,
      bathrooms,
      area,
      developer,
      location,
      description,
      expectedRoi,
      areaGrowth,
      atBooking,
      foundationComplete,
      structureComplete,
      ninetyDaysHandover,
      atCompletion,
      paymentNote,
    } = req.body;

    const updateData = {
      title,
      area,
      developer,
      location,
      description,
      expectedRoi,
      areaGrowth,
      atBooking,
      foundationComplete,
      structureComplete,
      ninetyDaysHandover,
      atCompletion,
      paymentNote,
      price: toDecimal(price),
      bedrooms: toInt(bedrooms),
      bathrooms: toInt(bathrooms),
    };

    Object.keys(updateData).forEach((k) => {
      if (updateData[k] === undefined) delete updateData[k];
    });

    if (req.files && req.files.length > 0) {
      updateData.imageUrls = req.files.map(
        (f) => `${BASE_URL}/uploads/construction/${f.filename}`,
      );
    }

    const construction = await constructionService.updateConstruction(
      req.params.id,
      updateData,
    );
    return successResponse(res, 200, "Construction updated.", construction);
  } catch (error) {
    next(error);
  }
};

const deleteConstruction = async (req, res, next) => {
  try {
    await constructionService.deleteConstruction(req.params.id);
    return successResponse(res, 200, "Construction deleted.", null);
  } catch (error) {
    next(error);
  }
};

const registerInterest = async (req, res, next) => {
  try {
    if (!validate(req, res)) return;
    const { fullName, email, phoneNumber } = req.body;
    const registration = await constructionService.registerInterest(
      req.params.id,
      { fullName, email, phoneNumber },
    );
    return successResponse(res, 201, "Registration submitted.", registration);
  } catch (error) {
    next(error);
  }
};

// Admin-only: List registrations for a construction
const listRegistrations = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await constructionService.listRegistrations(req.params.id, {
      page,
      limit,
    });
    return successResponse(res, 200, "Registrations retrieved.", result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createConstruction,
  listConstructions,
  getConstruction,
  updateConstruction,
  deleteConstruction,
  registerInterest,
  listRegistrations,
};
