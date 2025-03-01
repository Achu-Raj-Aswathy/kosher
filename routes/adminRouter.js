const express = require('express')
const app = express()
const adminRouter = express()
const upload = require('../multer/multer')

adminRouter.set('views','./views/admin')

//controllers
const adminController = require('../controllers/adminController')


adminRouter.get("/login",adminController.viewLoginPage)

adminRouter.post('/login',adminController.adminLogin)

adminRouter.get('/dashboard',adminController.adminHome)

adminRouter.get('/createRoom',adminController.viewCreateRoom)
adminRouter.get('/editRoom',adminController.viewEditRoom)
adminRouter.get('/rooms',adminController.viewRooms)

adminRouter.get('/createBooking',adminController.viewCreateBooking)
adminRouter.get('/bookings',adminController.viewBookings)

adminRouter.get('/reviews',adminController.viewReviews)



adminRouter.post('/create-rooms',upload.array('documents',5),adminController.createRoom)

adminRouter.put('/edit-rooms',upload.array('documents',5),adminController.editRoom)

adminRouter.delete('/delete-room',adminController.deleteRoom)


module.exports = adminRouter;