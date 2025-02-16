import bcrypt from "bcryptjs";
import User from "../models/User.js";
import generateTokenAndSetCookie from "../utils/tocken-cookie-setter.js";

const bcryptSalt = bcrypt.genSaltSync(10);

export async function signUp(req, res) {
  const { name, email, password } = req.body;

  try {
    const userDoc = await User.create({
      name,
      email,
      password: bcrypt.hashSync(password, bcryptSalt),
    });
    generateTokenAndSetCookie(userDoc._id, userDoc.email, res);
    res.json(userDoc);
  } catch (e) {
    console.log("user registration error:", e.message);
    res.status(422).json(e);
  }
}

export async function login(req, res) {
  const { email, password } = req.body;
  try {
    const userDoc = await User.findOne({ email });
    if (userDoc) {
      const passOk = bcrypt.compareSync(password, userDoc.password);
      if (passOk) {
        generateTokenAndSetCookie(userDoc._id, userDoc.email, res);
        res.json(userDoc);
      } else {
        res.status(422).json("pass not ok");
      }
    } else {
      res.json("user not found");
    }
  } catch (e) {
    console.log("login error:", e.message);
    res.status(500).json(e);
  }
}

export async function logout(req, res) {
  try {
    res.cookie("token", "").json(true);
  } catch (e) {
    console.log("logout error:", e.message);
    res.status(500).json(e);
  }
}

export async function getAllUsers(req, res) {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (e) {
    console.log("get all users error:", e.message);
    res.status(500).json(e);
  }
}

export async function getProfile(req, res) {
  try {
    if (req.user) {
      const { name, email, _id } = req.user;
      res.json({ name, email, _id });
    } else {
      res.json(null);
    }
  } catch (e) {
    console.log("get profile error:", e.message);
    res.status(500).json(e);
  }
}
