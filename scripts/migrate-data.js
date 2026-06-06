/**
 * Data migration script: copies all rows from OLD database to NEW database.
 * Usage: node scripts/migrate-data.js
 */

const { execSync } = require("child_process");
const { PrismaClient } = require("@prisma/client");

const OLD_DB_URL =
  "postgres://postgres:VhY37uxquC5eTkKc3riDbbolCOf57xuOYD5WHrgyOlauTcGtrifctV1vNs23QyBD@187.127.164.72:5580/postgres";

const NEW_DB_URL =
  "postgres://postgres:rPz9SxuM16yUdX5BkL27at3jBy8TGGYkROxuloLdXO7nLKSMRpiKVVhNW1d5Iugh@5.181.218.83:5582/postgres";

// ─── Step 1: Deploy schema to new database ───────────────────────────────────
console.log("\n[1/2] Running prisma migrate deploy on NEW database...");
try {
  execSync("npx prisma migrate deploy", {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: NEW_DB_URL },
  });
  console.log("    Schema deployed successfully.\n");
} catch (err) {
  console.error("    Failed to deploy migrations:", err.message);
  process.exit(1);
}

// ─── Step 2: Copy data table by table ────────────────────────────────────────
const oldDb = new PrismaClient({ datasources: { db: { url: OLD_DB_URL } } });
const newDb = new PrismaClient({ datasources: { db: { url: NEW_DB_URL } } });

const dec = (v) => (v != null ? v.toString() : null);

async function copyTable(label, fetchFn, insertFn) {
  const rows = await fetchFn();
  if (rows.length === 0) {
    console.log(`  ${label}: 0 rows — skipped.`);
    return;
  }
  const result = await insertFn(rows);
  console.log(`  ${label}: ${result?.count ?? rows.length} rows copied.`);
}

async function main() {
  console.log("[2/2] Copying data from OLD → NEW database...\n");

  // ── No foreign-key dependencies ──────────────────────────────────────────
  await copyTable(
    "User",
    () => oldDb.user.findMany(),
    (rows) => newDb.user.createMany({ data: rows, skipDuplicates: true }),
  );

  await copyTable(
    "OtpToken",
    () => oldDb.otpToken.findMany(),
    (rows) => newDb.otpToken.createMany({ data: rows, skipDuplicates: true }),
  );

  await copyTable(
    "Property",
    () => oldDb.property.findMany(),
    (rows) =>
      newDb.property.createMany({
        data: rows.map((r) => ({
          ...r,
          askingPrice: dec(r.askingPrice),
          purchasePrice: dec(r.purchasePrice),
          estimatedRenovationCost: dec(r.estimatedRenovationCost),
          arv: dec(r.arv),
          discount: dec(r.discount),
        })),
        skipDuplicates: true,
      }),
  );

  await copyTable(
    "Portfolio",
    () => oldDb.portfolio.findMany(),
    (rows) => newDb.portfolio.createMany({ data: rows, skipDuplicates: true }),
  );

  await copyTable(
    "ChatRoom",
    () => oldDb.chatRoom.findMany(),
    (rows) => newDb.chatRoom.createMany({ data: rows, skipDuplicates: true }),
  );

  await copyTable(
    "FeeBuilderRequest",
    () => oldDb.feeBuilderRequest.findMany(),
    (rows) =>
      newDb.feeBuilderRequest.createMany({ data: rows, skipDuplicates: true }),
  );

  await copyTable(
    "Construction",
    () => oldDb.construction.findMany(),
    (rows) =>
      newDb.construction.createMany({
        data: rows.map((r) => ({ ...r, price: dec(r.price) })),
        skipDuplicates: true,
      }),
  );

  await copyTable(
    "RenovationRequest",
    () => oldDb.renovationRequest.findMany(),
    (rows) =>
      newDb.renovationRequest.createMany({ data: rows, skipDuplicates: true }),
  );

  await copyTable(
    "MortgageApplication",
    () => oldDb.mortgageApplication.findMany(),
    (rows) =>
      newDb.mortgageApplication.createMany({
        data: rows.map((r) => ({
          ...r,
          annualIncome: dec(r.annualIncome),
          desiredLoanAmount: dec(r.desiredLoanAmount),
          mortgagePurchaseAmount: dec(r.mortgagePurchaseAmount),
          mortgageDownPayment: dec(r.mortgageDownPayment),
          mortgageInterestRate: dec(r.mortgageInterestRate),
          mortgageEstMonthly: dec(r.mortgageEstMonthly),
          mortgagePrincipalInterest: dec(r.mortgagePrincipalInterest),
          mortgagePropertyTax: dec(r.mortgagePropertyTax),
          mortgageHomeInsurance: dec(r.mortgageHomeInsurance),
          refinanceLoanAmount: dec(r.refinanceLoanAmount),
          refinanceHomeValue: dec(r.refinanceHomeValue),
          refinanceInterestRate: dec(r.refinanceInterestRate),
          refinanceEstMonthly: dec(r.refinanceEstMonthly),
          refinancePrincipalInterest: dec(r.refinancePrincipalInterest),
          refinancePropertyTax: dec(r.refinancePropertyTax),
          refinanceHomeInsurance: dec(r.refinanceHomeInsurance),
          refinanceHoa: dec(r.refinanceHoa),
        })),
        skipDuplicates: true,
      }),
  );

  await copyTable(
    "Investment",
    () => oldDb.investment.findMany(),
    (rows) => newDb.investment.createMany({ data: rows, skipDuplicates: true }),
  );

  await copyTable(
    "Consultation",
    () => oldDb.consultation.findMany(),
    (rows) =>
      newDb.consultation.createMany({ data: rows, skipDuplicates: true }),
  );

  // ── Depends on parents above ──────────────────────────────────────────────
  await copyTable(
    "PropertyImage",
    () => oldDb.propertyImage.findMany(),
    (rows) =>
      newDb.propertyImage.createMany({ data: rows, skipDuplicates: true }),
  );

  await copyTable(
    "PortfolioImage",
    () => oldDb.portfolioImage.findMany(),
    (rows) =>
      newDb.portfolioImage.createMany({ data: rows, skipDuplicates: true }),
  );

  await copyTable(
    "Inquiry",
    () => oldDb.inquiry.findMany(),
    (rows) => newDb.inquiry.createMany({ data: rows, skipDuplicates: true }),
  );

  await copyTable(
    "ConstructionRegistration",
    () => oldDb.constructionRegistration.findMany(),
    (rows) =>
      newDb.constructionRegistration.createMany({
        data: rows,
        skipDuplicates: true,
      }),
  );

  await copyTable(
    "InvestmentApplication",
    () => oldDb.investmentApplication.findMany(),
    (rows) =>
      newDb.investmentApplication.createMany({
        data: rows,
        skipDuplicates: true,
      }),
  );

  await copyTable(
    "ChatParticipant",
    () => oldDb.chatParticipant.findMany(),
    (rows) =>
      newDb.chatParticipant.createMany({ data: rows, skipDuplicates: true }),
  );

  await copyTable(
    "Message",
    () => oldDb.message.findMany(),
    (rows) => newDb.message.createMany({ data: rows, skipDuplicates: true }),
  );

  console.log("\n✅ All tables migrated successfully.");
}

main()
  .catch((err) => {
    console.error("\n❌ Migration failed:", err.message || err);
    process.exit(1);
  })
  .finally(async () => {
    await oldDb.$disconnect();
    await newDb.$disconnect();
  });
