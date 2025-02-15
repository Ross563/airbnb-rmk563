const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const {
  signUp,
  login,
  logout,
  getAllUsers,
  getProfile,
} = require("./controllers/user.controller.js");
const {
  createPlace,
  getUserPlaces,
  getPlaceById,
  updatePlace,
  getAllPlaces,
  createBooking,
  getBookings,
  uploadByLink,
  upload,
} = require("./controllers/places.controller.js");

require("dotenv").config();
const app = express();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const photosMiddleware = multer({ dest: "/tmp" }); // Configure multer

app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(__dirname + "/uploads"));
app.use(
  cors({
    credentials: true,
    origin: "https://airbnb-rmk563-ui.vercel.app",
  })
);

app.get("/test", (req, res) => {
  mongoose.connect(process.env.MONGO_URL);
  res.json("test ok");
});

app.post("/register", signUp);
app.post("/login", login);
app.post("/logout", logout);
app.get("/", getAllUsers);
app.get("/profile", getProfile);

app.post("/places", createPlace);
app.get("/user-places", getUserPlaces);
app.get("/places/:id", getPlaceById);
app.put("/places", updatePlace);
app.get("/places", getAllPlaces);
app.post("/bookings", createBooking);
app.get("/bookings", getBookings);
app.post("/upload-by-link", uploadByLink);

app.post("/upload", photosMiddleware.array("photos", 100), upload); // Use the new controller function

app.listen(4000);
