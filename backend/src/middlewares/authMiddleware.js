import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;

  // 1) Check Authorization header exists AND starts with Bearer
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // 2) Extract token — remove "Bearer"
      token = req.headers.authorization.split(" ")[1];

      // 3) Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 4) Get the user from DB (without password)
      req.user = await User.findById(decoded.id).select("-password");

      // 5) Continue to the next middleware / controller
      return next();
    } catch (error) {
      console.error("Auth error:", error);
      return res.status(401).json({ message: "Not authorized, invalid token" });
    }
  }

  // If no token
  return res.status(401).json({ message: "Not authorized, no token provided" });
};
