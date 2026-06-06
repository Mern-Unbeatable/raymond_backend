/*
  Warnings:

  - Changed the type of `propertyType` on the `Portfolio` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- Normalize existing values to the closest valid enum member before casting
UPDATE "Portfolio"
SET "propertyType" = 'DETACHED'
WHERE "propertyType" NOT IN (
  'DETACHED','SEMI_DETACHED','TERRACE','FLAT',
  'BUNGALOW','OFFICE_SPACE','LAND','WAREHOUSE'
);

-- AlterTable: cast String → PropertyType enum
ALTER TABLE "Portfolio"
  ALTER COLUMN "propertyType" TYPE "PropertyType"
  USING "propertyType"::"PropertyType";
