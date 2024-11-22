const express= require('express');
const {createPost, getAllPosts, getPost, deletePost, updatePost}= require('../../controllers/posts/postController')
const isLoggedIn = require('../../middlewares/isLoggedIn');
const postsRouter= express.Router();

//? set Post router
postsRouter.post('/', isLoggedIn,createPost);
//? Get all Post router

postsRouter.get('/', getAllPosts);

//? Get single Post router
postsRouter.get('/:id', getPost);

//? Delete a Post 
postsRouter.delete('/:id',isLoggedIn, deletePost );
//? Update Post router
postsRouter.put('/:id', isLoggedIn, updatePost);

module.exports=postsRouter;