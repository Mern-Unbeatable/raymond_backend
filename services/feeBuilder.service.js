const prisma = require("../config/database");

const createRequest = async ({
  fullName,
  email,
  phone,
  projectType,
  estimatedBudget,
  projectDescription,
}) => {
  return prisma.feeBuilderRequest.create({
    data: {
      fullName,
      email,
      phone,
      projectType,
      estimatedBudget,
      projectDescription,
    },
  });
};
// Admin function to list all fee builder requests with pagination
const listRequests = async ({ page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;
  const [requests, total] = await Promise.all([
    prisma.feeBuilderRequest.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.feeBuilderRequest.count(),
  ]);
  return {
    requests,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

const getRequest = async (id) => {
  const request = await prisma.feeBuilderRequest.findUnique({ where: { id } });
  if (!request) {
    const err = new Error("Fee builder request not found.");
    err.status = 404;
    throw err;
  }
  return request;
};

const deleteRequest = async (id) => {
  await getRequest(id);
  await prisma.feeBuilderRequest.delete({ where: { id } });
};

module.exports = { createRequest, listRequests, getRequest, deleteRequest };
