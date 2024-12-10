const express = require("express");
const { register, login, getProfile, blockUser,  unblockUser, viewOtherProfile, followingUser, unfollowingUser, forgotPassword, resetPassword, accountVerificationEmail, VerifyAccount } = require("../../controllers/users/userController");
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

//!follow user  Route
usersRouter.put("/following/:userIdToFollow", isLoggedIn, followingUser);

//!Unfollow user  Route
usersRouter.put("/unfollowing/:userIdToUnFollow", isLoggedIn, unfollowingUser);

//!Forgot password  Route
usersRouter.put("/forgot-password", forgotPassword);

//!reset password  Route
usersRouter.put("/reset-password/:resetToken", resetPassword);

//! send AccountVerification   Route
usersRouter.put("/account-verification-email", isLoggedIn, accountVerificationEmail);

//!  Account token verification   Route
usersRouter.put("/verify-account/:VerifyToken", isLoggedIn, VerifyAccount);


module.exports = usersRouter;
