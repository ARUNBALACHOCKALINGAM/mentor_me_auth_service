const express = require("express");
const userRouter = express.Router();
const userController = require("../controllers/user.controller");



userRouter.get("/details", userController.fetchDetails);
userRouter.post("/details", userController.addDetails);

module.exports = userRouter;
