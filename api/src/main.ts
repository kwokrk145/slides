import express from "express";
import cors from "cors";
import prisma from "./db.js";
import commentsRouter from "./routes/comments.js";
import galleryRouter from "./routes/gallery.js";
import adminRouter from "./routes/admin.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// CORS configuration
const allowedOrigins = process.env.CORS_ORIGINS?.split(",") || [
  "http://localhost:5173", // Vite default
  "http://localhost:3000",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Routes
app.use("/api/comments", commentsRouter);
app.use("/api/gallery", galleryRouter);
app.use("/api/admin", adminRouter);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`APIs available at http://localhost:${PORT}/api/*`);
});

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log("\nShutting down gracefully...");
  server.close(async () => {
    await prisma.$disconnect();
    console.log("Database connection closed");
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error("Forced shutdown");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
