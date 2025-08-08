const express = require("express");
const User = require("../models/userModel");
const router = express.Router();
const userController = require("../controllers/userController");
const bookingController = require("../controllers/bookingController");
const loggedIn = require("../middleware/Logged.js");
// Register Page
router.get("/register", loggedIn, (req, res) => {
  res.render("auth/register");
});

// Register POST
router.post("/register", loggedIn, async (req, res) => {
  const { name, email, mobile, password, role } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.send("User already exists");

    // Only allow 'user' or 'labor' from form, never 'admin'
    const allowedRole = ["user", "labor"].includes(role) ? role : "user";

    const user = new User({ name, email, mobile, password, role: allowedRole });
    await user.save();
    res.redirect("/login");
  } catch (err) {
    console.log(err);
    res.send("Registration Error");
  }
});

// Login Page
router.get("/login", loggedIn, (req, res) => {
  res.render("auth/login");
});

// Login POST
router.post("/login", loggedIn, async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      req.flash("error", "You don`t have an Account");
      return res.redirect("/login");
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      req.flash("error", "Invalid password");
      return res.redirect("/login");
    }

    req.session.userId = user._id;
    req.session.userRole = user.role;

    if (user.role === "user") return res.redirect("/home");
    if (user.role === "labor") return res.redirect("/labor/home");
    if (user.role === "admin") return res.redirect("/admin/panel");
  } catch (err) {
    console.log(err);
    res.send("Login Error");
  }
});

// Home page for logged-in users (browse laborers)
router.get("/home", userController.getUserHome);

// Public home page route (for non-logged in users)
router.get("/landing", (req, res) => {
  res.render("home");
});

router.post("/book/:laborId", bookingController.bookLabor);

router.get("/my-requests", bookingController.getUserRequests);

// Logout
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

router.post("/rate/:bookingId", bookingController.rateLabor);

//Labour Details
router.get("/laborDetails/:id", userController.laborDetails);

module.exports = router;
