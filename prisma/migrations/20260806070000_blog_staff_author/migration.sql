-- Blog author = the logged-in dashboard staff member. The dashboard sends the
-- staff's id as authorId; repoint the FK from admin -> tenant_staff.
ALTER TABLE "blog" DROP CONSTRAINT "blog_authorId_fkey";

ALTER TABLE "blog"
  ADD CONSTRAINT "blog_authorId_fkey"
  FOREIGN KEY ("authorId") REFERENCES "tenant_staff"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
