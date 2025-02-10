require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/user.model");
const connectDB = require("../database/db.connect");

// Connect to database
connectDB();

const admin = require("../../firebase");

// ✅ Check token validity
exports.verifyFirebaseToken = async (req, res, next) => {
  const token = req.headers.authorization?.split("Bearer ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next(); // Proceed to the next middleware
  } catch (error) {
    return res.status(401).json({ message: "Invalid token", error });
  }
};

// Generate JWT for backend authentication
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

// ✅ Check token validity (from the cookie)
exports.checkToken = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.status(200).json({ valid: true, userId: decoded.id });
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

// ✅ Register new user (Email & Password)
exports.registerUser = async (req, res) => {
  try {
    const { email, password , usertype} = req.body;

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({ email, password: hashedPassword,userType:usertype });
    await user.save();

    const token = generateToken(user._id);

    // Set token in HttpOnly cookie
    res.cookie("token", token, {
      httpOnly: true, // Can't be accessed by JavaScript
      secure: process.env.NODE_ENV === "production", // Only send over HTTPS in production
      sameSite: "Strict", // Mitigate CSRF
      maxAge: 3600000, // 1 hour
    });

    res.status(200).json({
      id: user._id,
      email: user.email,
      userType:user.userType,
      message: "User registered successfully!"
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Login existing user (Email & Password)
exports.loginUser = async (req, res) => {
  try {
    const { email, password,userType } = req.body;
    const user = await User.findOne({ email,userType:userType });


    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user._id);

    // Set token in HttpOnly cookie
    res.cookie("token", token, {
      httpOnly: true, // Can't be accessed by JavaScript
      secure: process.env.NODE_ENV === "production", // Only send over HTTPS in production
      sameSite: "Strict", // Mitigate CSRF
      maxAge: 3600000, // 1 hour
    });

    res.status(200).json({
      id: user._id,
      email: user.email,
      userType: user.userType,
      message: "User logged in successfully!"
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.logoutUser = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });
  res.status(200).json({ message: "Logged out successfully!" });
};

