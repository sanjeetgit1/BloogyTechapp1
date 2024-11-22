 const mongoose  =require('mongoose')

 const postSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
    },
    image:{
        type:String,
        default:""
    },
    claps:{
        type:Number,
        default:0,
    }, 
    content:{
        type:String,
        required:true,
    },
author:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true,
},
shares:{
    type:Number,
    default:0,
},
postViewes:{
    type:Number,
    default:0,
},
categories:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"categories",
    
},
scheduledPublished:{
    type:Date,
    default:null,
},
likes:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
},],
dislikes:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
},
],
comments:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Comment",
},
],


 },
{
    timestamps:true,
}
);

//! convert schema to model 
  
const Post = mongoose.model("Post",postSchema);
module.exports=Post; 