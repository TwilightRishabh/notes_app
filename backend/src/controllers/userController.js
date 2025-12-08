import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";

// Register User
export const registerUser = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // basic validation
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "Please provide name, email and password" });
    }

    // check duplicate
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // create user (pre-save hook will hash password)
    const user = await User.create({ fullName, email, password });

    // respond with token and user info (never send password)
    res.status(201).json({
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Login User
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // basic validation
    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    res.json({
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// Get current user (protected)
export const getMe = async (req, res) => {
  try {
    // req.user is attached by the protect middleware
    if (!req.user) return res.status(404).json({ message: "User not found" });

    res.json({
      id: req.user._id,
      fullName: req.user.fullName,
      email: req.user.email,
    });
  } catch (error) {
    console.error("GetMe error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
