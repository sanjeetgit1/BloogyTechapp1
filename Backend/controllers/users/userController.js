const bcrypt = require("bcryptjs");
const User = require("../../models/Users/User");
const generateToken = require("../../utils/generateToken");
const asyncHandler = require("express-async-handler");
const sendEmail = require("../../utils/sendEmail");
const crypto = require("crypto");
const sendAccountVerificationEmail = require("../../utils/sendAccountVerificationEmail");
const { verify } = require("jsonwebtoken");
// @desc Register new user
//@route POST/api/v1/users/register
//@access public

exports.register = asyncHandler(async (req, resp, next) => {
  const { username, password, email } = req.body;
  const user = await User.findOne({ username });
  if (user) {
    throw new Error("User Already Existing");
  }
  const newUser = new User({ username, email, password });
  const salt = await bcrypt.genSalt(10);
  newUser.password = await bcrypt.hash(password, salt);
  await newUser.save();
  resp.json({
    status: "success",
    message: "User registered successfully",
    _id: newUser?.id,
    username: newUser?.username,
    email: newUser?.email,
    role: newUser?.role,
  });
});

//@desc Login new user
//@route POST /api/v1/users/login
//@access public
exports.login = asyncHandler(async (req, resp, next) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) {
    throw new Error("Invalid credentials");
  }
  let isMatched = await bcrypt.compare(password, user?.password);
  if (!isMatched) {
    throw new Error("Invalid credentials");
  }
  user.lastLogin = new Date();
  await user.save();
  resp.json({
    status: "success ",
    email: user?.email,
    _id: user?._id,
    username: user?.username,
    role: user?.role,
    token: generateToken(user),
  });
});

//@desc Profile view
//@route GET /api/v1/users/profile/:id
//@access private
// console.log("rec:", req.userAuth);

exports.getProfile = asyncHandler(async (req, resp, next) => {
  const user = await User.findById(req.userAuth.id)
    .populate({
      path: "posts",
      model: "Post",
    })
    .populate({ path: "following", model: "user" })
    .populate({ path: "followers", model: "user" })
    .populate({ path: "blockedUsers", model: "user" })
    .populate({ path: "profileViewers", model: "user" });

  resp.json({
    status: "success",
    message: "Profile fetched",
    user,
  });
});

//@desc Block User
//router PUT /api/v1/users/block/userIdToBlock
//@access private

exports.blockUser = asyncHandler(async (req, resp, next) => {
  //!find the userid to be blocked
  const userIdToBlock = req.params.userIdToBlock;
  //!Check whether the user is present in DB or not
  const userToBlock = await User.findById(userIdToBlock);
  if (!userIdToBlock) {
    let error = new Error("Use to block not found!");
    next(error);
    return;
  }
  //!Get the current user id
  const userBlocking = req?.userAuth?._id;

  //! Check if it is self blocking
  if (userIdToBlock.toString() === userBlocking.toString()) {
    let error = new Error("Cannot block yourself!");
    next(error);
    return;
  }

  //! Get the current user object from DB
  const currentUser = await User.findById(userBlocking);
  //! Check whether the userIdBlock is already blocked
  if (currentUser.blockedUsers.includes(userIdToBlock)) {
    let error = new Error("This user has already been blocked!");
    next(error);
    return;
  }

  //!push the user to be blocked in the blockedUsers array
  currentUser.blockedUsers.push(userIdToBlock);
  await currentUser.save();
  resp.json({
    status: "success",
    message: "User blocked successfully",
  });
});

//@desc Unblock User
//@route PUT /API/v1/users/unblock/:userIdToUnBlock
//@access private

exports.unblockUser = asyncHandler(async (req, resp, next) => {
  //Find the user to be unblocked
  const userIdToUnBlock = req.params.userIdToUnBlock;
  const userToUnBlock = await User.findById(userIdToUnBlock);
  if (!userToUnBlock) {
    let error = new Error("User to UNBlock not found!");
    next(error);
    return;
  }
  // Find the current user
  const userUnBlocking = req?.userAuth?._id;
  const currentUser = await User.findById(userUnBlocking);

  // check if the user to unblock is already blocked
  if (!currentUser.blockedUsers.includes(userIdToUnBlock)) {
    let error = new Error("User not blocked!");
    next(error);
    return;
  }
  // Remove the user from the current user blockedUsers array
  currentUser.blockedUsers = currentUser.blockedUsers.filter((id) => {
    return id.toString() !== userIdToUnBlock;
  });
  // Update the DB
  await currentUser.save();

  //return the response
  resp.json({
    status: "success",
    message: "User Unblocked successfully",
  });
});

//@desc view another user profile
//@GET /api/v1/users/view-another-profile/:userProfileId
//@access private

exports.viewOtherProfile = asyncHandler(async (req, resp, next) => {
  //Get the userId whose profile is tob viewed
  const userProfileId = req.params.userProfileId;
  const userProfile = await User.findById(userProfileId);
  if (!userProfile) {
    let error = new Error("user whose profile is to be viewed not presents!");
    next(error);
    return;
  }

  const currentUserId = req?.userAuth?._id;
  // Check if we have already viewed the profile of userProfile
  if (userProfile.profileViewers.includes(currentUserId)) {
    let error = new Error("You have already viewed the profile!");
    next(error);
    return;
  }
  // push the currentUserId into array of userprofile
  userProfile.profileViewers.push(currentUserId);

  //Update the DB
  await userProfile.save();
  //return the resp
  resp.json({
    status: "Success",
    message: "Profile successfully viewed",
  });
});

//@desc Follow User
//@router PUT /api/v1/users/following/:userIdToFollow
//@access private

exports.followingUser = asyncHandler(async (req, resp, next) => {
  // find the current user id
  const currentUserId = req?.userAuth?._id;

  //Find the user to be followed
  const userIdToFollow = req.params.userIdToFollow;
  const userProfile = await User.findById(userIdToFollow);
  if (!userProfile) {
    let error = new Error("User to followed not present!");
    next(error);
    return;
  }

  // Avoid current user following themselves
  if (currentUserId.toString() === userIdToFollow.toString()) {
    let error = new Error("You cannot follow yourself!");
    next(error);
    return;
  }

  // push the id to of userToFollow inside following array of current user
  await User.findByIdAndUpdate(
    currentUserId,
    { $addToSet: { following: userIdToFollow } },
    { new: true }
  );

  //push the current user id into the followers arrays of userToFollow
  await User.findByIdAndUpdate(
    userIdToFollow,
    { $addToSet: { followers: currentUserId } },
    { new: true }
  );

  // Send response
  resp.json({
    status: "success",
    message: "User followed successfully",
  });
});

//@desc unFollow User
//@router PUT /api/v1/users/unfollowing/:userIdToUnFollow
//@access private

exports.unfollowingUser = asyncHandler(async (req, resp, next) => {
  // find the current user id
  const currentUserId = req?.userAuth?._id;

  //Find the user to be followed
  const userIdToUnFollow = req.params.userIdToUnFollow;

  // Avoid current user following themselves
  if (currentUserId.toString() === userIdToUnFollow.toString()) {
    let error = new Error("You cannot unfollow yourself!");
    next(error);
    return;
  }
  // check whether the user exites
  const userProfile = await User.findById(userIdToUnFollow);
  if (!userProfile) {
    let error = new Error("User to unfollowed not present!");
    next(error);
    return;
  }

  // get the current user object
  const currentUser = await User.findById(currentUserId);

  //check whether the current user has followed userIdToUnFollow or not
  if (!currentUser.following.includes(userIdToUnFollow)) {
    let error = new Error("You can't unfollow the user you did not follow!");
    next(error);
    return;
  }

  // Remove the currentUserID from the followers array of userToUnfollw
  await User.findByIdAndUpdate(
    userIdToUnFollow,
    { $pull: { followers: currentUserId } },
    { new: true }
  );

  // Send response
  resp.json({
    status: "success",
    message: "User unfollowed successfully",
  });
});

//@desc forgot password
//@router POST  /api/v1/users/forgot-password
//@access public

exports.forgotPassword = asyncHandler(async (req, resp, next) => {
  //! fetch the email
  const { email } = req.body;

  //! Find email in the DB
  const userFound = await User.findOne({ email });
  if (!userFound) {
    let error = new Error("This email id is not registered with us");
    next(error);
    return;
  }

  //! Get the reset token
  const resetToken = userFound.generatePasswordResetToken();
  //!Save the changes(resetToken and expiryTime) to the DB

  await userFound.save();
  sendEmail(email, resetToken);
  //send the response

  resp.json({
    status: "success",
    message: "Password reset token sent to your email successfully",
  });
});

//@desc Reset  password
//@router POST  /api/v1/users/reset-password/:resetToken
//@access public

exports.resetPassword = asyncHandler(async (req, resp, next) => {
  //Get the token from params
  const { resetToken } = req.params;
  //Get the Password
  const { password } = req.body;

  //convert resetToken into hashed token
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  //verify the token with DB
  const userFound = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!userFound) {
    let error = new Error("password reset token is invalid or expired");
    next(error);
    return;
  }

  // Update the new password
  const salt = await bcrypt.genSalt(10);
  userFound.password = await bcrypt.hash(password, salt);
  userFound.passwordResetToken = undefined;
  userFound.passwordResetExpires = undefined;

  //Resave the user
  await userFound.save();
  //send the response
  resp.json({
    status: "success",
    message: "Password has been changed successfully",
  });
});

//@desc send account verification Mail
//@route Post/api/v1/users/account-verification-email
//@access private

exports.accountVerificationEmail = asyncHandler(async (req, resp, next) => {
  //find the current user's email

  const currentUser = await User.findById(req?.userAuth?._id);
  if (!currentUser) {
    let error = new Error("User not found!");
    next(error);
    return;
  }
  //Get the token from current user object
  const VerifyToken = await currentUser.generateAccountVerificationToken();

  //resave the user
  await currentUser.save();

  //sent the verification email
  sendAccountVerificationEmail(currentUser.email, VerifyToken);
  // send the response

  resp.json({
    status: "success",
    message: `Account verification email has been sent to your registered email id: ${currentUser.email}`,
  });
});

//@desc Account Token verification
//@route PUT /api/v1/users/verify-account/:verifyToken
//@access private

exports.VerifyAccount = asyncHandler(async (req, resp, next) => {
  //Get the token from param
  const { VerifyToken } = req.params;

  //Convert the token into hashed form
  let cryptoToken = crypto
    .createHash("sha256")
    .update(VerifyToken)
    .digest("hex");
  const userFound = await User.findOne({
    accountVerificationToken: cryptoToken,
    accountVerificationExpire: { $gt: Date.now() },
  });
  if (!userFound) {
    let error = new Error("Accont token invalid or expired");
    next(error);
    return;
  }
  // Update the user
  userFound.isVerified = true;
  userFound.accountVerificationToken = undefined;
  userFound.accountVerificationExpire = undefined;

  //resave the user
  await userFound.save();
  //send the response
  resp.json({
    status: "success",
    message: "Account successfully verified",
  });
});
