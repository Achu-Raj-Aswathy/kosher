const express = require("express");
const userController = require("../controllers/userController");
const upload = require("../multer/multer");

const userRouter = express();

// userRouter.set('views','views/user');

userRouter.get("/", userController.viewHomepage);
userRouter.get("/room-list", userController.viewRoomList);
userRouter.get("/room-details", userController.viewRoomDetails);
userRouter.get("/gallery", userController.viewGallery);
userRouter.get("/contact", userController.viewContact);
userRouter.get("/reservation", userController.viewReservation);
userRouter.get("/about", userController.viewAbout);
userRouter.get("/services", userController.viewServices);
userRouter.get("/nearby", userController.viewNearbyList);
userRouter.get("/nearby-details", userController.viewNearbyDetails);
userRouter.get("/ratings", userController.viewRatings);
userRouter.get("/reviews", userController.viewReviews);
userRouter.get("/privacy-policy", userController.viewPrivacy);
userRouter.get("/terms-and-conditions", userController.viewTerms);

userRouter.post("/availability", userController.getAvailability);
userRouter.post("/get-reservation", userController.getReservation);
userRouter.post("/create-order", userController.createOrder);
userRouter.post("/add-booking", userController.addBooking);
userRouter.post("/contact", userController.contact)
userRouter.post(
  "/submit-review",
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "images", maxCount: 5 },
  ]),
  userController.addReview
);


module.exports = userRouter;
