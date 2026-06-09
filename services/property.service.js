const prisma = require("../config/database");
const { geocodeAddress } = require("../utils/geocode");

const propertySelect = {
  id: true,
  title: true,
  propertyType: true,
  bedrooms: true,
  bathrooms: true,
  area: true,
  description: true,
  streetAddress: true,
  city: true,
  state: true,
  zipCode: true,
  video: true,
  listingType: true,
  askingPrice: true,
  purchasePrice: true,
  estimatedRenovationCost: true,
  arv: true,
  discount: true,
  contactName: true,
  contactNumber: true,
  contactEmail: true,
  latitude: true,
  longitude: true,
  createdAt: true,
  updatedAt: true,
  images: {
    select: { id: true, url: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  },
};
// Service functions for property management
const createProperty = async (data) => {
  const { imageUrls, ...rest } = data;
  const fullAddress = [rest.streetAddress, rest.city, rest.state, rest.zipCode]
    .filter(Boolean)
    .join(", ");
  let coords = await geocodeAddress(fullAddress);

  if (!coords) {
    const cityState = [rest.city, rest.state].filter(Boolean).join(", ");
    coords = await geocodeAddress(cityState);
  }

  const property = await prisma.property.create({
    data: {
      ...rest,
      latitude: coords ? coords.latitude : null,
      longitude: coords ? coords.longitude : null,
      images:
        imageUrls && imageUrls.length > 0
          ? { create: imageUrls.map((url) => ({ url })) }
          : undefined,
    },
    select: propertySelect,
  });

  return property;
};
// List properties with pagination, filtering, and geospatial search
const listProperties = async ({
  page = 1,
  limit = 10,
  propertyType,
  listingType,
  city,
  state,
  location,
  minPrice,
  maxPrice,
  latitude,
  longitude,
  radius = 50,
}) => {
  const where = {};
  if (propertyType) {
    where.propertyType = Array.isArray(propertyType)
      ? { in: propertyType }
      : propertyType;
  }
  if (listingType) where.listingType = listingType;
  if (city) where.city = { contains: city, mode: "insensitive" };
  if (state) where.state = { contains: state, mode: "insensitive" };

  // Price filter
  if (minPrice !== undefined || maxPrice !== undefined) {
    const priceRange = {};
    if (minPrice !== undefined) priceRange.gte = minPrice;
    if (maxPrice !== undefined) priceRange.lte = maxPrice;
    where.OR = [{ askingPrice: priceRange }, { purchasePrice: priceRange }];
  }

  if (location) {
    const locationFilter = { contains: location, mode: "insensitive" };
    const locationOr = [
      { streetAddress: locationFilter },
      { city: locationFilter },
      { state: locationFilter },
      { zipCode: locationFilter },
    ];
    // If price OR already set, combine both with AND so neither is overwritten
    if (where.OR) {
      where.AND = [{ OR: where.OR }, { OR: locationOr }];
      delete where.OR;
    } else {
      where.OR = locationOr;
    }
  }

  const skip = (page - 1) * limit;

  if (latitude !== undefined && longitude !== undefined) {
    const toRad = (d) => (d * Math.PI) / 180;
    const EARTH_KM = 6371;

    const allMatching = await prisma.property.findMany({
      where: {
        ...where,
        latitude: { not: null },
        longitude: { not: null },
      },
      select: propertySelect,
      orderBy: { createdAt: "desc" },
    });

    const nearby = allMatching.filter((p) => {
      const dLat = toRad(p.latitude - latitude);
      const dLon = toRad(p.longitude - longitude);
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(latitude)) *
          Math.cos(toRad(p.latitude)) *
          Math.sin(dLon / 2) ** 2;
      const dist = EARTH_KM * 2 * Math.asin(Math.sqrt(a));
      return dist <= radius;
    });

    const total = nearby.length;
    const paginated = nearby.slice(skip, skip + limit);
    return {
      properties: paginated,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      select: propertySelect,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.property.count({ where }),
  ]);

  return {
    properties,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

const getProperty = async (id) => {
  const property = await prisma.property.findUnique({
    where: { id },
    select: propertySelect,
  });

  if (!property) {
    const error = new Error("Property not found.");
    error.status = 404;
    throw error;
  }

  return property;
};

const updateProperty = async (id, data) => {
  await getProperty(id);

  const addressFields = ["streetAddress", "city", "state", "zipCode"];
  if (addressFields.some((f) => data[f] !== undefined)) {
    const current = await prisma.property.findUnique({
      where: { id },
      select: { streetAddress: true, city: true, state: true, zipCode: true },
    });
    const merged = { ...current, ...data };
    const fullAddress = [
      merged.streetAddress,
      merged.city,
      merged.state,
      merged.zipCode,
    ]
      .filter(Boolean)
      .join(", ");
    let coords = await geocodeAddress(fullAddress);
    if (!coords) {
      const cityState = [merged.city, merged.state].filter(Boolean).join(", ");
      coords = await geocodeAddress(cityState);
    }
    if (coords) {
      data.latitude = coords.latitude;
      data.longitude = coords.longitude;
    }
  }

  const property = await prisma.property.update({
    where: { id },
    data,
    select: propertySelect,
  });

  return property;
};

const deleteProperty = async (id) => {
  await getProperty(id);
  await prisma.property.delete({ where: { id } });
};

const addImages = async (propertyId, imageUrls) => {
  await getProperty(propertyId);

  await prisma.propertyImage.createMany({
    data: imageUrls.map((url) => ({ url, propertyId })),
  });

  return prisma.propertyImage.findMany({
    where: { propertyId },
    select: { id: true, url: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });
};

const deleteImage = async (propertyId, imageId) => {
  const image = await prisma.propertyImage.findFirst({
    where: { id: imageId, propertyId },
  });

  if (!image) {
    const error = new Error("Image not found.");
    error.status = 404;
    throw error;
  }

  await prisma.propertyImage.delete({ where: { id: imageId } });
};

module.exports = {
  createProperty,
  listProperties,
  getProperty,
  updateProperty,
  deleteProperty,
  addImages,
  deleteImage,
};
