/*
  Warnings:

  - You are about to drop the column `propertyId` on the `Portfolio` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `Portfolio` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Portfolio" DROP CONSTRAINT "Portfolio_propertyId_fkey";

-- DropIndex
DROP INDEX "Portfolio_propertyId_key";

-- AlterTable
ALTER TABLE "Portfolio" DROP COLUMN "propertyId",
DROP COLUMN "tags";
