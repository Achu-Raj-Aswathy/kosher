const mongoose = require("mongoose");

const bookingSchema = mongoose.Schema({
  roomType: {
    type: String,
    enum: ["deluxe", "twin"],
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  contact: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  noOfPerson: {
    type: Number,
    required: true,
  },
  arrival: {
    type: Date,
    required: true,
  },
  departure: {
    type: Date,
    required: true,
  },
  bookingType: {
    type: String,
    enum: ["online","onsite"],
    required: true,
  },
  paid: {
    type: Boolean,
    required: true,
    default: true
  },
});

module.exports = mongoose.model("Bookings", bookingSchema);
