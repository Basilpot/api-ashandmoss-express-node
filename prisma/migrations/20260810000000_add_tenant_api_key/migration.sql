-- AlterTable
ALTER TABLE "tenant" ADD COLUMN     "apiKeyHash" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "tenant_apiKeyHash_key" ON "tenant"("apiKeyHash");
