const prisma = require("../config/database");

const createConsultation = async ({
  fullName,
  email,
  phoneNumber,
  preferredConsultationDate,
  preferredTime,
  additionalInformation,
}) => {
  return prisma.consultation.create({
    data: {
      fullName,
      email,
      phoneNumber,
      preferredConsultationDate: preferredConsultationDate
        ? new Date(preferredConsultationDate)
        : null,
      preferredTime: preferredTime || null,
      additionalInformation: additionalInformation || null,
    },
  });
};
// List consultations with pagination
const listConsultations = async ({ page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;
  const [consultations, total] = await Promise.all([
    prisma.consultation.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.consultation.count(),
  ]);
  return {
    consultations,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

const getConsultation = async (id) => {
  const consultation = await prisma.consultation.findUnique({ where: { id } });
  if (!consultation) {
    const err = new Error("Consultation not found.");
    err.status = 404;
    throw err;
  }
  return consultation;
};

const deleteConsultation = async (id) => {
  await getConsultation(id);
  await prisma.consultation.delete({ where: { id } });
};

module.exports = {
  createConsultation,
  listConsultations,
  getConsultation,
  deleteConsultation,
};
