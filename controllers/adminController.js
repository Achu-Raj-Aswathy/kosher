require("dotenv").config();
const multer = require("multer");
const Rooms = require("../models/roomModel");
const fs= require('fs')
const path = require('path')

//multer
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

var upload = multer({
  storage: storage,
}).array("images", 5);

// api

const viewLoginPage = (req, res) => {
  try {
    res.render("adminLogin", { adminAlert: "" });
  } catch (error) {
    console.error(error);
  }
};

//Admin credentials
const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

const adminLogin = (req, res) => {
  try {
    if (email == req.body.email && password == req.body.password) {
      req.session.admin = req.body.email;
      req.session.isLoggedAdmin = true;
      res.redirect("/admin/dashboard");
    } else {
      res.render("adminLogin", {
        adminAlert: "Invalid Email or password",
        title: "Admin Loginpage",
      });
    }
  } catch (error) {
    console.error(error);
  }
};

const adminHome = async (req, res) => {
  try {
    res.render("dashboard", { title: "Admin Dashboard" });
  } catch (error) {
    console.error(error);
  }
};

const viewRooms = async (req, res) => {
  try {
    const rooms = await Rooms.find({});
    console.log(rooms);

    res.render("rooms", { title: "Rooms", rooms });
  } catch (error) {
    console.error(error);
  }
};

const viewCreateRoom = async (req, res) => {
  try {
    res.render("createRoom", { title: "Create Room" });
  } catch (error) {
    console.error(error);
  }
};

const viewEditRoom = async (req, res) => {
  const roomType = req.query.type;
  try {
    const room = await Rooms.findById(roomType);

    res.render("editRoom", { title: "Edit Room", room });
  } catch (error) {}
};

const viewBookings = async (req, res) => {
  try {
    res.render("bookings", { title: "Bookings" });
  } catch (error) {
    console.error(error);
  }
};

const viewReviews = async (req, res) => {
  try {
    res.render("reviews", { title: "Reviews" });
  } catch (error) {
    console.error(error);
  }
};

const createRoom = async (req, res) => {
  try {
    const { roomType, bedCapacity, numRooms, rentPerNight, roomDetails } =
      req.body;

    console.log(req.body);

    if (!roomType || !bedCapacity || !numRooms || !rentPerNight) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const roomImages = req.files.map((file) => `/uploads/${file.filename}`);

    const newHotel = new Rooms({
      roomType,
      capacity: parseInt(bedCapacity, 10),
      count: parseInt(numRooms, 10),
      price: parseFloat(rentPerNight),
      description: roomDetails,
      image: roomImages,
    });

    await newHotel.save();
    console.log("New Hotel Data:", newHotel);

    res
      .status(201)
      .json({ message: "Hotel added successfully!", hotel: newHotel });
  } catch (error) {
    console.error("Error saving hotel:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const editRoom = async (req, res) => {
  const roomId = req.query.id;

  try {
    const { roomType, bedCapacity, numRooms, rentPerNight, roomDetails } =
      req.body;

    if (!roomType || !bedCapacity || !numRooms || !rentPerNight || !roomDetails) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Extract image paths if uploaded
    const roomImages = req.files?.length > 0
      ? req.files.map((file) => `/uploads/${file.filename}`)
      : null;

    // Prepare updated data
    const updatedData = {
      roomType,
      capacity: bedCapacity,
      count: numRooms,
      price: rentPerNight,
      description: roomDetails,
    };

    // Update images only if new ones are provided
    if (roomImages) {
      updatedData.image = roomImages;
    }

    // Update the room
    const updatedRoom = await Rooms.findByIdAndUpdate(roomId, updatedData, {
      new: true,
    });

    if (!updatedRoom) {
      return res.status(404).json({ message: "Room not found." });
    }
    
    res.status(200).json({ message: "Room updated successfully", updatedRoom });
  } catch (error) {
    console.error("Error updating room:", error);
    res.status(500).json({ message: "Error updating room", error: error.message });
  }
};

const deleteRoom = async (req, res) => {
  try {
    const roomId = req.query.id;

    // Find the room by ID
    const room = await Rooms.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Delete associated images if they exist
    if (room.image && room.image.length > 0) {
      room.image.forEach((imagePath) => {
        const roomImagePath = path.join(__dirname, "..","/public", imagePath);
        fs.unlink(roomImagePath, (err) => {
          if (err) {
            console.error(`Error deleting image ${imagePath}:`, err);
          }
        });
      });
    }

    // Delete the room from the database
    await Rooms.findByIdAndDelete(roomId);
    res.status(200).json({ message: "Room deleted successfully" });

  } catch (error) {
    console.error("Error deleting room:", error);
    res.status(500).json({ message: "Error deleting room", error: error.message });
  }
};

module.exports = {
  adminHome,
  adminLogin,
  viewLoginPage,
  viewRooms,
  viewCreateRoom,
  viewEditRoom,
  viewBookings,
  viewReviews,
  createRoom,
  editRoom,
  deleteRoom,
};
