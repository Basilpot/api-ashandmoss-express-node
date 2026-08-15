-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('FREE', 'ENTERPRISE');

-- AlterTable
ALTER TABLE "tenant" ADD COLUMN     "plan" "Plan" NOT NULL DEFAULT 'FREE';
