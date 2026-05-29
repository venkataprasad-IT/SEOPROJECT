import mongoose from "mongoose";

const globalCache = globalThis;

const connectDB = async () => {
    if (!process.env.MONGODB_URI) {
        throw new Error("MONGODB_URI is not set");
    }

    if (globalCache.mongoose?.conn) {
        return globalCache.mongoose.conn;
    }

    if (!globalCache.mongoose) {
        globalCache.mongoose = { conn: null, promise: null };
    }

    if (!globalCache.mongoose.promise) {
        mongoose.connection.on("connected", () => {
            console.log("MongoDB connected");
        });

        mongoose.connection.on("error", (err) => {
            console.error("MongoDB connection error:", err.message);
        });

        globalCache.mongoose.promise = mongoose
            .connect(process.env.MONGODB_URI)
            .then((mongooseInstance) => mongooseInstance);
    }

    try {
        globalCache.mongoose.conn = await globalCache.mongoose.promise;
        return globalCache.mongoose.conn;
    } catch (error) {
        globalCache.mongoose.promise = null;
        console.error("Failed to connect to MongoDB:", error.message);
        throw error;
    }
};

export default connectDB;