import express from "express";
import { createNote, getNotes, updateNote, deleteNote } from "../controllers/noteController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Create a new note
router.post("/", protect, createNote);

// Get all notes for logged-in user
router.get("/", protect, getNotes);

// Update a specific note
router.put("/:id", protect, updateNote);

// Delete a specific note
router.delete("/:id", protect, deleteNote);

export default router;
