import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import blogRoutes from './routes/blog.js';
import authRoutes from './routes/auth.js';
import cors from "cors";
dotenv.config();
connectDB()
const app=express()
app.use(cors());
app.use(express.json());

// Mount the auth routes under /api/auth

app.use("/api/blog",blogRoutes)
app.use("/api/auth", authRoutes);
const PORT=process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
