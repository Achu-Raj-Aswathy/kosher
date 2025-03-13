const express = require("express");
const adminRouter = express();
const auth = require("../middleware/adminAuth");
const upload = require("../multer/multer");

adminRouter.set("views", "./views/admin");

//controllers
const adminController = require("../controllers/adminController");

adminRouter.get("/login", auth.isLogout, adminController.viewLoginPage);
adminRouter.get("/logout", auth.isLogin, adminController.adminLogout);
adminRouter.get("/editProfile", auth.isLogin, adminController.viewEditProfile);

adminRouter.post("/login", adminController.adminLogin);
adminRouter.post("/edit-profile", auth.isLogin, adminController.editProfile);

adminRouter.get("/dashboard", auth.isLogin, adminController.adminHome);

adminRouter.get("/createRoom", auth.isLogin, adminController.viewCreateRoom);
adminRouter.get("/editRoom", auth.isLogin, adminController.viewEditRoom);
adminRouter.get("/rooms", auth.isLogin, adminController.viewRooms);

adminRouter.get(
  "/createBooking",
  auth.isLogin,
  adminController.viewCreateBooking
);
adminRouter.get("/bookings", auth.isLogin, adminController.viewBookings);
adminRouter.get("/editBooking", auth.isLogin, adminController.viewEditBooking);

adminRouter.get("/user-home-edit", auth.isLogin, adminController.userHomeEdit);
adminRouter.get("/reviews", auth.isLogin, adminController.viewReviews);

adminRouter.get("/gallery", auth.isLogin, adminController.viewGallery);
adminRouter.get("/createGallery", auth.isLogin, adminController.viewCreateGallery);
adminRouter.get("/createNearby", auth.isLogin, adminController.viewCreateNearby);

adminRouter.post(
  "/create-rooms",
  auth.isLogin,
  upload.array("documents", 5),
  adminController.createRoom
);
adminRouter.post("/add-booking", auth.isLogin, adminController.addBooking);
adminRouter.post(
  "/edit-user-home",
  auth.isLogin,
  upload.single("documents"),
  adminController.editUserHome
);
adminRouter.post(
  "/create-gallery",
  auth.isLogin,
  upload.array("documents", 5),
  adminController.createGallery
);
adminRouter.post(
  "/create-nearby",
  auth.isLogin,
  upload.array("documents", 5),
  adminController.createNearby
);

adminRouter.put(
  "/edit-rooms",
  auth.isLogin,
  upload.array("documents", 5),
  adminController.editRoom
);
adminRouter.put("/edit-booking", auth.isLogin, adminController.editBooking);

adminRouter.delete("/delete-room", auth.isLogin, adminController.deleteRoom);
adminRouter.delete(
  "/delete-booking",
  auth.isLogin,
  adminController.deleteBooking
);
adminRouter.delete("/delete-gallery", auth.isLogin, adminController.deleteGallery);

module.exports = adminRouter;
