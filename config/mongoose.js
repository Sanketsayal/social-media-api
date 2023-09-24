const mongoose=require('mongoose')
require('dotenv').config()
mongoose.connect(process.env.MONGO_URL)
const db=mongoose.connection
db.on('error',console.error.bind(console,'error in connecting database'))
db.once('open',function(){
    console.log('connect to database')
})

module.exports=db