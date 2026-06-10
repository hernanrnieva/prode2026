-- CreateTable
CREATE TABLE "DaySummary" (
    "id" TEXT NOT NULL,
    "dayKey" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DaySummary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DaySummary_dayKey_key" ON "DaySummary"("dayKey");
