import { Router } from "express";
import { runRankTrackingJob } from "../cron/rankTrackingCron.js";

const router = Router();

router.get("/rank-tracking", async (req, res) => {
    const authHeader = req.headers.authorization;
    const expected = process.env.CRON_SECRET
        ? `Bearer ${process.env.CRON_SECRET}`
        : null;

    if (!expected || authHeader !== expected) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized",
        });
    }

    try {
        await runRankTrackingJob();
        res.json({ success: true, message: "Rank tracking completed" });
    } catch (error) {
        console.error("[CRON] Rank tracking error:", error.message);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

export default router;
