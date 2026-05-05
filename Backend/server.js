import express from "express";
import "dotenv/config";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import chatRoutes from "./routes/chat.js";
import userRoutes from "./routes/user.js";

const app = express();
const PORT = 8080;

app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.use("/api", chatRoutes);
app.use("/user", userRoutes);

app.listen(PORT, () => {
  console.log(`server running on ${PORT}`);
  connectDB();
});

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected with Database!");
  } catch (err) {
    console.log("Failed to connect with Db", err);
  }
};
