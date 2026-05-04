import express from "express";
import { body } from "express-validator";
import { authUser } from "../middleware.js";
import validate from "../services/validationResult.js";
import User from "../models/user.js";
import createUser from "../services/user.js";
import BlacklistToken from "../models/blacklistToken.js";

const router = express.Router();

router.post(
  "/signup",
  [
    body("email").isEmail().withMessage("Invalid Email"),
    body("name").isLength({ min: 3 }).withMessage("Name contain 3 characters"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must contain 6 characters"),
  ],
  validate,
  async (req, res) => {
    try {
      const { name, email, password } = req.body;

      // Check if user already exists
      const isUserAlreadyExist = await User.findOne({ email });
      if (isUserAlreadyExist) {
        return res.status(400).json({ message: "User already exist" });
      }

      // Hash password
      const hashedPassword = await User.hashPassword(password);

      // Create user
      const user = await createUser({
        name,
        email,
        password: hashedPassword,
      });

      const token = user.generateAuthToken();

      // Send token in cookie (optional)
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(200).json({ token, user });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Unable to Signup" });
    }
  },
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Invalid Email"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must contain 8 characters"),
  ],
  validate,
  async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user including password
      const user = await User.findOne({ email }).select("+password");
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Generate token
      const token = user.generateAuthToken();

      // Set secure cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(200).json({ token, user });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Unable to Login" });
    }
  },
);

router.get("/logout", authUser, async (req, res) => {
  try {
    // Get token from cookie or authorization header
    const token =
      req.cookies?.token ||
      (req.headers.authorization
        ? req.headers.authorization.split(" ")[1]
        : null);

    // Clear cookie (same options as when set)
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });

    // Add token to blacklist if it exists
    if (token) {
      await BlacklistToken.create({ token });
    }

    res.status(200).json({ message: "Logged out" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Unable to Logout" });
  }
});

export default router;
