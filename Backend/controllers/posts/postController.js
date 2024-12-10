const asyncHandler = require("express-async-handler");
const Post = require("../../models/Posts/Post");
const User = require("../../models/Users/User");
const Category = require("../../models/Categories/Category");

//@desc Create a new Post
//@route POST /api/v1/posts
//@access private

exports.createPost = asyncHandler(async (req, resp, next) => {
  //Get the payload
  const { title, content, categoryId } = req.body;
  // check if the post is present
  const postFound = await Post.findOne({ title });
  if (postFound) {
    let error = new Error("Post already existing");
    next(error);
    return;
  }

  // create post object
  const post = await Post.create({
    title,
    content,
    category: categoryId,
    author: req?.userAuth?._id,
    image:req.file.path,
  });

  // Update user by adding post in it
  const user = await User.findByIdAndUpdate(
    req.userAuth?._id,
    { $push: { posts: post._id } },
    { new: true }
  );
  //Update category by adding post in it.
  const catg = await Category.findByIdAndUpdate(
    categoryId,
    { $push: { posts: post._id } },
    { new: true }
  );
  // send the response
  resp.json({
    status: "success",
    message: "Post successfully create",
    post,
    user,
    catg,
  });
  console.log("file upload:",req.file)
  resp.send("done");
});

//@desc Get All Posts
//@route GET /api/v1/posts
//@access Private
exports.getAllPosts = asyncHandler(async(req,resp)=>{
 //Get the current user
 const currentUserId = req.userAuth._id;

 // Get the current time
 const currentDateTime= new Date();

 // Get all those user who have blocked the current user
 const userBlockingCurrentUser = await User.find({
  blockedUsers:currentUserId,
 });

 //Extract the id of the users who have blocked the current user
 const blockingUsersIds = userBlockingCurrentUser.map((userObj)=>userObj._id)


 const query = {
  author:{$nin:blockingUsersIds}, $or:[
    {
      scheduledPublished:{$lte:currentDateTime},
      scheduledPublished:null,
    },
  ],
 };
 //Fetch those posts whose author is not blockingUsersIds
 const allPosts = await Post.find(query).populate({
  path:"author",
  model:"user",
  select:"email username role",
 })

  //send the response
  resp.json({
    status:"success",
    message:"All posts successfully fetched",
    allPosts,
  });
});

//@desc Get single Posts
//@route GET api/v1/posts/:id
//@access public

exports.getPost= asyncHandler(async(req, resp)=>{
  // get the id
  const postId= req.params.id;
  // fetch the post corresponding to this id
  const post = await Post.findById(postId);
  if(post){
resp.json({
  status:"success",
  message:"Post successfully fetched",
  post,
});
  }else{
    resp.json({
      status:"success",
      message:"NO post avaialble for given id"
    })
  }
});

//@desc Delete Post
//@route Delete /api/v1/posts/:id
//@access private

exports.deletePost = asyncHandler(async(req,resp)=>{
  // Get the id
  const postId= req.params.id;

  // Delete this post from the DB
  await Post.findByIdAndDelete(postId);
  // send the response
  resp.json({
    status:"success",
    message:"post successfully deleted",
  });
});

//@desc Update Post
//@route Update /api/v1/posts/:id
//@access private

exports.updatePost = asyncHandler(async(req,resp)=>{
  // Get the id
  const postId= req.params.id;
// get the post object from req
const post = req.body;
  // update this post from the DB
  await Post.findByIdAndUpdate(postId, post, {new:true, runValidators:true});
  // send the response
  resp.json({
    status:"success",
    message:"post successfully updated",
  });
});
