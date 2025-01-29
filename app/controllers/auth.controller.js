require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/user.model");
const connectDB = require("../database/db.connect");

// Connect to database
connectDB();


const admin = require("../../firebase");

//✅ Check token validity
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

// ✅ Check token validity
exports.checkToken = async (req, res) => {
  try {
    const token = req.headers["authorization"];
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
    const { username, email, password } = req.body;

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({ username, email, password: hashedPassword });
    await user.save();

    const token = generateToken(user._id);
    res.status(201).json({ user, token });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Login existing user (Email & Password)
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user._id);
    res.status(200).json({ user, token });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Google Sign-In using Firebase Token
exports.googleSignIn = async (req, res) => {
  try {
    const { idToken } = req.body;
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { email, name, uid } = decodedToken;

    let user = await User.findOne({ email });

    let isNewUser = false;
    if (!user) {
      isNewUser = true;
      user = new User({ username: name, email, firebaseUID: uid });
      await user.save();
    }

    const token = generateToken(user._id);
    res.status(200).json({ user, token, isNewUser });
  } catch (error) {
    res.status(500).json({ message: "Google authentication failed", error: error.message });
  }
};

// ✅ GitHub Sign-In (Assuming OAuth flow on the frontend)
exports.githubSignIn = async (req, res) => {
  try {
    const { email, name } = req.body;
    let user = await User.findOne({ email });

    let isNewUser = false;
    if (!user) {
      isNewUser = true;
      user = new User({ username: name, email });
      await user.save();
    }

    const token = generateToken(user._id);
    res.status(200).json({ user, token, isNewUser });
  } catch (error) {
    res.status(500).json({ message: "GitHub authentication failed", error: error.message });
  }
};
