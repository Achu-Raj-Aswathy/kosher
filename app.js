const express = require('express')
const nocache = require('nocache')
const session = require('express-session')
const adminRouter = require('./routes/adminRouter')
const userRouter = require('./routes/userRouter')
require('dotenv').config()
const path = require('path')
const app = express()
const PORT = 3000;
var logger = require('morgan');

//connecting database
const mongoose = require("mongoose");
const connect = mongoose.connect(process.env.MONGODB)
connect
.then(()=>{
    console.log("MongoDB is connected successfully");
})
.catch((error)=>{
    console.log("Error connecting to MongoDB",error);
})

//setting ejs
app.set('views',path.join(__dirname,'views'))
app.set('view engine','ejs')
//url encoding
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//using nocache for session manegment
app.use(nocache());

//using session
app.use(
    session({
      secret: "secret key",
      resave: false,
      saveUninitialized: true,
    })
  ); 
  
  //static
  // app.use("/static", express.static("public"));
  app.use('/uploads', express.static('public/uploads'));
  app.use("/admin", express.static("public/adminAssets"));
  app.use("/", express.static("public/assets"));
  app.use(express.static('uploads'))
  
  //
  app.use('/',userRouter); 
  app.use('/admin',adminRouter);

app.listen(PORT,()=>{
    console.log(`server on http://localhost:${PORT}`);
})