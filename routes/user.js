const express=require('express')
const router=express.Router()
const userController=require('../controllers/user_controller')

router.post('/sign-up',userController.createUser)
router.post('/sign-in',userController.signin)
router.post('/refresh',userController.refresh)
router.post('logout',userController.logout)

module.exports=router