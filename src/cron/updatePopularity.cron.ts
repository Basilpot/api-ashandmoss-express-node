import cron from "node-cron";
import prisma from "@/lib/prisma";

async function updatePopularity() {
  return prisma.$executeRaw`
    UPDATE activity
    SET "popularityScore" =
      "views" * 1 +
      COALESCE((SELECT AVG(rating) * 20 FROM review WHERE review."activityId" = activity.id), 0) +
      CASE WHEN "isFeatured" THEN 100 ELSE 0 END
      - (EXTRACT(DAY FROM (NOW() - "createdAt")) * 0.5)
  `;
}

let started = false;

export function initPopularityCron() {
  if (started) return;
  started = true;

  cron.schedule("*/10 * * * *", async () => {
    try {
      console.log("[CRON] Updating popularity scores...");
      await updatePopularity();
    } catch (e) {
      console.error("[CRON ERROR]", e);
    }
  });

  console.log("[CRON] Popularity cron initialized");
}
