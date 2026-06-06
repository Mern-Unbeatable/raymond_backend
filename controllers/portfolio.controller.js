const { validationResult } = require("express-validator");
const portfolioService = require("../services/portfolio.service");
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

const createPortfolio = async (req, res, next) => {
  try {
    if (!validate(req, res)) return;

    const {
      title,
      description,
      projectOverview,
      location,
      propertyType,
      area,
      duration,
      budget,
      roi,
      featuredHighlight,
    } = req.body;

    const imageUrls = req.files
      ? req.files.map((f) => `${BASE_URL}/uploads/portfolio/${f.filename}`)
      : [];

    const portfolio = await portfolioService.createPortfolio({
      title,
      description,
      projectOverview,
      location,
      propertyType,
      area,
      duration,
      budget,
      roi,
      featuredHighlight,
      imageUrls,
    });

    return successResponse(res, 201, "Portfolio created.", portfolio);
  } catch (error) {
    next(error);
  }
};

const listPortfolios = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const result = await portfolioService.listPortfolios({ page, limit });
    return successResponse(res, 200, "Portfolios retrieved.", result);
  } catch (error) {
    next(error);
  }
};

const getPortfolio = async (req, res, next) => {
  try {
    const portfolio = await portfolioService.getPortfolio(req.params.id);
    return successResponse(res, 200, "Portfolio retrieved.", portfolio);
  } catch (error) {
    next(error);
  }
};

const updatePortfolio = async (req, res, next) => {
  try {
    if (!validate(req, res)) return;

    const {
      title,
      description,
      projectOverview,
      location,
      propertyType,
      area,
      duration,
      budget,
      roi,
      featuredHighlight,
    } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (projectOverview !== undefined)
      updateData.projectOverview = projectOverview;
    if (location !== undefined) updateData.location = location;
    if (propertyType !== undefined) updateData.propertyType = propertyType;
    if (area !== undefined) updateData.area = area;
    if (duration !== undefined) updateData.duration = duration;
    if (budget !== undefined) updateData.budget = budget;
    if (roi !== undefined) updateData.roi = roi;
    if (featuredHighlight !== undefined)
      updateData.featuredHighlight = featuredHighlight;

    const portfolio = await portfolioService.updatePortfolio(
      req.params.id,
      updateData,
    );

    return successResponse(res, 200, "Portfolio updated.", portfolio);
  } catch (error) {
    next(error);
  }
};

const deletePortfolio = async (req, res, next) => {
  try {
    await portfolioService.deletePortfolio(req.params.id);
    return successResponse(res, 200, "Portfolio deleted.", null);
  } catch (error) {
    next(error);
  }
};

const addImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return errorResponse(res, 400, "No images uploaded.");
    }

    const imageUrls = req.files.map(
      (f) => `${BASE_URL}/uploads/portfolio/${f.filename}`,
    );
    const portfolio = await portfolioService.addImages(
      req.params.id,
      imageUrls,
    );
    return successResponse(res, 200, "Images added to portfolio.", portfolio);
  } catch (error) {
    next(error);
  }
};

const deleteImage = async (req, res, next) => {
  try {
    await portfolioService.deleteImage(req.params.id, req.params.imageId);
    return successResponse(res, 200, "Image deleted.", null);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPortfolio,
  listPortfolios,
  getPortfolio,
  updatePortfolio,
  deletePortfolio,
  addImages,
  deleteImage,
};
