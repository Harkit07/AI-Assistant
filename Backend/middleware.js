import User from "./models/user.js";
import BlacklistToken from "./models/blacklistToken.js";
import jwt from "jsonwebtoken";

export const authUser = async (req, res, next) => {
  // Get token from cookie or Authorization header
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    // Check if token is blacklisted
    const isBlacklisted = await BlacklistToken.findOne({ token: token });
    if (isBlacklisted) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded._id);

    req.user = user;

    return next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};
