-- CreateEnum
CREATE TYPE "FeeBuilderProjectType" AS ENUM ('ARCHITECTURAL_PLANNING', 'CUSTOM_HOME_BUILD', 'DESIGN_BUILD_MANAGEMENT', 'TURNKEY_FINISH');

-- CreateEnum
CREATE TYPE "RenovationType" AS ENUM ('KITCHEN_RENOVATION', 'BATHROOM_REMODELING', 'FULL_HOME_MAKEOVER', 'OFFICE_RENOVATION');

-- CreateTable
CREATE TABLE "FeeBuilderRequest" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "projectType" "FeeBuilderProjectType" NOT NULL,
    "estimatedBudget" TEXT,
    "projectDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeeBuilderRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Construction" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "price" DECIMAL(15,2),
    "bedrooms" INTEGER,
    "bathrooms" INTEGER,
    "area" TEXT,
    "developer" TEXT,
    "location" TEXT,
    "description" TEXT,
    "expectedRoi" TEXT,
    "areaGrowth" TEXT,
    "atBooking" TEXT,
    "foundationComplete" TEXT,
    "structureComplete" TEXT,
    "ninetyDaysHandover" TEXT,
    "atCompletion" TEXT,
    "paymentNote" TEXT,
    "images" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Construction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConstructionRegistration" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "constructionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConstructionRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RenovationRequest" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "email" TEXT NOT NULL,
    "propertyLocation" TEXT,
    "propertyType" "PropertyType",
    "renovationType" "RenovationType",
    "budgetRange" TEXT,
    "projectDetails" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RenovationRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ConstructionRegistration" ADD CONSTRAINT "ConstructionRegistration_constructionId_fkey" FOREIGN KEY ("constructionId") REFERENCES "Construction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
