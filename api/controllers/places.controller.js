import cloudinary from "cloudinary";
import imageDownloader from "image-downloader";
import Place from "../models/Place.js";
import Booking from "../models/Booking.js";

const jwtSecret = process.env.JwtSecret;

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadToCloudinary(path) {
  return new Promise((resolve, reject) => {
    cloudinary.v2.uploader.upload(
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

// export function getUserDataFromReq(req) {
//   return new Promise((resolve, reject) => {
//     const { token } = req.cookies;
//     if (!token) {
//       return reject(new Error("Token not provided"));
//     }
//     jwt.verify(token, jwtSecret, {}, (err, userData) => {
//       if (err) return reject(err);
//       resolve(userData);
//     });
//   });
// }

export async function createPlace(req, res) {
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
  try {
    const userData = req.user;
    const placeDoc = await Place.create({
      owner: userData._id,
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
  } catch (e) {
    console.log("create place error:", e.message);
    res.status(500).json(e);
  }
}

export async function getUserPlaces(req, res) {
  try {
    const userData = req.user;
    const { _id } = userData;
    res.json(await Place.find({ owner: _id }));
  } catch (e) {
    console.log("get user places error:", e.message);
    res.status(500).json(e);
  }
}

export async function getPlaceById(req, res) {
  const { id } = req.params;
  try {
    res.json(await Place.findById(id));
  } catch (e) {
    console.log("get place by id error:", e.message);
    res.status(500).json(e);
  }
}

export async function updatePlace(req, res) {
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
  try {
    const userData = req.user;
    const placeDoc = await Place.findById(id);
    if (userData._id === placeDoc.owner.toString()) {
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
  } catch (e) {
    console.log("update place error:", e.message);
    res.status(500).json(e);
  }
}

export async function getAllPlaces(req, res) {
  try {
    res.json(await Place.find());
  } catch (e) {
    console.log("get all places error:", e.message);
    res.status(500).json(e);
  }
}

export function createBooking(req, res) {
  try {
    const userData = req.user;
    const { place, checkIn, checkOut, numberOfGuests, name, phone, price } =
      req.body;
    if (!userData) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    Booking.create({
      place,
      checkIn,
      checkOut,
      numberOfGuests,
      name,
      phone,
      price,
      user: userData._id,
    })
      .then((doc) => {
        res.json(doc);
      })
      .catch((err) => {
        console.error("Error creating booking:", err);
        res.status(500).json({ error: "Internal Server Error" });
      });
  } catch (e) {
    console.error("create booking error:", e.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function getBookings(req, res) {
  try {
    const userData = req.user;
    res.json(await Booking.find({ user: userData._id }).populate("place"));
  } catch (e) {
    console.log("get bookings error:", e.message);
    res.status(500).json(e);
  }
}

export async function uploadByLink(req, res) {
  const { link } = req.body;
  const newName = "photo" + Date.now() + ".jpg";
  try {
    await imageDownloader.image({
      url: link,
      dest: "/tmp/" + newName,
    });
    const url = await uploadToCloudinary("/tmp/" + newName);
    res.json(url);
  } catch (e) {
    console.log("upload by link error:", e.message);
    res.status(500).json(e);
  }
}

export async function upload(req, res) {
  const uploadedFiles = [];
  try {
    for (let i = 0; i < req.files.length; i++) {
      const { path } = req.files[i];
      const url = await uploadToCloudinary(path);
      uploadedFiles.push(url);
    }
    res.json(uploadedFiles);
  } catch (e) {
    console.log("upload error:", e.message);
    res.status(500).json(e);
  }
}
