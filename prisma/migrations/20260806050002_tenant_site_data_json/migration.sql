-- AlterTable
ALTER TABLE "tenant" ADD COLUMN     "footer" JSONB,
ADD COLUMN     "menu" JSONB,
ADD COLUMN     "sidebarMenu" JSONB,
ADD COLUMN     "siteConfig" JSONB;
