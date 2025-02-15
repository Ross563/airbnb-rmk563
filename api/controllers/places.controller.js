const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Place = require("../models/Place.js");
const Booking = require("../models/Booking.js");
const cloudinary = require("cloudinary").v2;
const imageDownloader = require("image-downloader");

const jwtSecret = process.env.JwtSecret;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadToCloudinary(path) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      path,
      { folder: "airbnb_clone" },
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result.secure_url);
        }
      }
    );
  });
}

function getUserDataFromReq(req) {
  return new Promise((resolve, reject) => {
    jwt.verify(req.cookies.token, jwtSecret, {}, async (err, userData) => {
      if (err) throw err;
      resolve(userData);
    });
  });
}

async function createPlace(req, res) {
  mongoose.connect(process.env.MONGO_URL);
  const { token } = req.cookies;
  const {
    title,
    address,
    addedPhotos,
    description,
    price,
    perks,
    extraInfo,
    checkIn,
    checkOut,
    maxGuests,
  } = req.body;
  jwt.verify(token, jwtSecret, {}, async (err, userData) => {
    if (err) throw err;
    const placeDoc = await Place.create({
      owner: userData.id,
      price,
      title,
      address,
      photos: addedPhotos,
      description,
      perks,
      extraInfo,
      checkIn,
      checkOut,
      maxGuests,
    });
    res.json(placeDoc);
  });
}

async function getUserPlaces(req, res) {
  mongoose.connect(process.env.MONGO_URL);
  const { token } = req.cookies;
  jwt.verify(token, jwtSecret, {}, async (err, userData) => {
    const { id } = userData;
    res.json(await Place.find({ owner: id }));
  });
}

async function getPlaceById(req, res) {
  mongoose.connect(process.env.MONGO_URL);
  const { id } = req.params;
  res.json(await Place.findById(id));
}

async function updatePlace(req, res) {
  mongoose.connect(process.env.MONGO_URL);
  const { token } = req.cookies;
  const {
    id,
    title,
    address,
    addedPhotos,
    description,
    perks,
    extraInfo,
    checkIn,
    checkOut,
    maxGuests,
    price,
  } = req.body;
  jwt.verify(token, jwtSecret, {}, async (err, userData) => {
    if (err) throw err;
    const placeDoc = await Place.findById(id);
    if (userData.id === placeDoc.owner.toString()) {
      placeDoc.set({
        title,
        address,
        photos: addedPhotos,
        description,
        perks,
        extraInfo,
        checkIn,
        checkOut,
        maxGuests,
        price,
      });
      await placeDoc.save();
      res.json("ok");
    }
  });
}

async function getAllPlaces(req, res) {
  mongoose.connect(process.env.MONGO_URL);
  res.json(await Place.find());
}

async function createBooking(req, res) {
  mongoose.connect(process.env.MONGO_URL);
  const userData = await getUserDataFromReq(req);
  const { place, checkIn, checkOut, numberOfGuests, name, phone, price } =
    req.body;
  Booking.create({
    place,
    checkIn,
    checkOut,
    numberOfGuests,
    name,
    phone,
    price,
    user: userData.id,
  })
    .then((doc) => {
      res.json(doc);
    })
    .catch((err) => {
      throw err;
    });
}

async function getBookings(req, res) {
  mongoose.connect(process.env.MONGO_URL);
  const userData = await getUserDataFromReq(req);
  res.json(await Booking.find({ user: userData.id }).populate("place"));
}

async function uploadByLink(req, res) {
  const { link } = req.body;
  const newName = "photo" + Date.now() + ".jpg";
  await imageDownloader.image({
    url: link,
    dest: "/tmp/" + newName,
  });
  const url = await uploadToCloudinary("/tmp/" + newName);
  res.json(url);
}

async function upload(req, res) {
  const uploadedFiles = [];
  for (let i = 0; i < req.files.length; i++) {
    const { path } = req.files[i];
    const url = await uploadToCloudinary(path);
    uploadedFiles.push(url);
  }
  res.json(uploadedFiles);
}

module.exports = {
  createPlace,
  getUserPlaces,
  getPlaceById,
  updatePlace,
  getAllPlaces,
  createBooking,
  getBookings,
  uploadToCloudinary,
  getUserDataFromReq,
  uploadByLink,
  upload,
};
