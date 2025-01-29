const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

// Authentication routes
router.post("/checkToken", authController.checkToken);
router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);
router.post("/googleSignIn", authController.googleSignIn);
router.post("/githubSignIn", authController.githubSignIn);

module.exports = router;
