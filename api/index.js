import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cloudinary from "cloudinary";
import multer from "multer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import {
  signUp,
  login,
  logout,
  getAllUsers,
  getProfile,
} from "./controllers/user.controller.js";
import {
  createPlace,
  getUserPlaces,
  getPlaceById,
  updatePlace,
  getAllPlaces,
  createBooking,
  getBookings,
  uploadByLink,
  upload,
} from "./controllers/places.controller.js";
import protectRoute from "./middlewares/protectRoute.js";

dotenv.config();
const app = express();

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const photosMiddleware = multer({ dest: "/tmp" }); // Configure multer

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(__dirname + "/uploads"));
app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:5173", "https://airbnb-rmk563-ui.vercel.app"],
  })
);

app.get("/test", (req, res) => {
  mongoose.connect(process.env.MONGO_URL);
  res.json("test ok");
});

app.post("/register", signUp);
app.post("/login", login);
app.post("/logout", protectRoute, logout);
app.get("/", getAllUsers);
app.get("/profile", protectRoute, getProfile);

app.post("/places", protectRoute, createPlace);
app.get("/user-places", protectRoute, getUserPlaces);
app.get("/places/:id", getPlaceById);
app.put("/places", protectRoute, updatePlace);
app.get("/places", getAllPlaces);
app.post("/bookings", protectRoute, createBooking);
app.get("/bookings", protectRoute, getBookings);
app.post("/upload-by-link", protectRoute, uploadByLink);

app.post(
  "/upload",
  protectRoute,
  photosMiddleware.array("photos", 100),
  upload
); // Use the new controller function

app.listen(3000, () => {
  mongoose.connect(process.env.MONGO_URL);
  console.log(`Server Running on port ${3000}`);
});
