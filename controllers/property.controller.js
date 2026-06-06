const { validationResult } = require("express-validator");
const propertyService = require("../services/property.service");
const { getAddressSuggestions } = require("../utils/geocode");
const { successResponse, errorResponse } = require("../utils/response");

const validate = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errorResponse(res, 400, "Validation failed.", errors.array());
    return false;
  }
  return true;
};

const fileUrl = (filename) => {
  const base =
    process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
  return `${base}/uploads/property/${filename}`;
};

const toDecimal = (val) => (val !== undefined && val !== "" ? val : undefined);

const toInt = (val) =>
  val !== undefined && val !== "" ? parseInt(val, 10) : undefined;

const createProperty = async (req, res, next) => {
  try {
    if (!validate(req, res)) return;

    const {
      title,
      propertyType,
      bedrooms,
      bathrooms,
      area,
      description,
      streetAddress,
      city,
      state,
      zipCode,
      video,
      listingType,
      askingPrice,
      purchasePrice,
      estimatedRenovationCost,
      arv,
      discount,
      contactName,
      contactNumber,
      contactEmail,
    } = req.body;

    const uploadedImages =
      req.files && req.files.images ? req.files.images : [];
    const uploadedVideo =
      req.files && req.files.video ? req.files.video[0] : null;
    const imageUrls = uploadedImages.map((f) => fileUrl(f.filename));
    const videoUrl = uploadedVideo
      ? fileUrl(uploadedVideo.filename)
      : video || null;

    const property = await propertyService.createProperty({
      title,
      propertyType,
      bedrooms: toInt(bedrooms),
      bathrooms: toInt(bathrooms),
      area,
      description,
      streetAddress,
      city,
      state,
      zipCode,
      video: videoUrl,
      listingType,
      askingPrice: toDecimal(askingPrice),
      purchasePrice: toDecimal(purchasePrice),
      estimatedRenovationCost: toDecimal(estimatedRenovationCost),
      arv: toDecimal(arv),
      discount: toDecimal(discount),
      contactName,
      contactNumber,
      contactEmail,
      imageUrls,
    });

    return successResponse(
      res,
      201,
      "Property created successfully.",
      property,
    );
  } catch (error) {
    next(error);
  }
};

const PRICE_RANGE_MAP = {
  UNDER_200K: { max: 200000 },
  "250K_500K": { min: 250000, max: 500000 },
  "501K_750K": { min: 501000, max: 750000 },
  "751K_1M": { min: 751000, max: 1000000 },
  "1M_PLUS": { min: 1000001 },
  ALL: {},
};

const listProperties = async (req, res, next) => {
  try {
    const {
      page = "1",
      limit = "10",
      propertyType,
      listingType,
      city,
      state,
      location,
      priceRange,
      latitude,
      longitude,
      radius,
    } = req.query;

    const priceFilter = priceRange ? PRICE_RANGE_MAP[priceRange] || {} : {};
    const lat = latitude !== undefined ? parseFloat(latitude) : undefined;
    const lng = longitude !== undefined ? parseFloat(longitude) : undefined;
    const rad = radius !== undefined ? parseFloat(radius) : 50;

    const result = await propertyService.listProperties({
      page: Math.max(1, parseInt(page, 10) || 1),
      limit: Math.min(100, Math.max(1, parseInt(limit, 10) || 10)),
      propertyType,
      listingType,
      city,
      state,
      location,
      minPrice: priceFilter.min,
      maxPrice: priceFilter.max,
      latitude: lat !== undefined && !isNaN(lat) ? lat : undefined,
      longitude: lng !== undefined && !isNaN(lng) ? lng : undefined,
      radius: !isNaN(rad) ? rad : 50,
    });

    return successResponse(res, 200, "Properties retrieved.", result);
  } catch (error) {
    next(error);
  }
};

const getProperty = async (req, res, next) => {
  try {
    const property = await propertyService.getProperty(req.params.id);
    return successResponse(res, 200, "Property retrieved.", property);
  } catch (error) {
    next(error);
  }
};

const updateProperty = async (req, res, next) => {
  try {
    if (!validate(req, res)) return;

    const {
      title,
      propertyType,
      bedrooms,
      bathrooms,
      area,
      description,
      streetAddress,
      city,
      state,
      zipCode,
      video,
      listingType,
      askingPrice,
      purchasePrice,
      estimatedRenovationCost,
      arv,
      discount,
      contactName,
      contactNumber,
      contactEmail,
    } = req.body;

    // Build update payload — only include fields that were actually sent
    const data = {};
    if (title !== undefined) data.title = title;
    if (propertyType !== undefined) data.propertyType = propertyType;
    if (bedrooms !== undefined) data.bedrooms = toInt(bedrooms);
    if (bathrooms !== undefined) data.bathrooms = toInt(bathrooms);
    if (area !== undefined) data.area = area;
    if (description !== undefined) data.description = description;
    if (streetAddress !== undefined) data.streetAddress = streetAddress;
    if (city !== undefined) data.city = city;
    if (state !== undefined) data.state = state;
    if (zipCode !== undefined) data.zipCode = zipCode;
    if (listingType !== undefined) data.listingType = listingType;
    if (askingPrice !== undefined) data.askingPrice = toDecimal(askingPrice);
    if (purchasePrice !== undefined)
      data.purchasePrice = toDecimal(purchasePrice);
    if (estimatedRenovationCost !== undefined)
      data.estimatedRenovationCost = toDecimal(estimatedRenovationCost);
    if (arv !== undefined) data.arv = toDecimal(arv);
    if (discount !== undefined) data.discount = toDecimal(discount);
    if (contactName !== undefined) data.contactName = contactName;
    if (contactNumber !== undefined) data.contactNumber = contactNumber;
    if (contactEmail !== undefined) data.contactEmail = contactEmail;

    // If a new video file was uploaded, replace the video URL
    if (req.files?.video?.[0]) {
      data.video = fileUrl(req.files.video[0].filename);
    } else if (video !== undefined) {
      data.video = video || null;
    }

    const property = await propertyService.updateProperty(req.params.id, data);

    // If new images were uploaded, append them (do NOT replace existing)
    if (req.files?.images?.length) {
      const imageUrls = req.files.images.map((f) => fileUrl(f.filename));
      await propertyService.addImages(req.params.id, imageUrls);
    }

    const updated = await propertyService.getProperty(req.params.id);
    return successResponse(res, 200, "Property updated.", updated);
  } catch (error) {
    next(error);
  }
};

const deleteProperty = async (req, res, next) => {
  try {
    await propertyService.deleteProperty(req.params.id);
    return successResponse(res, 200, "Property deleted.", null);
  } catch (error) {
    next(error);
  }
};

const addImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return errorResponse(res, 400, "At least one image is required.");
    }

    const imageUrls = req.files.map((f) => fileUrl(f.filename));
    const images = await propertyService.addImages(req.params.id, imageUrls);

    return successResponse(res, 201, "Images added.", images);
  } catch (error) {
    next(error);
  }
};

const deleteImage = async (req, res, next) => {
  try {
    await propertyService.deleteImage(req.params.id, req.params.imageId);
    return successResponse(res, 200, "Image deleted.", null);
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/properties/suggestions ─────────────────────────────────────

const getLocationSuggestions = async (req, res, next) => {
  try {
    const { q, limit } = req.query;
    if (!q || q.trim().length < 2) {
      return successResponse(res, 200, "Suggestions retrieved.", []);
    }
    const suggestions = await getAddressSuggestions(
      q.trim(),
      parseInt(limit, 10) || 8,
    );
    return successResponse(res, 200, "Suggestions retrieved.", suggestions);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProperty,
  listProperties,
  getProperty,
  updateProperty,
  deleteProperty,
  addImages,
  deleteImage,
  getLocationSuggestions,
};
