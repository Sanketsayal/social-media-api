const User = require("../models/userModel")
const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken')
require('dotenv').config()

module.exports.createUser=async (req,res)=>{
    try {
        const {email}=req.body
        let user=await User.findOne({email:req.body.email})
        const hashPassword=await bcrypt.hash(req.body.password,10)
        if(!user){
            user=await User.create({
                email:req.body.email,
                name:req.body.name,
                password:hashPassword,
                avatar:req.body.avatarImage
            })
            delete user._doc.password
            const accessToken=jwt.sign(
                {email},
                process.env.ACCESS_TOKEN_SECRET,
                {expiresIn:'1h'}
            )
    
            const refreshToken=jwt.sign(
                {email},
                process.env.REFRESH_TOKEN_SECRET,
                {expiresIn:'3d'}
            )
    
            res.cookie('jwt',refreshToken,{
                httpOnly: true,
                secure: true,
                signed: true,
                sameSite: 'None',
                maxAge: 3 * 24 * 60 * 60 * 1000
            })

            return res.status(200).json({data:{
                user,token:accessToken
            },message:'User Created!!!'})
        }

        return res.status(400).json({message:'User Already Exists!'})

    } catch (error) {
        console.log(error)
        return res.status(500).json({message:'Internal Server Error'})
    }
    
}

module.exports.signin=async (req,res)=>{
    try {
        const {email,password}=req.body
        let user=await User.findOne({email:email})
        if(!user){
            return res.status(401).json({message:'User not found!'})
        }
        let passwordCompare=bcrypt.compareSync(password,user.password)
        if(!passwordCompare){
            return res.status(401).json({message:'Email and Password Incorrect'})
        }
        delete user._doc.password

        const accessToken=jwt.sign(
            {email},
            process.env.ACCESS_TOKEN_SECRET,
            {expiresIn:'1h'}
        )

        const refreshToken=jwt.sign(
            {email},
            process.env.REFRESH_TOKEN_SECRET,
            {expiresIn:'3d'}
        )

        res.cookie('jwt',refreshToken,{
            httpOnly: true,
            secure: true,
            signed: true,
            sameSite: 'None',
            maxAge: 3 * 24 * 60 * 60 * 1000
        })

        return res.status(200).json({
            message:'Signing in Success!!',
            data:{
                user,
                token:accessToken
            }
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({message:'Internal Server Error'})
    }
    
}

module.exports.refresh=(req,res)=>{
    const cookies = req.signedCookies
    if (!cookies?.jwt) return res.status(401).json({ message: 'Unauthorized' })
    // check if refreshToken in cookie
    const refreshToken = cookies.jwt
    
    // jwt verify & use decoded info to generate new accessToken

    jwt.verify(
        refreshToken, 
        process.env.REFRESH_TOKEN_SECRET, 
        async (err, decoded) => {
        if(err){
            console.log(err)
            return res.status(403).json({ message: 'Forbidden' })
        } 
        
        // check if user exist
        const email = decoded.email
        const user = await User.findOne({ email: email })
        if (!user) return res.status(401).json({ message: 'Unauthorized' })

        // resign accessToken & return to the client
        const accessToken = jwt.sign(
            { email },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '1h' }
        )

        return res.json({token:accessToken})
        }
    )
}

module.exports.logout=(req,res)=>{
    const cookies = req.signedCookies
    if (!cookies?.jwt) return res.status(401).json({ message: 'Unauthorized' })
    res.clearCookie('jwt', {
        httpOnly: true,
        secure: true,
        signed: true,
        sameSite: 'None',
    })
  return res.json({ message: 'Success' })


}