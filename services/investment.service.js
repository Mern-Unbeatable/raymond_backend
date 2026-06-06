const prisma = require("../config/database");

const createInvestment = async ({
  title,
  description,
  targetRoi,
  timeline,
  minimumInvestment,
}) => {
  return prisma.investment.create({
    data: {
      title,
      description,
      targetRoi: targetRoi || null,
      timeline: timeline || null,
      minimumInvestment: minimumInvestment || null,
    },
  });
};

const listInvestments = async ({ page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;
  const [investments, total] = await Promise.all([
    prisma.investment.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.investment.count(),
  ]);
  return {
    investments,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

const getInvestment = async (id) => {
  const investment = await prisma.investment.findUnique({
    where: { id },
    include: { applications: true },
  });
  if (!investment) {
    const err = new Error("Investment not found.");
    err.status = 404;
    throw err;
  }
  return investment;
};

const updateInvestment = async (
  id,
  { title, description, targetRoi, timeline, minimumInvestment },
) => {
  await getInvestment(id);
  return prisma.investment.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(targetRoi !== undefined && { targetRoi: targetRoi || null }),
      ...(timeline !== undefined && { timeline: timeline || null }),
      ...(minimumInvestment !== undefined && {
        minimumInvestment: minimumInvestment || null,
      }),
    },
  });
};

const deleteInvestment = async (id) => {
  await getInvestment(id);
  await prisma.investment.delete({ where: { id } });
};

const createApplication = async ({
  fullName,
  email,
  phoneNumber,
  investmentInterest,
  message,
}) => {
  return prisma.investmentApplication.create({
    data: {
      fullName,
      email,
      phoneNumber,
      investmentInterest: investmentInterest || null,
      message: message || null,
    },
  });
};

const listApplications = async ({ page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;
  const [applications, total] = await Promise.all([
    prisma.investmentApplication.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: { investment: true },
    }),
    prisma.investmentApplication.count(),
  ]);
  return {
    applications,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

const getApplication = async (id) => {
  const application = await prisma.investmentApplication.findUnique({
    where: { id },
    include: { investment: true },
  });
  if (!application) {
    const err = new Error("Investment application not found.");
    err.status = 404;
    throw err;
  }
  return application;
};

const deleteApplication = async (id) => {
  await getApplication(id);
  await prisma.investmentApplication.delete({ where: { id } });
};

module.exports = {
  createInvestment,
  listInvestments,
  getInvestment,
  updateInvestment,
  deleteInvestment,
  createApplication,
  listApplications,
  getApplication,
  deleteApplication,
};
