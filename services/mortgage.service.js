const prisma = require("../config/database");

const toDecimal = (v) => (v !== undefined && v !== null && v !== "" ? v : null);
const toInt = (v) =>
  v !== undefined && v !== null && v !== "" ? parseInt(v) : null;

const createApplication = async (data) => {
  return prisma.mortgageApplication.create({
    data: {
      fullName: data.fullName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      employmentStatus: data.employmentStatus || null,
      annualIncome: toDecimal(data.annualIncome),
      desiredLoanAmount: toDecimal(data.desiredLoanAmount),
      loanType: data.loanType || null,
      loanTerm: toInt(data.loanTerm),
      propertyType: data.propertyType || null,

      mortgagePurchaseAmount: toDecimal(data.mortgagePurchaseAmount),
      mortgageDownPayment: toDecimal(data.mortgageDownPayment),
      mortgageInterestRate: toDecimal(data.mortgageInterestRate),
      mortgageLoanTerm: toInt(data.mortgageLoanTerm),
      mortgageEstMonthly: toDecimal(data.mortgageEstMonthly),
      mortgagePrincipalInterest: toDecimal(data.mortgagePrincipalInterest),
      mortgagePropertyTax: toDecimal(data.mortgagePropertyTax),
      mortgageHomeInsurance: toDecimal(data.mortgageHomeInsurance),

      refinanceLoanAmount: toDecimal(data.refinanceLoanAmount),
      refinanceHomeValue: toDecimal(data.refinanceHomeValue),
      refinanceInterestRate: toDecimal(data.refinanceInterestRate),
      refinanceFico: toInt(data.refinanceFico),
      refinanceLoanTerm: toInt(data.refinanceLoanTerm),
      refinanceEstMonthly: toDecimal(data.refinanceEstMonthly),
      refinancePrincipalInterest: toDecimal(data.refinancePrincipalInterest),
      refinancePropertyTax: toDecimal(data.refinancePropertyTax),
      refinanceHomeInsurance: toDecimal(data.refinanceHomeInsurance),
      refinanceHoa: toDecimal(data.refinanceHoa),

      message: data.message || null,
    },
  });
};

const listApplications = async ({ page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;
  const [applications, total] = await Promise.all([
    prisma.mortgageApplication.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.mortgageApplication.count(),
  ]);
  return {
    applications,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};
// Get a single application by ID

const getApplication = async (id) => {
  const application = await prisma.mortgageApplication.findUnique({
    where: { id },
  });
  if (!application) {
    const err = new Error("Mortgage application not found.");
    err.status = 404;
    throw err;
  }
  return application;
};

// Admin can delete an application if needed
const deleteApplication = async (id) => {
  await getApplication(id);
  await prisma.mortgageApplication.delete({ where: { id } });
};

module.exports = {
  createApplication,
  listApplications,
  getApplication,
  deleteApplication,
};
