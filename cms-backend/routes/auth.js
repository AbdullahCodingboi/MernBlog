import express from "express";
import { Signup, Login } from "../controllers/authController.js";

const router = express.Router();

// POST /api/auth/signup
router.post("/signup", Signup);

// POST /api/auth/login
router.post("/login", Login);

export default router;
