import express from "express"
import cors from "cors"
import "dotenv/config"
import connectDB from "./config/db.js"
import authRouter from "./routes/authRoutes.js"
import rankRouter from "./routes/rankRoutes.js"
import analysisRouter from "./routes/analysisRoutes.js"
import cronRouter from "./routes/cronRoutes.js"
import { startRankTrackingCron } from "./cron/rankTrackingCron.js"

const app = express()

const allowedOrigins = [
    process.env.CLIENT_URL,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
].filter(Boolean)

app.use(
    cors({
        origin(origin, callback) {
            if (!origin) {
                callback(null, true)
                return
            }
            if (
                allowedOrigins.includes(origin) ||
                /^https:\/\/[\w-]+\.vercel\.app$/.test(origin)
            ) {
                callback(null, true)
                return
            }
            callback(new Error(`CORS blocked for origin: ${origin}`))
        },
        credentials: true,
    })
)
app.use(express.json())

const dbReady = connectDB()
    .then(() => {
        startRankTrackingCron()
    })
    .catch((error) => {
        console.error("Server bootstrap failed:", error.message)
        throw error
    })

app.get("/", (req, res) => res.send("Server is running..!"))

app.use(async (req, res, next) => {
    if (!req.path.startsWith("/api")) {
        next()
        return
    }
    try {
        await dbReady
        next()
    } catch {
        res.status(503).json({
            success: false,
            message: "Database unavailable",
        })
    }
})

app.use("/api/auth", authRouter)
app.use("/api/rank", rankRouter)
app.use("/api/analysis", analysisRouter)
app.use("/api/cron", cronRouter)

const PORT = process.env.PORT || 5000

if (!process.env.VERCEL) {
    app.listen(PORT, () =>
        console.log(`Server is running on port ${PORT}`)
    )
}

export default app
