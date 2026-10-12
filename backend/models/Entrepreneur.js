const mongoose = require("mongoose");

const entrepreneurSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80
    },
    craft: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80
    },
    location: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 1000
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 20,
      default: ""
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Entrepreneur", entrepreneurSchema);