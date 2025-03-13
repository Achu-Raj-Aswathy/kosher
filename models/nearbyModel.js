const mongoose = require("mongoose");

const nearbySchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  distance: {
    type: Number,
    required: true,
  },
  map: {
    type: String,
    required: true,
  },
  image: {
    type: Array,
    required: true,
  },
  time: {
    start: { type: String, required: true },
    end: { type: String, required: true },
  },
});

module.exports = mongoose.model("nears", nearbySchema);
