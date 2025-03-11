const express = require("express");
const userRouter = express.Router();
const userController = require("../controllers/user.controller");



userRouter.get("/details", userController.fetchDetails);
userRouter.post("/details", userController.addDetails);
userRouter.get("/", userController.fetchUsers);
userRouter.get("/:userId",userController.fetchUser);
userRouter.post("/like", userController.likeUser);




module.exports = userRouter;
