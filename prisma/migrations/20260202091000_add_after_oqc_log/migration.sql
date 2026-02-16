-- CreateTable
CREATE TABLE "AfterOQCLog" (
    "id" TEXT NOT NULL,
    "afterOQCId" TEXT NOT NULL,
    "okQty" INTEGER NOT NULL DEFAULT 0,
    "ngQty" INTEGER NOT NULL DEFAULT 0,
    "spareQty" INTEGER NOT NULL DEFAULT 0,
    "responsiblePerson" VARCHAR(100),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AfterOQCLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AfterOQCLog_afterOQCId_idx" ON "AfterOQCLog"("afterOQCId");

-- AddForeignKey
ALTER TABLE "AfterOQCLog" ADD CONSTRAINT "AfterOQCLog_afterOQCId_fkey" FOREIGN KEY ("afterOQCId") REFERENCES "AfterOQCTransaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
