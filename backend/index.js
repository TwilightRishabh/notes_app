import dotenv from "dotenv";
import express from "express";
import cors from "cors";

import connectDB from "./src/db.js";
import userRoutes from "./src/routes/userRoutes.js";
import noteRoutes from "./src/routes/notesRoutes.js"

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB connection
connectDB();

// User routes
app.use("/api/users", userRoutes);

//Note routes
app.use("/api/notes", noteRoutes);


app.get("/api/ping", (req, res) => {
  res.json({ message: "pong" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on ${PORT}`));
