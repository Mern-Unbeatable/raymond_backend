const prisma = require("../config/database");

const constructionSelect = {
  id: true,
  title: true,
  price: true,
  bedrooms: true,
  bathrooms: true,
  area: true,
  developer: true,
  location: true,
  description: true,
  expectedRoi: true,
  areaGrowth: true,
  images: true,
  atBooking: true,
  foundationComplete: true,
  structureComplete: true,
  ninetyDaysHandover: true,
  atCompletion: true,
  paymentNote: true,
  createdAt: true,
  updatedAt: true,
};

const createConstruction = async (data) => {
  const { imageUrls, ...rest } = data;
  return prisma.construction.create({
    data: {
      ...rest,
      images: imageUrls || [],
    },
    select: constructionSelect,
  });
};

const listConstructions = async ({ page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;
  const [constructions, total] = await Promise.all([
    prisma.construction.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: constructionSelect,
    }),
    prisma.construction.count(),
  ]);
  return {
    constructions,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

const getConstruction = async (id) => {
  const construction = await prisma.construction.findUnique({
    where: { id },
    select: {
      ...constructionSelect,
      registrations: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phoneNumber: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!construction) {
    const err = new Error("Construction not found.");
    err.status = 404;
    throw err;
  }
  return construction;
};

const updateConstruction = async (id, data) => {
  await getConstruction(id);
  const { imageUrls, ...rest } = data;
  const updateData = { ...rest };
  if (imageUrls !== undefined) updateData.images = imageUrls;
  return prisma.construction.update({
    where: { id },
    data: updateData,
    select: constructionSelect,
  });
};

const deleteConstruction = async (id) => {
  await getConstruction(id);
  await prisma.construction.delete({ where: { id } });
};

const registerInterest = async (
  constructionId,
  { fullName, email, phoneNumber },
) => {
  await getConstruction(constructionId);
  return prisma.constructionRegistration.create({
    data: { constructionId, fullName, email, phoneNumber },
  });
};
// Admin function to list all registrations for a specific construction
const listRegistrations = async (constructionId, { page = 1, limit = 10 }) => {
  await getConstruction(constructionId);
  const skip = (page - 1) * limit;
  const [registrations, total] = await Promise.all([
    prisma.constructionRegistration.findMany({
      where: { constructionId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.constructionRegistration.count({ where: { constructionId } }),
  ]);
  return {
    registrations,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
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
