/*
  Warnings:

  - You are about to drop the column `incomingId` on the `OutgoingTransaction` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "OutgoingTransaction" DROP CONSTRAINT "OutgoingTransaction_incomingId_fkey";

-- DropIndex
DROP INDEX "OutgoingTransaction_incomingId_idx";

-- AlterTable
ALTER TABLE "OutgoingTransaction" DROP COLUMN "incomingId",
ADD COLUMN     "computerCode" VARCHAR(50),
ADD COLUMN     "partNo" VARCHAR(50),
ADD COLUMN     "productName" VARCHAR(255),
ALTER COLUMN "qtyOut" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "OutgoingTransaction_computerCode_idx" ON "OutgoingTransaction"("computerCode");

-- AddForeignKey
ALTER TABLE "OutgoingTransaction" ADD CONSTRAINT "OutgoingTransaction_computerCode_fkey" FOREIGN KEY ("computerCode") REFERENCES "Product"("computerCode") ON DELETE CASCADE ON UPDATE CASCADE;
