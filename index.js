const express=require('express')
const cors=require('cors')
const db=require('./config/mongoose')
const cookieParser=require('cookie-parser');
require('dotenv').config()

const port=process.env.PORT
const app=express()
const corsOptions={
    origin:process.env.CLIENT_URL,
    credentials:true
}


app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded())
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use('/',require('./routes'))

app.listen(port,function(err){
    if(err){
        console.log('error in starting server');
    }
    console.log(`server running on port:${port}`);
})