const express = require("express");
const authRoutes = require("./auth.routes");
const propertyRoutes = require("./property.routes");
const chatRoutes = require("./chat.routes");
const inquiryRoutes = require("./inquiry.routes");
const portfolioRoutes = require("./portfolio.routes");
const feeBuilderRoutes = require("./feeBuilder.routes");
const constructionRoutes = require("./construction.routes");
const renovationRoutes = require("./renovation.routes");
const consultationRoutes = require("./consultation.routes");
const mortgageRoutes = require("./mortgage.routes");
const investmentRoutes = require("./investment.routes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/properties", propertyRoutes);
router.use("/chat", chatRoutes);
router.use("/inquiries", inquiryRoutes);
router.use("/portfolios", portfolioRoutes);
router.use("/fee-builder", feeBuilderRoutes);
router.use("/constructions", constructionRoutes);
router.use("/renovations", renovationRoutes);
router.use("/consultations", consultationRoutes);
router.use("/mortgage-applications", mortgageRoutes);
router.use("/investments", investmentRoutes);

module.exports = router;
