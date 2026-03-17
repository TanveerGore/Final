const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const compression = require("compression");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const errorHandler = require("./middleware/errorHandler");
require("dotenv").config();

const app = express();

// Security headers
app.use(helmet());

// Gzip compression for all responses
app.use(compression());

// Request logging (concise in production, detailed in dev)
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Body parsing with size limit to prevent payload attacks
app.use(express.json({ limit: "1mb" }));

// CORS with explicit config
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "x-auth-token"],
  }),
);

// Rate limiting on auth routes (brute-force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { msg: "Too many requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

// DB Connection with tuned pool settings
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log("MongoDB Connected...");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
};

// Routes
app.use("/api/auth", authLimiter, require("./routes/auth"));
app.use("/api/agents", require("./routes/agents"));
app.use("/api/student", require("./routes/student"));
app.use("/api/teacher", require("./routes/teacher"));

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage().rss,
    timestamp: new Date().toISOString(),
  });
});

// Global error handler (must be last middleware)
app.use(errorHandler);

const PORT = 5001;

const startServer = async () => {
  await connectDB();
  const server = app.listen(PORT, () =>
    console.log(`Server started on port ${PORT}`),
  );

  // Graceful shutdown
  const shutdown = (signal) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    server.close(async () => {
      await mongoose.connection.close();
      console.log("MongoDB connection closed.");
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
};

startServer();
