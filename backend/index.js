import dotenv from "dotenv";
import express from "express";
import cors from "cors";

import connectDB from "./src/db.js";
import userRoutes from "./src/routes/userRoutes.js";
import noteRoutes from "./src/routes/notesRoutes.js"

import { autoDeleteOldTrash } from "./src/utils/trashCleanup.js";


dotenv.config();

const app = express();

app.use(cors({
  origin: "*",
  credentials: true
}));

app.use(express.json());

// MongoDB connection
connectDB();




// Run once when server starts
autoDeleteOldTrash();

// Run automatically every 24 hours
setInterval(autoDeleteOldTrash, 24 * 60 * 60 * 1000);




// User routes
app.use("/api/users", userRoutes);

//Note routes
app.use("/api/notes", noteRoutes);


app.get("/api/ping", (req, res) => {
  res.json({ message: "pong" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
