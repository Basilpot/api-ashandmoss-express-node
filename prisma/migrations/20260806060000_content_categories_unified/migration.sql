-- Unify blog + info-page categories into a single content category
-- (table "info_page_category" becomes the shared category for Blog and InfoPage).

-- 1) Backfill blog_category rows into info_page_category (handle := slug).
--    Rows whose slug collides with an existing handle are skipped.
INSERT INTO "info_page_category" ("id", "tenantId", "categoryHandle", "categoryName", "createdAt", "updatedAt")
SELECT b."id", b."tenantId", b."slug", b."name", b."createdAt", b."updatedAt"
FROM "blog_category" b
WHERE NOT EXISTS (
  SELECT 1 FROM "info_page_category" i
  WHERE i."tenantId" = b."tenantId" AND i."categoryHandle" = b."slug"
);

-- 2) Re-point blogs whose category slug already existed as an info-page category.
UPDATE "blog"
SET "blogCategoryId" = i."id"
FROM "blog_category" b
JOIN "info_page_category" i
  ON i."tenantId" = b."tenantId" AND i."categoryHandle" = b."slug"
WHERE "blog"."blogCategoryId" = b."id";

-- 3) Drop the old FK constraint and the old table.
ALTER TABLE "blog" DROP CONSTRAINT "blog_blogCategoryId_fkey";
DROP TABLE "blog_category";

-- 4) Re-add the FK to the unified category table.
ALTER TABLE "blog"
  ADD CONSTRAINT "blog_blogCategoryId_fkey"
  FOREIGN KEY ("blogCategoryId") REFERENCES "info_page_category"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
