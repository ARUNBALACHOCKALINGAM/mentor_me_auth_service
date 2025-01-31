const express = require("express");
const authRouter = express.Router();
const authController = require("../controllers/auth.controller");



authRouter.post("/checkToken", authController.checkToken);
authRouter.post("/register", authController.registerUser);
authRouter.post("/login", authController.loginUser);
authRouter.post("/logout", authController.logoutUser);

module.exports = authRouter;
