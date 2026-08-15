/*
  Warnings:

  - A unique constraint covering the columns `[tenantId,slug]` on the table `activity` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId,username]` on the table `author` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId,email]` on the table `author` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId,slug]` on the table `blog` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId,slug]` on the table `blog_category` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId,cityHandle]` on the table `city` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId,countryHandle]` on the table `country` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId,slug]` on the table `featured_tag` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId,slug]` on the table `info_page` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId,categoryHandle]` on the table `info_page_category` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId,email]` on the table `newsletter_subscriber` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId,unsubSecret]` on the table `newsletter_subscriber` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId,from]` on the table `redirect` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId,categoryHandle]` on the table `trip_category` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId,email]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId,username]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tenantId` to the `TripSeo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `activity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `author` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `availability` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `blog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `blog_category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `city` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `country` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `departure` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `extra` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `featured_tag` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `generated_itinerary` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `generation_batch` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `info_page` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `info_page_category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `media` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `newsletter_subscriber` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `redirect` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `region` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `review` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `team_department` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `team_member` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `template` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `testimonial` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `trip_category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `wishlist` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "activity_slug_key";

-- DropIndex
DROP INDEX "author_email_key";

-- DropIndex
DROP INDEX "author_username_key";

-- DropIndex
DROP INDEX "blog_slug_key";

-- DropIndex
DROP INDEX "blog_category_slug_key";

-- DropIndex
DROP INDEX "city_cityHandle_key";

-- DropIndex
DROP INDEX "country_countryHandle_key";

-- DropIndex
DROP INDEX "featured_tag_slug_key";

-- DropIndex
DROP INDEX "info_page_slug_key";

-- DropIndex
DROP INDEX "info_page_category_categoryHandle_key";

-- DropIndex
DROP INDEX "newsletter_subscriber_email_key";

-- DropIndex
DROP INDEX "newsletter_subscriber_unsubSecret_key";

-- DropIndex
DROP INDEX "redirect_from_key";

-- DropIndex
DROP INDEX "trip_category_categoryHandle_key";

-- DropIndex
DROP INDEX "user_email_key";

-- DropIndex
DROP INDEX "user_username_key";

-- AlterTable
ALTER TABLE "TripSeo" ADD COLUMN     "tenantId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "activity" ADD COLUMN     "tenantId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "author" ADD COLUMN     "tenantId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "availability" ADD COLUMN     "tenantId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "blog" ADD COLUMN     "tenantId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "blog_category" ADD COLUMN     "tenantId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "booking" ADD COLUMN     "tenantId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "city" ADD COLUMN     "tenantId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "country" ADD COLUMN     "tenantId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "departure" ADD COLUMN     "tenantId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "extra" ADD COLUMN     "tenantId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "featured_tag" ADD COLUMN     "tenantId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "generated_itinerary" ADD COLUMN     "tenantId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "generation_batch" ADD COLUMN     "tenantId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "info_page" ADD COLUMN     "tenantId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "info_page_category" ADD COLUMN     "tenantId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "media" ADD COLUMN     "tenantId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "newsletter_subscriber" ADD COLUMN     "tenantId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "payment" ADD COLUMN     "tenantId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "redirect" ADD COLUMN     "tenantId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "region" ADD COLUMN     "tenantId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "review" ADD COLUMN     "tenantId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "team_department" ADD COLUMN     "tenantId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "team_member" ADD COLUMN     "tenantId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "template" ADD COLUMN     "tenantId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "testimonial" ADD COLUMN     "tenantId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "trip_category" ADD COLUMN     "tenantId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "tenantId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "wishlist" ADD COLUMN     "tenantId" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "TripSeo_tenantId_idx" ON "TripSeo"("tenantId");

-- CreateIndex
CREATE INDEX "activity_tenantId_idx" ON "activity"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "activity_tenantId_slug_key" ON "activity"("tenantId", "slug");

-- CreateIndex
CREATE INDEX "author_tenantId_idx" ON "author"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "author_tenantId_username_key" ON "author"("tenantId", "username");

-- CreateIndex
CREATE UNIQUE INDEX "author_tenantId_email_key" ON "author"("tenantId", "email");

-- CreateIndex
CREATE INDEX "availability_tenantId_idx" ON "availability"("tenantId");

-- CreateIndex
CREATE INDEX "blog_tenantId_idx" ON "blog"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "blog_tenantId_slug_key" ON "blog"("tenantId", "slug");

-- CreateIndex
CREATE INDEX "blog_category_tenantId_idx" ON "blog_category"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "blog_category_tenantId_slug_key" ON "blog_category"("tenantId", "slug");

-- CreateIndex
CREATE INDEX "booking_tenantId_idx" ON "booking"("tenantId");

-- CreateIndex
CREATE INDEX "city_tenantId_idx" ON "city"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "city_tenantId_cityHandle_key" ON "city"("tenantId", "cityHandle");

-- CreateIndex
CREATE INDEX "country_tenantId_idx" ON "country"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "country_tenantId_countryHandle_key" ON "country"("tenantId", "countryHandle");

-- CreateIndex
CREATE INDEX "departure_tenantId_idx" ON "departure"("tenantId");

-- CreateIndex
CREATE INDEX "extra_tenantId_idx" ON "extra"("tenantId");

-- CreateIndex
CREATE INDEX "featured_tag_tenantId_idx" ON "featured_tag"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "featured_tag_tenantId_slug_key" ON "featured_tag"("tenantId", "slug");

-- CreateIndex
CREATE INDEX "generated_itinerary_tenantId_idx" ON "generated_itinerary"("tenantId");

-- CreateIndex
CREATE INDEX "generation_batch_tenantId_idx" ON "generation_batch"("tenantId");

-- CreateIndex
CREATE INDEX "info_page_tenantId_idx" ON "info_page"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "info_page_tenantId_slug_key" ON "info_page"("tenantId", "slug");

-- CreateIndex
CREATE INDEX "info_page_category_tenantId_idx" ON "info_page_category"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "info_page_category_tenantId_categoryHandle_key" ON "info_page_category"("tenantId", "categoryHandle");

-- CreateIndex
CREATE INDEX "media_tenantId_idx" ON "media"("tenantId");

-- CreateIndex
CREATE INDEX "newsletter_subscriber_tenantId_idx" ON "newsletter_subscriber"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "newsletter_subscriber_tenantId_email_key" ON "newsletter_subscriber"("tenantId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "newsletter_subscriber_tenantId_unsubSecret_key" ON "newsletter_subscriber"("tenantId", "unsubSecret");

-- CreateIndex
CREATE INDEX "payment_tenantId_idx" ON "payment"("tenantId");

-- CreateIndex
CREATE INDEX "redirect_tenantId_idx" ON "redirect"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "redirect_tenantId_from_key" ON "redirect"("tenantId", "from");

-- CreateIndex
CREATE INDEX "region_tenantId_idx" ON "region"("tenantId");

-- CreateIndex
CREATE INDEX "review_tenantId_idx" ON "review"("tenantId");

-- CreateIndex
CREATE INDEX "team_department_tenantId_idx" ON "team_department"("tenantId");

-- CreateIndex
CREATE INDEX "team_member_tenantId_idx" ON "team_member"("tenantId");

-- CreateIndex
CREATE INDEX "template_tenantId_idx" ON "template"("tenantId");

-- CreateIndex
CREATE INDEX "testimonial_tenantId_idx" ON "testimonial"("tenantId");

-- CreateIndex
CREATE INDEX "trip_category_tenantId_idx" ON "trip_category"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "trip_category_tenantId_categoryHandle_key" ON "trip_category"("tenantId", "categoryHandle");

-- CreateIndex
CREATE INDEX "user_tenantId_idx" ON "user"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "user_tenantId_email_key" ON "user"("tenantId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "user_tenantId_username_key" ON "user"("tenantId", "username");

-- CreateIndex
CREATE INDEX "wishlist_tenantId_idx" ON "wishlist"("tenantId");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("tenantId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "country" ADD CONSTRAINT "country_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("tenantId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "region" ADD CONSTRAINT "region_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("tenantId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "city" ADD CONSTRAINT "city_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("tenantId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_category" ADD CONSTRAINT "trip_category_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("tenantId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripSeo" ADD CONSTRAINT "TripSeo_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("tenantId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "featured_tag" ADD CONSTRAINT "featured_tag_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("tenantId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extra" ADD CONSTRAINT "extra_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("tenantId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity" ADD CONSTRAINT "activity_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("tenantId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "availability" ADD CONSTRAINT "availability_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("tenantId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departure" ADD CONSTRAINT "departure_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("tenantId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking" ADD CONSTRAINT "booking_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("tenantId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("tenantId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("tenantId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlist" ADD CONSTRAINT "wishlist_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("tenantId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "testimonial" ADD CONSTRAINT "testimonial_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("tenantId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "author" ADD CONSTRAINT "author_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("tenantId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_category" ADD CONSTRAINT "blog_category_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("tenantId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog" ADD CONSTRAINT "blog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("tenantId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "info_page_category" ADD CONSTRAINT "info_page_category_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("tenantId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "info_page" ADD CONSTRAINT "info_page_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("tenantId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "newsletter_subscriber" ADD CONSTRAINT "newsletter_subscriber_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("tenantId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("tenantId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "redirect" ADD CONSTRAINT "redirect_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("tenantId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template" ADD CONSTRAINT "template_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("tenantId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_department" ADD CONSTRAINT "team_department_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("tenantId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_member" ADD CONSTRAINT "team_member_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("tenantId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generation_batch" ADD CONSTRAINT "generation_batch_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("tenantId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generated_itinerary" ADD CONSTRAINT "generated_itinerary_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("tenantId") ON DELETE CASCADE ON UPDATE CASCADE;
