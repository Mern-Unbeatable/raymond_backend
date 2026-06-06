const prisma = require("../config/database");

const createRequest = async ({
  fullName,
  phoneNumber,
  email,
  propertyLocation,
  propertyType,
  renovationType,
  budgetRange,
  projectDetails,
}) => {
  return prisma.renovationRequest.create({
    data: {
      fullName,
      phoneNumber,
      email,
      propertyLocation,
      propertyType: propertyType || null,
      renovationType: renovationType || null,
      budgetRange,
      projectDetails,
    },
  });
};

const listRequests = async ({ page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;
  const [requests, total] = await Promise.all([
    prisma.renovationRequest.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.renovationRequest.count(),
  ]);
  return {
    requests,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

const getRequest = async (id) => {
  const request = await prisma.renovationRequest.findUnique({ where: { id } });
  if (!request) {
    const err = new Error("Renovation request not found.");
    err.status = 404;
    throw err;
  }
  return request;
};

const deleteRequest = async (id) => {
  await getRequest(id);
  await prisma.renovationRequest.delete({ where: { id } });
};

module.exports = { createRequest, listRequests, getRequest, deleteRequest };
