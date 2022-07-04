require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(fileUpload({
  useTempFiles: true
}));

//Routes
app.use('/user', require('./routers/userRouter'))
app.use('/user',require('./routers/userRouter'))
app.use('/api', require('./routers/categoryRouter'))
app.use('/api', require('./routers/upload'))
app.use('/api', require('./routers/productRouter'))
app.use('/api', require('./routers/paymentRouter'))

//Connect to mongodb
const URI = process.env.MONGODB_URL;
mongoose.connect(URI,{
  useNewUrlParser: true,
  useUnifiedTopology: true
}, err =>{
  if(err) throw err;
  console.log('Connected to MonogoDB')
});

const PORT = process.env.PORT || 5000
app.listen(PORT, () =>{
  console.log('Server is running on port', PORT)
})

process.on("unhandledRejection", (err)=>{
  console.log(`Shutting server down for ${err.message}`);
  console.log("Shutting server down due to Unhandled promise rejection");
  server.close(()=>{
    process.exit(1);
  })
})