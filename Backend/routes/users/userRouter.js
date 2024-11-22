const express = require("express");
const { register, login, getProfile, blockUser,  unblockUser, viewOtherProfile } = require("../../controllers/users/userController");
const isLoggedIn = require("../../middlewares/isLoggedIn");

const usersRouter = express.Router();
//!Register Route
usersRouter.post("/register", register);

//!Login Route
usersRouter.post("/login",  login);

//!Profile Route
usersRouter.get("/profile", isLoggedIn, getProfile);

//!Blocked  Route
usersRouter.put("/block/:userIdToBlock", isLoggedIn, blockUser);

//!Blocked  Route
usersRouter.put("/unblock/:userIdToUnBlock", isLoggedIn, unblockUser);

//!view another profile user  Route
usersRouter.get("/view-other-profile/:userProfileId", isLoggedIn, viewOtherProfile);


module.exports = usersRouter;
