const express = require('express')
const dotenv = require('dotenv')
const usersRouter = require('./routes/users/userRouter')
const connectDB = require('./config/database');
const { notFound, globalErrorHander } = require('./middlewares/globalErrorHandler');
const categoriesRouter = require('./routes/categories/categoriesRouter');
const postsRouter = require('./routes/posts/postsRouter');
const commentRouter = require('./routes/comments/commentRouter');
const sendEmail = require('./utils/sendEmail.js');


//! create an express 
// sendEmail("projectsanjeet@gmail.com", "HelloWelcome123");
const app = express();

//? load the environment variable from file .env
dotenv.config();

//! Establish connection to mongoDB
connectDB();

//! setup to middleware
app.use(express.json());

//? setup the user router
app.use('/api/v1/users',  usersRouter);

//? setup the categories router
app.use('/api/v1/categories',  categoriesRouter);
//?setup the posts Router
app.use('/api/v1/posts', postsRouter);
//?setup the comment Router
app.use('/api/v1/comments', commentRouter);

//? Not found error handler
app.use(notFound);

//? setup the global error handler
app.use(globalErrorHander);

//  //! start server.js on localhost
//  app.get('/',(req,res)=>{
//     res.send("Welcome to MY API") 
//  })

//! start server.js
const PORT =process.env.PORT || 9080
app.listen(PORT,()=>{
    console.log(`server is running port ${PORT}`);
})


