const Category= require('../../models/Categories/Category');
const asyncHandler =require('express-async-handler');
const categoriesRouter = require('../../routes/categories/categoriesRouter');

//@desc Create new category
//@router Post /api/v1/categories
//@access private

exports.createCategory = asyncHandler(async(req,resp,next)=>{

const {name }=req.body;
const isCategoryPresent = await Category.findOne({name});
if(isCategoryPresent){
    throw new Error("Category already existing");
}
const category = await Category.create({
    name:name,
    author:req?.userAuth?._id,
});
resp.json({
    status:"success",
    message:"Category created successfully",
    category,
})
});

// @desc Get all categoriesRouter
//router GET /api/v1/categories
//@access public

exports.getAllCategories = asyncHandler(async(req,resp)=>{
    const allCategories = await Category.find({});
    resp.status(201).json({
        status:"success",
        message:"All categories successfully fetched",
        allCategories,
    })
});


//@desc Delete single category 
//router DELETE /api/v1/categories
//@access private

exports.deleteCategory = asyncHandler(async(req,resp)=>{
    const catId = req.params.id;
    await Category.findByIdAndDelete(catId);
    resp.status(201).json({
        status:"success",
        message:"Category successfull deleted",
    });
});


//@desc update single category 
//router PUT /api/v1/categories/:id
//@access private
exports.updateCategory = asyncHandler(async(req,resp)=>{
    const catId = req.params.id;
    const name =req.body.name;
   const updatedCategory= await Category.findByIdAndUpdate(catId, {name:name}, {new:true, runValidators:true});
    resp.status(201).json({
        status:"success",
        message:"Category successfull updated",
        updatedCategory,
    });
});
