const asyncHandler = require("express-async-handler");
const Post = require("../../models/Posts/Post");
const Comment = require("../../models/Comments/Comment");

//@desc create a New Comment
//@route Post /api/v1/comments/:PostId
//@access private

exports.createCommet = asyncHandler(async (req, resp) => {
  //Get the Payload
  const { message } = req.body;
  // Get the post id
  const postId = req.params.postId;

  //create the comment
  const comment = await Comment.create({
    message,
    author: req?.userAuth?._id,
    postId,
  });
  // Associate comment with Post
  await Post.findByIdAndUpdate(
    postId,
    { $push: { comments: comment._id } },
    { new: true }
  );
  resp.status(201).json({
    status: "success",
    message: "comment successfully created!",
    comment,
  });
});

//@desc Delete comment
//@route DELETE /api/comment/:commentId
//@access private
exports.deleteComment = asyncHandler(async (req, resp) => {
  //!Get the comment id to be deleted
  const commentId = req.params.id;
  const deleteComment=await Comment.findByIdAndDelete(commentId);
  resp.status(201).json({
    status: "success",
    message: "comment successfully deleted!",
    deleteComment,
  });
});

//@desc update comment
//@route PUT /api/comment/:commentId
//@access private
exports.updateComment = asyncHandler(async (req, resp) => {
  //!Get the comment id to be update
  const commentId = req.params.commentId;
  //! Get message
  const message = req.body.message;
  const commentUpdate = await Comment.findByIdAndUpdate(
    commentId,
    { message },
    { new: true, runValidators: true }
  );
  resp.status(201).json({
    status: "success",
    message: "comment successfully Updated!",
    commentUpdate,
  });
});
