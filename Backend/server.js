import express from "express";
import "dotenv/config";
import cors from "cors";
import https from "https";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import chatRoutes from "./routes/chat.js";
import userRoutes from "./routes/user.js";

const app = express();
const PORT = 8080;

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173", process.env.CLIENT_URL],
    credentials: true,
  }),
);
app.use(cookieParser());

// ✅ Health check endpoint (required for keep-alive ping)
app.get("/health", (req, res) => {
  res.status(200).json({ status: "alive", uptime: process.uptime() });
});

app.use("/api", chatRoutes);
app.use("/user", userRoutes);

// ✅ Keep-alive self-ping function (prevents Render sleep)
const keepAlive = () => {
  const url = process.env.RENDER_URL || `http://localhost:${PORT}/health`;

  // Only ping in production to Alive
  if (process.env.NODE_ENV === "production") {
    setInterval(
      () => {
        https
          .get(url, (res) => {
            console.log(`Keep-alive ping: ${res.statusCode}`);
          })
          .on("error", (err) => {
            console.log("Keep-alive error:", err.message);
          });
      },
      10 * 60 * 1000,
    ); // ping every 10 minutes
    console.log("Keep-alive started ✅");
  }
};

app.listen(PORT, () => {
  console.log(`server running on ${PORT}`);
  connectDB();
  keepAlive();
});

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected with Database!");
  } catch (err) {
    console.log("Failed to connect with Db", err);
  }
};
