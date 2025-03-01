const express = require('express')
const userController = require('../controllers/userController')

const userRouter = express();


// userRouter.set('views','views/user');

userRouter.get('/',userController.viewHomepage)
userRouter.get('/room-list',userController.viewRoomList)
userRouter.get('/room-details',userController.viewRoomDetails)
userRouter.get('/gallery',userController.viewGallery)
userRouter.get('/contact',userController.viewContact)
userRouter.get('/reservation',userController.viewReservation)
userRouter.get('/about',userController.viewAbout)
userRouter.get('/services',userController.viewServices)
userRouter.get('/nearby',userController.viewNearbyList)
userRouter.get('/nearby-details',userController.viewNearbyDetails)
userRouter.get('/ratings',userController.viewRatings)

module.exports = userRouter;