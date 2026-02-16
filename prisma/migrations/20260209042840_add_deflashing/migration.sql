-- CreateTable
CREATE TABLE "Deflashing" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "computerCode" VARCHAR(50) NOT NULL,
    "partNo" VARCHAR(50) NOT NULL,
    "productName" VARCHAR(255) NOT NULL,
    "qtyIn" INTEGER NOT NULL,
    "qtyOut" INTEGER NOT NULL DEFAULT 0,
    "ngQty" INTEGER NOT NULL DEFAULT 0,
    "spareQty" INTEGER NOT NULL DEFAULT 0,
    "responsiblePerson" VARCHAR(100) NOT NULL,
    "remark" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Deflashing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Deflashing_computerCode_idx" ON "Deflashing"("computerCode");

-- CreateIndex
CREATE INDEX "Deflashing_date_idx" ON "Deflashing"("date");
