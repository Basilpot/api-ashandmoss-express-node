-- AlterEnum
ALTER TYPE "ExtraType" ADD VALUE 'OTHER';

-- AlterTable
ALTER TABLE "activity" ADD COLUMN     "accommodations" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "languages" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "maximumAltitude" DOUBLE PRECISION,
ADD COLUMN     "meals" TEXT[] DEFAULT ARRAY[]::TEXT[];
