import express from 'express';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import blogRoutes from '../routes/blog.js';
import authRoutes from '../routes/auth.js';
import cors from "cors";

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/blog", blogRoutes);
app.use("/api/auth", authRoutes);

// ❌ REMOVE app.listen()
// ✅ Instead, just export the app
export default app;
