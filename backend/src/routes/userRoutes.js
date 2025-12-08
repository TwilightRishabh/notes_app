import express from "express";
import { registerUser, loginUser, getMe } from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Protected - get current user
router.get("/me", protect, getMe);

export default router;
