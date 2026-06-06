const prisma = require("../config/database");

const VALID_STATUSES = ["NEW", "CONTRACTED", "CLOSED"];

const inquirySelect = {
  id: true,
  fullName: true,
  email: true,
  phoneNumber: true,
  message: true,
  status: true,
  propertyId: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
  property: {
    select: {
      id: true,
      title: true,
      propertyType: true,
      listingType: true,
      city: true,
      state: true,
    },
  },
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      profileImage: true,
    },
  },
};

const submitInquiry = async ({
  propertyId,
  fullName,
  email,
  phoneNumber,
  message,
  userId,
}) => {
  // Verify property exists
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { id: true },
  });

  if (!property) {
    const error = new Error("Property not found.");
    error.status = 404;
    throw error;
  }

  // If userId is provided, verify user exists
  const inquiry = await prisma.inquiry.create({
    data: {
      propertyId,
      fullName,
      email,
      phoneNumber,
      message,
      userId: userId || null,
    },
    select: inquirySelect,
  });

  return inquiry;
};

const listInquiries = async ({ status, propertyId }) => {
  const where = {};
  if (status) where.status = status;
  if (propertyId) where.propertyId = propertyId;

  const inquiries = await prisma.inquiry.findMany({
    where,
    select: inquirySelect,
    orderBy: { createdAt: "desc" },
  });

  return inquiries;
};

const getMyInquiries = async (userId) => {
  const inquiries = await prisma.inquiry.findMany({
    where: { userId },
    select: inquirySelect,
    orderBy: { createdAt: "desc" },
  });

  return inquiries;
};

const getInquiry = async (id, requesterId, requesterRole) => {
  const inquiry = await prisma.inquiry.findUnique({
    where: { id },
    select: inquirySelect,
  });

  if (!inquiry) {
    const error = new Error("Inquiry not found.");
    error.status = 404;
    throw error;
  }

  // Non-admins can only view their own inquiries
  if (requesterRole !== "ADMIN" && inquiry.userId !== requesterId) {
    const error = new Error("Access denied.");
    error.status = 403;
    throw error;
  }

  return inquiry;
};

const updateStatus = async (id, status) => {
  if (!VALID_STATUSES.includes(status)) {
    const error = new Error(
      `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}.`,
    );
    error.status = 400;
    throw error;
  }

  const existing = await prisma.inquiry.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existing) {
    const error = new Error("Inquiry not found.");
    error.status = 404;
    throw error;
  }

  const inquiry = await prisma.inquiry.update({
    where: { id },
    data: { status },
    select: inquirySelect,
  });

  return inquiry;
};

const deleteInquiry = async (id) => {
  const existing = await prisma.inquiry.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existing) {
    const error = new Error("Inquiry not found.");
    error.status = 404;
    throw error;
  }

  await prisma.inquiry.delete({ where: { id } });
};

module.exports = {
  submitInquiry,
  listInquiries,
  getMyInquiries,
  getInquiry,
  updateStatus,
  deleteInquiry,
};
