const prisma = require("../config/database");
const fs = require("fs");
const path = require("path");

const portfolioSelect = {
  id: true,
  title: true,
  description: true,
  projectOverview: true,
  location: true,
  propertyType: true,
  area: true,
  duration: true,
  budget: true,
  roi: true,
  featuredHighlight: true,
  createdAt: true,
  updatedAt: true,
  gallery: {
    select: { id: true, url: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  },
};

const notFound = () => {
  const err = new Error("Portfolio not found.");
  err.status = 404;
  throw err;
};

const createPortfolio = async (data) => {
  const { imageUrls = [], ...rest } = data;

  const portfolio = await prisma.portfolio.create({
    data: {
      ...rest,
      gallery:
        imageUrls.length > 0
          ? { create: imageUrls.map((url) => ({ url })) }
          : undefined,
    },
    select: portfolioSelect,
  });

  return portfolio;
};

const listPortfolios = async ({ page = 1, limit = 9 } = {}) => {
  const skip = (page - 1) * limit;

  const [portfolios, total] = await Promise.all([
    prisma.portfolio.findMany({
      select: portfolioSelect,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.portfolio.count(),
  ]);

  return {
    portfolios,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getPortfolio = async (id) => {
  const portfolio = await prisma.portfolio.findUnique({
    where: { id },
    select: portfolioSelect,
  });
  if (!portfolio) notFound();
  return portfolio;
};

const updatePortfolio = async (id, data) => {
  await getPortfolio(id); // ensure exists

  const portfolio = await prisma.portfolio.update({
    where: { id },
    data,
    select: portfolioSelect,
  });

  return portfolio;
};

const deletePortfolio = async (id) => {
  const portfolio = await prisma.portfolio.findUnique({
    where: { id },
    select: {
      id: true,
      gallery: { select: { url: true } },
    },
  });
  if (!portfolio) notFound();

  for (const img of portfolio.gallery) {
    const filePath = path.join(__dirname, "../uploads", path.basename(img.url));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }

  await prisma.portfolio.delete({ where: { id } });
};

const addImages = async (id, imageUrls) => {
  await getPortfolio(id); 

  await prisma.portfolioImage.createMany({
    data: imageUrls.map((url) => ({ url, portfolioId: id })),
  });

  return getPortfolio(id);
};

const deleteImage = async (portfolioId, imageId) => {
  const image = await prisma.portfolioImage.findFirst({
    where: { id: imageId, portfolioId },
  });

  if (!image) {
    const err = new Error("Image not found.");
    err.status = 404;
    throw err;
  }

  // Remove file from disk
  const filePath = path.join(__dirname, "../uploads", path.basename(image.url));
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  await prisma.portfolioImage.delete({ where: { id: imageId } });
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
