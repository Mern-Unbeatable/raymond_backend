/*
  Warnings:

  - The values [DETACHED,SEMI_DETACHED,TERRACE,FLAT,BUNGALOW,OFFICE_SPACE,WAREHOUSE] on the enum `PropertyType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum: replace old values with new ones using safe CASE mapping
BEGIN;
CREATE TYPE "PropertyType_new" AS ENUM ('SINGLE_FAMILY_HOME', 'TOWNHOMES', 'LAND', 'COMMERCIAL');

ALTER TABLE "Property"
  ALTER COLUMN "propertyType" TYPE "PropertyType_new"
  USING (CASE "propertyType"::text
    WHEN 'LAND'         THEN 'LAND'
    WHEN 'OFFICE_SPACE' THEN 'COMMERCIAL'
    WHEN 'WAREHOUSE'    THEN 'COMMERCIAL'
    ELSE 'SINGLE_FAMILY_HOME'
  END)::"PropertyType_new";

ALTER TABLE "Portfolio"
  ALTER COLUMN "propertyType" TYPE "PropertyType_new"
  USING (CASE "propertyType"::text
    WHEN 'LAND'         THEN 'LAND'
    WHEN 'OFFICE_SPACE' THEN 'COMMERCIAL'
    WHEN 'WAREHOUSE'    THEN 'COMMERCIAL'
    ELSE 'SINGLE_FAMILY_HOME'
  END)::"PropertyType_new";

ALTER TABLE "RenovationRequest"
  ALTER COLUMN "propertyType" TYPE "PropertyType_new"
  USING (CASE "propertyType"::text
    WHEN 'LAND'         THEN 'LAND'
    WHEN 'OFFICE_SPACE' THEN 'COMMERCIAL'
    WHEN 'WAREHOUSE'    THEN 'COMMERCIAL'
    WHEN 'SINGLE_FAMILY_HOME' THEN 'SINGLE_FAMILY_HOME'
    WHEN 'TOWNHOMES'    THEN 'TOWNHOMES'
    WHEN 'COMMERCIAL'   THEN 'COMMERCIAL'
    ELSE 'SINGLE_FAMILY_HOME'
  END)::"PropertyType_new";

ALTER TABLE "MortgageApplication"
  ALTER COLUMN "propertyType" TYPE "PropertyType_new"
  USING (CASE "propertyType"::text
    WHEN 'LAND'         THEN 'LAND'
    WHEN 'OFFICE_SPACE' THEN 'COMMERCIAL'
    WHEN 'WAREHOUSE'    THEN 'COMMERCIAL'
    WHEN 'SINGLE_FAMILY_HOME' THEN 'SINGLE_FAMILY_HOME'
    WHEN 'TOWNHOMES'    THEN 'TOWNHOMES'
    WHEN 'COMMERCIAL'   THEN 'COMMERCIAL'
    ELSE 'SINGLE_FAMILY_HOME'
  END)::"PropertyType_new";

ALTER TYPE "PropertyType" RENAME TO "PropertyType_old";
ALTER TYPE "PropertyType_new" RENAME TO "PropertyType";
DROP TYPE "PropertyType_old";
COMMIT;
