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
});

//@desc Get All Posts
//@route GET /api/v1/posts
//@access public
exports.getAllPosts = asyncHandler(async(req,resp)=>{
  // fetch all the posts from the DB
  const allPosts = await Post.find({});
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
