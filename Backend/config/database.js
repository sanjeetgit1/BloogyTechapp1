const mongoose= require('mongoose');

const connectDB= async()=>{
    try {
        await mongoose.connect(process.env.MONGO_URL)
        console.log("Connected successfully to mongoDB");
        
    } catch (error) {
        console.log("connection mongoDB to failed", error.message);
        
        
    }

}
module.exports=connectDB;