const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const authRouter = require("./auth.routes");

// Authentication routes
// Root route
router.get("/health-check", (req, res) => {
    res.send("App is up and running");
});



router.use("/auth", authRouter);

module.exports = router;
