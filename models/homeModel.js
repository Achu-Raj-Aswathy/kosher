const mongoose = require("mongoose");

const homeSchema = mongoose.Schema(
  {
    caption: {
      type: String,
    },
    tagline: {
      type: String
    },
    image: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("contents", homeSchema);
