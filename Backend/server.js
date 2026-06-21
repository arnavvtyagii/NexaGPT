import express from "express";
import "dotenv/config";
import cors from "cors";
import mongoose from "mongoose";
import chatRoutes from "./routes/chat.js";
import authRoutes from "./routes/auth.js";

const app = express();
const PORT = process.env.PORT || 8080;

// 1. CORS FIRST (IMPORTANT)
app.use(
  cors({
    origin: "https://nexa-gpt-delta.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  }),
);

app.options(/.*/, cors());

// 2. JSON parser
app.use(express.json());

// 3. ROUTES AFTER MIDDLEWARE
app.use("/api", chatRoutes);
app.use("/api/auth", authRoutes);

// 4. TEST ROUTE
app.get("/", (req, res) => {
  res.send("NexaGPT Backend is running");
});

// 5. DB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected with Database!");
  } catch (err) {
    console.log("Failed to connect with DB", err);
  }
};

// 6. LISTEN
app.listen(PORT, () => {
  console.log(`server running on ${PORT}`);
  connectDB();
});
