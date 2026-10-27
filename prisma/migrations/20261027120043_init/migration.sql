/*
  Warnings:

  - Changed the type of `outcome` on the `Bets` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Bets" DROP COLUMN "outcome",
ADD COLUMN     "outcome" BOOLEAN NOT NULL;
