-- CreateEnum
CREATE TYPE "ProductionType" AS ENUM ('HT', 'HK');

-- CreateEnum
CREATE TYPE "QCStatus" AS ENUM ('PENDING', 'DONE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "computerCode" VARCHAR(50) NOT NULL,
    "partNo" VARCHAR(50) NOT NULL,
    "productName" VARCHAR(255) NOT NULL,
    "productionType" "ProductionType" NOT NULL DEFAULT 'HT',
    "location" VARCHAR(100),
    "initialStock" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IncomingTransaction" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "computerCode" VARCHAR(50) NOT NULL,
    "partNo" VARCHAR(50) NOT NULL,
    "productName" VARCHAR(255) NOT NULL,
    "incomingQty" INTEGER NOT NULL DEFAULT 0,
    "outgoingQty" INTEGER NOT NULL DEFAULT 0,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "batch" INTEGER NOT NULL DEFAULT 0,
    "responsiblePerson" VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IncomingTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AfterOQCTransaction" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "computerCode" VARCHAR(50) NOT NULL,
    "partNo" VARCHAR(50) NOT NULL,
    "productName" VARCHAR(255) NOT NULL,
    "beforeQty" INTEGER NOT NULL,
    "afterQty" INTEGER NOT NULL DEFAULT 0,
    "ngQty" INTEGER NOT NULL DEFAULT 0,
    "spareQty" INTEGER NOT NULL DEFAULT 0,
    "status" "QCStatus" NOT NULL DEFAULT 'PENDING',
    "responsiblePerson" VARCHAR(100),
    "incomingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AfterOQCTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutgoingTransaction" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "computerCode" VARCHAR(50) NOT NULL,
    "partNo" VARCHAR(50) NOT NULL,
    "productName" VARCHAR(255) NOT NULL,
    "qtyOut" INTEGER NOT NULL DEFAULT 0,
    "responsiblePerson" VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OutgoingTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Product_computerCode_key" ON "Product"("computerCode");

-- CreateIndex
CREATE INDEX "IncomingTransaction_computerCode_idx" ON "IncomingTransaction"("computerCode");

-- CreateIndex
CREATE INDEX "IncomingTransaction_date_idx" ON "IncomingTransaction"("date");

-- CreateIndex
CREATE UNIQUE INDEX "AfterOQCTransaction_incomingId_key" ON "AfterOQCTransaction"("incomingId");

-- CreateIndex
CREATE INDEX "AfterOQCTransaction_computerCode_idx" ON "AfterOQCTransaction"("computerCode");

-- CreateIndex
CREATE INDEX "AfterOQCTransaction_status_idx" ON "AfterOQCTransaction"("status");

-- CreateIndex
CREATE INDEX "OutgoingTransaction_computerCode_idx" ON "OutgoingTransaction"("computerCode");

-- CreateIndex
CREATE INDEX "OutgoingTransaction_date_idx" ON "OutgoingTransaction"("date");

-- AddForeignKey
ALTER TABLE "IncomingTransaction" ADD CONSTRAINT "IncomingTransaction_computerCode_fkey" FOREIGN KEY ("computerCode") REFERENCES "Product"("computerCode") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AfterOQCTransaction" ADD CONSTRAINT "AfterOQCTransaction_incomingId_fkey" FOREIGN KEY ("incomingId") REFERENCES "IncomingTransaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AfterOQCTransaction" ADD CONSTRAINT "AfterOQCTransaction_computerCode_fkey" FOREIGN KEY ("computerCode") REFERENCES "Product"("computerCode") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutgoingTransaction" ADD CONSTRAINT "OutgoingTransaction_computerCode_fkey" FOREIGN KEY ("computerCode") REFERENCES "Product"("computerCode") ON DELETE CASCADE ON UPDATE CASCADE;
