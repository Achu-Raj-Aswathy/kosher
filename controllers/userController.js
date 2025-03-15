const Rooms = require("../models/roomModel");
const Bookings = require("../models/BookingModel");
const Reviews = require("../models/reviewModel");
const Contents = require("../models/homeModel");
const Gallery = require("../models/galleryModel");
const Nearby = require("../models/nearbyModel");
const nodemailer = require("nodemailer");
const Razorpay = require("razorpay");
const { RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY } = process.env;

const razorpay = new Razorpay({
  key_id: RAZORPAY_ID_KEY,
  key_secret: RAZORPAY_SECRET_KEY,
});

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

const viewHomepage = async (req, res) => {
  try {
    const rooms = await Rooms.find();
    const content = await Contents.findOne().sort({ createdAt: -1 });
    const ratingStats = await Reviews.aggregate([
      {
        $group: {
          _id: null,
          avgOverallRating: { $avg: "$overallRating" },
        },
      },
    ]);

    const recentReviews = await Reviews.find({
      review: { $nin: [null, ""] },
    })
      .sort({ createdAt: -1 })
      .limit(3);

    const averageRatings = ratingStats[0] || {
      avgOverallRating: 0,
    };

    const galleries = await Gallery.find().sort({ createdAt: -1 }).limit(4);

    res.render("user/userHome", {
      rooms,
      content,
      averageRatings,
      recentReviews,
      galleries,
    });
  } catch (error) {
    console.error(error);
    res.render("error", { error });
  }
};

const viewRoomList = async (req, res) => {
  try {
    const rooms = await Rooms.find();
    res.render("user/roomList", { rooms });
  } catch (error) {
    console.error(error);
    res.render("error", { error });
  }
};

const viewRoomDetails = async (req, res) => {
  const roomType = req.query.roomType;
  try {
    const rooms = await Rooms.find({ roomType: roomType });
    res.render("user/roomDetails", { rooms });
  } catch (error) {
    console.error(error);
    res.render("error", { error });
  }
};

const viewGallery = async (req, res) => {
  try {
    const galleries = await Gallery.find(); 

    res.render("user/gallery", { galleries }); 
  } catch (error) {
    console.error("Error fetching gallery:", error);
    res.render("error", { error: "Failed to load the gallery." });
  }
};

const viewContact = async (req, res) => {
  try {
    res.render("user/contact", {});
  } catch (error) {
    console.error(error);
    res.render("error", { error });
  }
};

const viewReservation = async (req, res) => {
  try {
    res.render("user/reservation", {});
  } catch (error) {
    console.error(error);
    res.render("error", { error });
  }
};

const viewAbout = async (req, res) => {
  try {
    res.render("user/about", {});
  } catch (error) {
    console.error(error);
    res.render("error", { error });
  }
};

const viewServices = async (req, res) => {
  try {
    res.render("user/services", {});
  } catch (error) {
    console.error(error);
    res.render("error", { error });
  }
};

const viewNearbyList = async (req, res) => {
  try {
    const nearby = await Nearby.find().sort({ name: 1 });
    res.render("user/nearby", { nearby });
  } catch (error) {
    console.error(error);
    res.render("error", { error });
  }
};

const viewNearbyDetails = async (req, res) => {
  const nearbyId = req.query.id;
  try {
    const nearby = await Nearby.findById(nearbyId)
    console.log(nearby);
    
    res.render("user/nearbyDetails", {nearby});
  } catch (error) {
    console.error(error);
    res.render("error", { error });
  }
};

const viewRatings = async (req, res) => {
  try {
    // Fetch all reviews and sort by most recent
    const reviews = await Reviews.find().sort({ createdAt: -1 });

    // Collect all images from each review
    const allImages = reviews.reduce((acc, img) => {
      if (Array.isArray(img.images)) {
        acc.push(...img.images); // Add images to the accumulator
      }
      return acc;
    }, []);

    res.render("user/ratings", { reviews, allImages });
  } catch (error) {
    console.error(error);
    res.render("error", { error });
  }
};

const viewReviews = async (req, res) => {
  try {
    res.render("user/reviews", {});
  } catch (error) {
    console.error(error);
    res.render("error", { error });
  }
};

const getAvailability = async (req, res) => {
  try {
    const { roomId, arrival, departure } = req.body;
    const room = await Rooms.findById(roomId);
    if (room) {
      let roomType = room.roomType;
      const existingBooking = await Bookings.find({
        roomType,
        $or: [
          {
            arrival: { $lt: new Date(departure) },
            departure: { $gt: new Date(arrival) },
          },
        ],
      });
      if (existingBooking.length < room.count) {
        return res
          .status(200)
          .json({ message: "Rooms available", available: true, room });
      } else {
        return res
          .status(200)
          .json({ message: "Rooms not available", available: false });
      }
    } else {
      console.error("No room found");
    }
  } catch (error) {
    console.error(error);
  }
};

const getReservation = async (req, res) => {
  console.log("inside book now");

  const { arrival, departure, adults, children, roomId } = req.body;
  console.log(arrival, departure, adults, children, roomId, "req");

  if (!arrival || !departure || !roomId) {
    return res.status(400).send("Missing required parameters.");
  }

  try {
    // Fetch room details from your database
    const room = await Rooms.findById(roomId);
    if (!room) {
      return res.status(404).send("Room not found.");
    }
    console.log(room, "room");

    // Render reservation page with the necessary details
    return res.status(200).json({
      room,
      arrival,
      departure,
      adults,
      children,
    });
  } catch (error) {
    console.error("Error in getReservation:", error);
    res.status(500).send("Internal Server Error.");
  }
};

const createOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    const options = {
      amount: amount * 100, // Razorpay amount is in paisa
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1, // Auto-capture payment
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error("Razorpay Error:", error);
    res.status(500).send("Error creating Razorpay order");
  }
};

const addBooking = async (req, res) => {
  console.log("AddBooking called");

  try {
    const {
      roomType,
      name,
      email,
      contact,
      amount,
      arrival,
      departure,
      bookingType,
      adults = 0,
      children = 0,
      razorpay_payment_id,
    } = req.body;

    console.log("Booking Request Data:", req.body);

    if (
      !roomType ||
      !name ||
      !email ||
      !contact ||
      !amount ||
      !arrival ||
      !departure ||
      !bookingType ||
      children == null ||
      adults == null
    ) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const noOfPerson = parseInt(children, 10) + parseInt(adults, 10);
    const paid = razorpay_payment_id ? 1 : 0;

    console.log("Saving");
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
      paid,
    });

    await newBooking.save();

    console.log("New Booking Created:", newBooking);

    const paidStatus = paid === 1 ? "Yes" : "No";

    if (paid === 1) {
     
      const paymentSuccessHtml = `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <div style="text-align: center; background-color: #4CAF50; padding: 20px; border-radius: 8px; color: white;">
            <h1>💳 Payment Successful! 💳</h1>
            <p>Hello <strong>${name}</strong>, your payment was successfully processed!</p>
          </div>

          <div style="padding: 20px;">
            <h2 style="color: #4CAF50;">Payment Details:</h2>
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
              <tr style="background-color: #f2f2f2;">
                <th style="text-align: left; padding: 12px; border-bottom: 1px solid #ddd;">Item</th>
                <th style="text-align: left; padding: 12px; border-bottom: 1px solid #ddd;">Price</th>
              </tr>
              <tr><td style="padding: 12px;">🏨 Room Price:</td><td>₹${amount}</td></tr>
            </table>
          </div>

          <footer style="text-align: center; padding: 10px; background: #4CAF50; color: white; border-radius: 0 0 8px 8px;">
            <p>Need help? Contact us at <a href="mailto:${process.env.EMAIL_SUPPORT}" style="color: white; text-decoration: underline;">Support</a></p>
          </footer>
        </div>
      `;

      const paymentMailOptions = {
        from: process.env.EMAIL_SUPPORT,
        to: email,
        subject: "💳 Payment Successful!",
        html: paymentSuccessHtml,
      };

      await transporter.sendMail(paymentMailOptions);
      console.log("Payment success email sent to user");
    }

    const userEmailHeader = `
  <div style="text-align: center; background-color: #4CAF50; padding: 20px; border-radius: 8px; color: white;">
    <h1>🎉 Booking Confirmed! 🎉</h1>
    <p>Hello <strong>${name}</strong>, your booking is successfully confirmed!</p>
  </div>
`;

    const emailHtmlBase = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        
        <div style="padding: 20px;">
          <h2 style="color: #4CAF50;">Booking Details:</h2>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <tr style="background-color: #f2f2f2;">
              <th style="text-align: left; padding: 12px; border-bottom: 1px solid #ddd;">Field</th>
              <th style="text-align: left; padding: 12px; border-bottom: 1px solid #ddd;">Details</th>
            </tr>
            <tr><td style="padding: 12px;">🏨 Room Type:</td><td>${roomType}</td></tr>
            <tr><td style="padding: 12px;">👤 Name:</td><td>${name}</td></tr>
            <tr><td style="padding: 12px;">📧 Email:</td><td>${email}</td></tr>
            <tr><td style="padding: 12px;">📞 Contact:</td><td>${contact}</td></tr>
            <tr><td style="padding: 12px;">📅 Arrival:</td><td>${arrival}</td></tr>
            <tr><td style="padding: 12px;">🚪 Departure:</td><td>${departure}</td></tr>
            <tr><td style="padding: 12px;">👨‍👩‍👧 Number of Guests:</td><td>${noOfPerson}</td></tr>
            <tr><td style="padding: 12px;">📖 Booking Type:</td><td>${bookingType}</td></tr>
            <tr><td style="padding: 12px;">💰 Amount:</td><td>₹${amount}</td></tr>
            <tr><td style="padding: 12px; font-weight: bold;">✅ Paid:</td><td>${paidStatus}</td></tr>
          </table>
        </div>
      </div>
    `;

    const userExtraContent = `
      <p style="margin-top: 20px;">Thank you for choosing our service. We look forward to hosting you! 😊</p>
      <footer style="text-align: center; padding: 10px; background: #4CAF50; color: white; border-radius: 0 0 8px 8px;">
        <p>Need help? Contact us at <a href="mailto:${process.env.EMAIL_SUPPORT}" style="color: white; text-decoration: underline;">Support</a></p>
      </footer>
    `;

    const userMailOptions = {
      from: process.env.EMAIL_SUPPORT,
      to: email,
      subject: "🎟️ Your Booking is Confirmed!",
      html: userEmailHeader + emailHtmlBase + userExtraContent,
    };

    const adminMailOptions = {
      from: process.env.EMAIL_SUPPORT,
      to: process.env.EMAIL_SUPPORT,
      subject: "📢 New Booking Alert!",
      html: emailHtmlBase,
    };

    await transporter.sendMail(userMailOptions);
    await transporter.sendMail(adminMailOptions);

    res
      .status(201)
      .json({ message: "Booking added successfully!", booking: newBooking });
  } catch (error) {
    console.error("Error saving booking:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const addReview = async (req, res) => {
  try {
    const { overallRating, name, review } = req.body;

    if (!overallRating || !name) {
      return res.status(400).json({ message: "All fields are required." });
    }
    const profileImage = req.files["profileImage"]
      ? `/uploads/${req.files["profileImage"][0].filename}`
      : null;
    const images = req.files["images"]
      ? req.files["images"].map((file) => `/uploads/${file.filename}`)
      : [];

    console.log("Profile Image:", profileImage);
    console.log("Uploaded Images:", images);

    const newReview = new Reviews({
      name,
      overallRating,
      review,
      profileImage: profileImage,
      images: images,
    });

    await newReview.save();
    console.log("New Review Data:", newReview);

    res
      .status(200)
      .json({ message: "Review added successfully!", review: newReview });
  } catch (error) {
    console.error("Error saving review:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const contact = async (req, res) => {
  const { name, email, phone, message } = req.body;

  if (!name || !email || !phone || !message) {
    return res.json({ success: false, message: "All fields are required!" });
  }

  // Nodemailer Transporter Setup
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_SUPPORT, // Your admin email
      pass: process.env.EMAIL_PASS, // Your email password or App Password
    },
  });

  let mailOptions = {
    from: email, // User's email
    to: process.env.EMAIL_SUPPORT, // Admin email to receive messages
    subject: `New Contact Form Submission from ${name}`,
    html: `
      <h3>Contact Details:</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Message:</strong> ${message}</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "Message sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.json({
      success: false,
      message: "Failed to send message. Please try again later.",
    });
  }
};

const viewPrivacy = async (req, res) => {
  try {
    res.render("user/privacy", {});
  } catch (error) {
    console.error(error);
    res.render("error", { error });
  }
};

const viewTerms = async (req, res) => {
  try {
    res.render("user/tc", {});
  } catch (error) {
    console.error(error);
    res.render("error", { error });
  }
};

module.exports = {
  viewHomepage,
  viewRoomList,
  viewRoomDetails,
  viewGallery,
  viewContact,
  viewReservation,
  viewAbout,
  viewServices,
  viewNearbyList,
  viewNearbyDetails,
  viewRatings,
  viewReviews,
  getAvailability,
  getReservation,
  createOrder,
  addBooking,
  addReview,
  contact,
  viewPrivacy,
  viewTerms
};
