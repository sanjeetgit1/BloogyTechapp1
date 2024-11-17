const express= require('express');
const {createCategory, getAllCategories, deleteCategory, updateCategory}= require('../../controllers/categories/categoriesController');
const isLoggedIn = require('../../middlewares/isLoggedIn');
const { model } = require('mongoose');

const categoriesRouter= express.Router();

//! Create Category Router
categoriesRouter.post('/',isLoggedIn, createCategory);

//! Fetch All Category Router
categoriesRouter.get('/', getAllCategories);

//! Delete A Category Router
categoriesRouter.delete('/:id', isLoggedIn, deleteCategory);

//! update A Category Router
categoriesRouter.put('/:id', isLoggedIn, updateCategory);


module.exports=categoriesRouter