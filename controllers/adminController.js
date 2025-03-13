require("dotenv").config();
const multer = require("multer");
const Admin = require("../models/adminModel");
const bcrypt = require("bcrypt");
const Rooms = require("../models/roomModel");
const Bookings = require("../models/BookingModel");
const Contents = require("../models/homeModel");
const Gallery = require("../models/galleryModel");
const Reviews = require("../models/reviewModel");
const Nearby = require("../models/nearbyModel")
const fs = require("fs");
const path = require("path");

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

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.render("adminLogin", { adminAlert: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.render("adminLogin", { adminAlert: "Invalid credentials" });
    }

    // Store relevant admin info in session
    req.session.admin_id = admin._id;
    req.session.adminEmail = admin.email;

    res.redirect("/admin/dashboard");
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).send("Internal Server Error");
  }
};

const adminLogout = (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.error("Error while signing out:", err);
        return res.status(500).send("Error occurred during signout.");
      }
      res.clearCookie("connect.sid"); 
      res.redirect("/admin/login"); 
    });
  } catch (error) {
    console.log(error.message);
  }
};

const viewEditProfile = async (req, res) => {
  try {
    if (!req.session.admin_id) {
      return res.redirect("/admin/login");
    }

    const admin = await Admin.findById(req.session.admin_id);

    if (!admin) {
      return res.redirect("/admin/login", { adminAlert: "" });
    }

    res.render("editProfile", {
      title: "Edit Profile",
      admin,
    });
  } catch (error) {
    console.error("Edit Profile Error:", error);
    res.status(500).send("Internal Server Error");
  }
};

const editProfile = async(req, res) => {
  try {
    if (!req.session.admin_id) {
      return res.redirect("/admin/login");
    }

    const { name, email, password } = req.body;

    // Create an update object
    const updateData = { name, email };

    // If a new password is provided, hash it
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    // Update admin profile
    await Admin.findByIdAndUpdate(req.session.admin_id, updateData);

    res.redirect("/admin/dashboard");
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).send("Internal Server Error");
  }
}

const adminHome = async (req, res) => {
  try {
    const totalRooms = await Rooms.countDocuments();
    const totalBookings = await Bookings.countDocuments();
    const totalReviews = await Reviews.countDocuments();
    const bookings = await Bookings.find({});

    res.render("dashboard", {
      title: "Admin Dashboard",
      totalRooms,
      totalBookings,
      totalReviews,
      bookings,
    });
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
    const bookings = await Bookings.find({});
    console.log(bookings);

    res.render("bookings", { title: "Bookings", bookings });
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

    if (
      !roomType ||
      !bedCapacity ||
      !numRooms ||
      !rentPerNight ||
      !roomDetails
    ) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Extract image paths if uploaded
    const roomImages =
      req.files?.length > 0
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
    res
      .status(500)
      .json({ message: "Error updating room", error: error.message });
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
        const roomImagePath = path.join(__dirname, "..", "/public", imagePath);
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
    res
      .status(500)
      .json({ message: "Error deleting room", error: error.message });
  }
};

const viewCreateBooking = async (req, res) => {
  try {
    res.render("createBooking", { title: "Create Booking" });
  } catch (error) {
    console.error(error);
  }
};

const addBooking = async (req, res) => {
  console.log("AddBooking");
  try {
    const {
      roomType,
      noOfPerson,
      name,
      email,
      contact,
      amount,
      arrival,
      departure,
      bookingType,
      paid,
    } = req.body;

    console.log(req.body);

    if (
      !roomType ||
      !noOfPerson ||
      !name ||
      !email ||
      !contact ||
      !amount ||
      !arrival ||
      !departure ||
      !bookingType
    ) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const newBooking = new Bookings({
      roomType,
      name,
      email,
      contact: parseInt(contact, 10),
      price: parseFloat(amount),
      arrival,
      departure,
      noOfPerson,
      bookingType,
      paid: paid ?? true,
    });

    await newBooking.save();
    console.log("New Booking Data:", newBooking);

    res
      .status(201)
      .json({ message: "Booking added successfully!", booking: newBooking });
  } catch (error) {
    console.error("Error saving booking:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const userHomeEdit = async (req, res) => {
  try {
    res.render("userHomeEdit", { title: "User Home Edit" });
  } catch (error) {
    console.error(error);
  }
};

const editUserHome = async (req, res) => {
  try {
    const { caption, tagline } = req.body;

    console.log(req.body);

    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const newContent = new Contents({
      caption,
      tagline,
      image,
    });

    await newContent.save();
    console.log("New Content Data:", newContent);

    res
      .status(201)
      .json({ message: "content added successfully!", content: newContent });
  } catch (error) {
    console.error("Error saving content:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const viewGallery = async (req, res) => {
  try {
    const galleries = await Gallery.find({});

    res.render("gallery", { title: "Gallery", galleries });
  } catch (error) {
    console.error(error);
  }
};

const viewCreateGallery = async (req, res) => {
  try {
    res.render("createGallery", { title: "Create Gallery" });
  } catch (error) {
    console.error(error);
  }
};

const createGallery = async (req, res) => {
  try {
    const gallery = req.files.map((file) => `/uploads/${file.filename}`);
    gallery.forEach(async(img) => {

      const newGallery = new Gallery({
        image: img,
      });
  
      await newGallery.save();
    })

    res
      .status(201)
      .json({ message: "Gallery added successfully!" });
  } catch (error) {
    console.error("Error saving gallery:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const deleteGallery = async (req, res) => {
  try {
    const imageId = req.query.id;

    // Find the room by ID
    const image = await Gallery.findById(imageId);
    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }

    // Delete associated images if they exist
    if (image.image) {
      const imagePath = path.join(__dirname, "..", "public", image.image);
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error(`Error deleting image ${imagePath}:`, err);
        }
      });
    }

    // Delete the room from the database
    await Gallery.findByIdAndDelete(imageId);
    res.status(200).json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("Error deleting image:", error);
    res
      .status(500)
      .json({ message: "Error deleting image", error: error.message });
  }
};

const deleteBooking = async (req, res) => {
  try {
    const bookingId = req.query.id;

    // Find the room by ID
    const booking = await Bookings.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Delete the room from the database
    await Bookings.findByIdAndDelete(bookingId);
    res.status(200).json({ message: "Booking deleted successfully" });
  } catch (error) {
    console.error("Error deleting booking:", error);
    res
      .status(500)
      .json({ message: "Error deleting booking", error: error.message });
  }
};

const viewEditBooking = async (req, res) => {
  const bookingId = req.query.bookingId;
  try {
    const booking = await Bookings.findById(bookingId);

    res.render("editBooking", { title: "Edit Booking", booking });
  } catch (error) {}
};

const editBooking = async (req, res) => {
  const bookingId = req.query.id;

  try {
    const {
      roomType,
      noOfPerson,
      name,
      email,
      contact,
      amount,
      arrival,
      departure,
      bookingType,
      paid,
    } = req.body;

      if (
        !roomType ||
        !noOfPerson ||
        !name ||
        !email ||
        !contact ||
        !amount ||
        !arrival ||
        !departure ||
        !bookingType
      ) {
        return res.status(400).json({ message: "All fields are required." });
      }

    // Prepare updated data
    const updatedData = {
      roomType,
      name,
      email,
      contact: parseInt(contact, 10),
      price: parseFloat(amount),
      arrival,
      departure,
      noOfPerson,
      bookingType,
      paid: paid ?? true,
    };

    // Update the room
    const updatedBooking = await Bookings.findByIdAndUpdate(bookingId, updatedData, {
      new: true,
    });

    if (!updatedBooking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    res.status(200).json({ message: "Booking updated successfully", updatedBooking });
  } catch (error) {
    console.error("Error updating booking:", error);
    res
      .status(500)
      .json({ message: "Error updating booking", error: error.message });
  }
};

const viewCreateNearby = async (req, res) => {
  try {
    res.render("createNearby", { title: "Create Nearby" });
  } catch (error) {
    console.error(error);
  }
};

const createNearby = async (req, res) => {
  try {
    const { name, description, distance, map, start, end } =
      req.body;

    console.log(req.body);

    if (!name || !description || !distance || !map || !start || !end) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const nearbyImages = req.files.map((file) => `/uploads/${file.filename}`);

    const newNearby = new Nearby({
      name,
      description,
      distance,
      map,
      time: {start, end},
      image: nearbyImages,
    });

    await newNearby.save();
    console.log("New Nearby Data:", newNearby);

    res
      .status(201)
      .json({ message: "Nearby added successfully!", nearby: newNearby });
  } catch (error) {
    console.error("Error saving nearby:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  adminHome,
  adminLogin,
  adminLogout,
  viewLoginPage,
  viewEditProfile,
  editProfile,
  viewRooms,
  viewCreateRoom,
  viewEditRoom,
  viewBookings,
  viewReviews,
  createRoom,
  editRoom,
  deleteRoom,
  viewCreateBooking,
  addBooking,
  userHomeEdit,
  editUserHome,
  viewGallery,
  viewCreateGallery,
  createGallery,
  deleteGallery,
  deleteBooking,
  viewEditBooking,
  editBooking,
  viewCreateNearby,
  createNearby,
};
