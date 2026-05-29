import cron from "node-cron"
import KeywordTracking from "../models/keywordTracking.js"
import { keywordTracking } from "../services/keywordTrakingService.js"

export async function runRankTrackingJob() {
  console.log("Starting daily rank tracking...");

  const activeTrackings =
    await KeywordTracking.find({ active: true });

  for (const tracking of activeTrackings) {
    tracking.status = "checking";
    await tracking.save();
    await keywordTracking(tracking);

    await new Promise((r) =>
      setTimeout(r, 10000 + Math.random() * 5000)
    );
  }
}

export function startRankTrackingCron() {
  if (process.env.VERCEL) {
    console.log("Rank tracking uses Vercel Cron on this deployment");
    return;
  }

  cron.schedule("0 6 * * *", async () => {
    try {
      await runRankTrackingJob();
    } catch (error) {
      console.error(
        "[CRON] Rank tracking cron error:",
        error.message
      );
    }
  });

  console.log("Rank tracking cron job scheduled");
}