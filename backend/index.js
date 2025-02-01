import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import noteRoutes from "./routes/noteRoutes.js";
import dotenv from "dotenv";
import fileUpload from "express-fileupload";
import { mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173", // or your frontend URL
    credentials: true,
  })
);

// Configure file upload middleware with detailed debugging
app.use(
  fileUpload({
    createParentPath: true,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB max file size
    },
    abortOnLimit: true,
    useTempFiles: true,
    tempFileDir: "/tmp/",
    debug: true,
    safeFileNames: true,
    preserveExtension: true,
    uploadTimeout: 60000, // 60 seconds timeout
    parseNested: true, // Important for handling multiple files
  })
);

// Serve static files - update the path to be absolute
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Add MIME type handling early in the middleware chain
app.use((req, res, next) => {
  if (req.url.endsWith(".webm")) {
    res.setHeader("Content-Type", "audio/webm");
  }
  next();
});

// Configure static file serving with proper MIME types
app.use(
  "/uploads",
  express.static(path.join(__dirname, "public", "uploads"), {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".webm")) {
        res.set({
          "Content-Type": "audio/webm",
          "Accept-Ranges": "bytes",
          "Cache-Control": "public, max-age=3600",
        });
      }
    },
  })
);

// Add proper MIME types
express.static.mime.define({
  "audio/webm": ["webm"],
  "audio/wav": ["wav"],
  "audio/mpeg": ["mp3"],
});

// Add CORS headers for audio files
app.use((req, res, next) => {
  if (req.path.startsWith("/uploads/audio/")) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Range");
  }
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);

// Create necessary directories
try {
  await mkdir(path.join(__dirname, "public", "uploads", "images"), {
    recursive: true,
  });
  await mkdir(path.join(__dirname, "public", "uploads", "audio"), {
    recursive: true,
  });
} catch (err) {
  if (err.code !== "EEXIST") {
    console.error("Error creating upload directories:", err);
  }
}

// Add proper MIME type handling
app.use((req, res, next) => {
  res.header("Content-Type", "application/json");
  next();
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
