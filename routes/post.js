const express=require('express')
const router=express.Router()
const postController=require('../controllers/post_controller')
const authenticateToken = require('../middleware/authenticateToken')

router.use(authenticateToken)

router.post('/create-post/:id',postController.createPost)
router.get('/get-posts',postController.getPosts)
router.post('/create-comment/:id',postController.createComment)
router.post('/toggle-like/:id',postController.toggleLike)

module.exports=router