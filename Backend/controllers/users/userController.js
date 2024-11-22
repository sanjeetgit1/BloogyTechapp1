const bcrypt = require("bcryptjs");
const User = require("../../models/Users/User");
const generateToken = require("../../utils/generateToken");
const asyncHandler = require("express-async-handler");
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
exports.login =  asyncHandler(async (req, resp, next) => {
  
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
  
  
    const user = await User.findById(req.userAuth.id);
    resp.json({
      status: "success",
      message: "Profile fetched",
      user,
    });

});


//@desc Block User
//router PUT /api/v1/users/block/userIdToBlock
//@access private

exports.blockUser = asyncHandler(async(req,resp,next)=>{
  //!find the userid to be blocked
  const userIdToBlock = req.params.userIdToBlock;
  //!Check whether the user is present in DB or not
  const userToBlock = await User.findById(userIdToBlock);
  if(!userIdToBlock){
    let error = new Error("Use to block not found!");
    next(error);
    return;
  }
  //!Get the current user id
  const userBlocking = req?.userAuth?._id;

//! Check if it is self blocking
if(userIdToBlock.toString()=== userBlocking.toString()){
let error = new Error("Cannot block yourself!");
next(error);
return;

}

//! Get the current user object from DB
const currentUser = await User.findById(userBlocking);
//! Check whether the userIdBlock is already blocked
if(currentUser.blockedUsers.includes(userIdToBlock)){
  let error = new Error("This user has already been blocked!");
  next(error);
  return;
}

//!push the user to be blocked in the blockedUsers array
currentUser.blockedUsers.push(userIdToBlock);
await currentUser.save();
resp.json({
  status:"success",
  message:"User blocked successfully",
});

});

//@desc Unblock User
//@route PUT /API/v1/users/unblock/:userIdToUnBlock
//@access private

exports.unblockUser = asyncHandler(async(req,resp, next)=>{
  //Find the user to be unblocked
  const userIdToUnBlock=req.params.userIdToUnBlock;
  const userToUnBlock= await User.findById(userIdToUnBlock);
  if(!userToUnBlock){
    let error = new Error("User to UNBlock not found!");
    next(error);
    return;
  }
  // Find the current user
  const userUnBlocking= req?.userAuth?._id;
  const currentUser= await User.findById(userUnBlocking);

  // check if the user to unblock is already blocked
  if(!currentUser.blockedUsers.includes(userIdToUnBlock)){
    let error = new error("User not blocked!");
    next(error);
    return;
  }
  // Remove the user from the current user blockedUsers array
  currentUser.blockedUsers= currentUser.blockedUsers.filter((id)=>{
    return id.toString() !== userIdToUnBlock;

  });
  // Update the DB
  await currentUser.save();

  //return the response
  resp.json({
    status:"success",
    message:"User Unblocked successfully",
  });
});


//@desc view another user profile
//@GET /api/v1/users/view-another-profile/:userProfileId
//@access private

exports.viewOtherProfile  = asyncHandler(async(req,resp,next)=>{
  //Get the userId whose profile is tob viewed
  const userProfileId = req.params.userProfileId;
  const userProfile =await User.findById(userProfileId);
  if(!userProfile){
    let error = new Error("user whose profile is to be viewed not presents!");
    next(error);
    return;
  } 

  const currentUserId = req?.userAuth?._id;
  // Check if we have already viewed the profile of userProfile
  if(userProfile.profileViewers.includes(currentUserId)){
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
    status:"Success",
    message:"Profile successfully viewed",
  });
});

//@desc Follow User 
//@router PUT /api/v1/users/following/:userIdToFollow
//@access private

exports.followingUser= asyncHandler(async(req,resp,next)=>{
// find the current user id
const currentUserId = req?.userAuth?._id;

//Find the user to be followed
const userIdToFollow = req.params.userIdToFollow;
const userProfile =await  User.findById(userIdToFollow);
if(!userProfile){
  let error= new Error("User to followed not present!");
  next(error);
  return;
}
// Avoid current user following hiself
// push the id to of userToFollow inside following array of current user
//push the current user id into the followers arrays of userToFollow
// send the response

})