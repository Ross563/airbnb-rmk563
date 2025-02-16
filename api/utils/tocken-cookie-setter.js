import jwt from "jsonwebtoken";

const generateTokenAndSetCookie = (userId, email, res) => {
  const token = jwt.sign({ id: userId, email }, process.env.JwtSecret, {
    expiresIn: "15d",
  });

  res.cookie("token", token, {
    maxAge: 15 * 24 * 60 * 60 * 1000,
    httpOnly: true, // prevent XSS attacks cross-site scripting attacks
    sameSite: "none", // CSRF attacks cross-site request forgery attacks
    secure: true,
  });
  //console.log("generated-Token-And-Set-Cookie : ", token);
};

export default generateTokenAndSetCookie;
