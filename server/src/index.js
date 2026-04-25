import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import analyzeRoute from "./routes/analyzeRoute.js";

dotenv.config();
if (!process.env.MONGO_URI) {
  console.error("MONGO_URI is missing in .env");
  process.exit(1);
}

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", analyzeRoute);

app.get("/", (req, res) => {
  res.send("AI DevOps Deployment Assistant API running");
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

console.log("Loaded MONGO_URI:", MONGO_URI);

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });