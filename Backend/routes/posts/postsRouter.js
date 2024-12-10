const express = require("express");
const multer = require("multer");
const storage =require('../../utils/fileUpload.js')
const {
  createPost,
  getAllPosts,
  getPost,
  deletePost,
  updatePost,
} = require("../../controllers/posts/postController");
const isLoggedIn = require("../../middlewares/isLoggedIn");
const postsRouter = express.Router();

const upload= multer({storage})
//? set Post router
postsRouter.post("/", isLoggedIn, upload.single("file"), createPost);
//? Get all Post router

postsRouter.get("/", isLoggedIn, getAllPosts);

//? Get single Post router
postsRouter.get("/:id", getPost);

//? Delete a Post
postsRouter.delete("/:id", isLoggedIn, deletePost);
//? Update Post router
postsRouter.put("/:id", isLoggedIn, updatePost);

module.exports = postsRouter;
