const express = require('express');
const {createComment, createCommet, deleteComment, updateComment}=require('../../controllers/comments/commentsController');

const isLoggedIn= require('../../middlewares/isLoggedIn');

const commentRouter= express.Router();

//? setup comment router
commentRouter.post('/:postId', isLoggedIn, createCommet )
//? setup delete comment router
commentRouter.delete('/:commentId', isLoggedIn, deleteComment )
//? setup comment router
commentRouter.put('/:commentId', isLoggedIn, updateComment )

module.exports=commentRouter;