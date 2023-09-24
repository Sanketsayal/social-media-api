const Post=require('../models/postModel')
const Comment=require('../models/commentModel')
const Like=require('../models/likeModel')

module.exports.createPost=async (req,res)=>{
    const {id}=req.params
    const {content}=req.body
    try{
        let post=await Post.create({
            content: content,
            user: id
        });
        return res.status(200).json({data:{post},message:'Post Created Successfully'})
        
    }catch(err){
        console.log('error in creating a post',err);
        return res.status(500).json({message:'Internal Server Error'})
    }
    
}

module.exports.deletePost=async (req,res)=>{

}

module.exports.getPosts=async (req,res)=>{
    try{
        let post=await Post.find()
        .lean()
        .sort('-createdAt')
        .populate('user','name avatar')
        .populate({
            path:'comments',
            populate:{
                path:'user'
            }
        })
        return res.status(200).json({data:{post}})
    }catch(err){
        console.log(err);
        return res.status(500).json({message:'Internal Server Error'})
    }

}

module.exports.createComment=async (req,res)=>{
    try {
        const {id}=req.params
        let post=await Post.findById(req.body.post);
        if(post){
            let comment=await Comment.create({
                content:req.body.content,
                post:req.body.post,
                user:id
            });
            
            post.comments.push(comment);
            post.save();
            comment=await comment.populate('user','name');
            return res.status(200).json({data:comment,message:'Success'})    
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:'Internal Server Error'})
    }
}

module.exports.toggleLike= async (req,res)=>{
    const {id}=req.params
    const {postId}=req.body
    
    try {
        let likable;
        let deleted=false;
        likable=await Post.findById(postId)
        let newLike
       

        let existing=await Like.findOne({
            post:postId,
            user:id
        });
        if(existing){
            likable.likes.pull(existing.id);
            likable.save();
            existing.deleteOne()
            deleted=true;
        }
        else{
            newLike=await Like.create({
                user:id,
                post:postId
            })
            likable.likes.push(newLike.id);
            likable.save();
        }
        return res.json(200,{
            message:'request successful',
            data:{
                deleted:deleted,
                like:existing?existing:newLike
            }
        })
    } catch (error) {
        console.log(error);
        return res.json(500,{
            message:'Internal Server Error'
        });
    }
}