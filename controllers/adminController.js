const User = require("../models/userModel");
const Booking = require("../models/bookingModel");
const Labor = require("../models/laborModel");

exports.getAdminPanel = async (req, res) => {
  try {
    const selectedRole = req.query.role; // 👈 get role filter from query param
    const users = selectedRole
      ? await User.find({ role: selectedRole })
      : await User.find();

    const bookings = await Booking.find()
      .populate("user")
      .populate({
        path: "labor",
        populate: { path: "user", select: "name" },
      });

    res.render("admin/panel", {
      users,
      bookings,
      selectedRole, // 👈 pass to EJS
      success: req.flash("success"),
      error: req.flash("error"),
    });
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to load admin panel");
    res.redirect("/");
  }
};

exports.getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      req.flash("error", "User not found");
      return res.redirect("/admin/panel");
    }
    res.render("admin/userDetails", { user });
  } catch (err) {
    console.error(err);
    req.flash("error", "Error fetching user details");
    res.redirect("/admin/panel");
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      req.flash("error", "User not found");
      return res.redirect("/admin/panel");
    }

    // Also delete related labor record if exists
    await Labor.findOneAndDelete({ user: req.params.id });

    // Delete related bookings
    await Booking.deleteMany({ user: req.params.id });
    await Booking.deleteMany({
      labor: (await Labor.findOne({ user: req.params.id }))?._id,
    });

    req.flash("success", "User deleted successfully");
    res.redirect("/admin/panel");
  } catch (err) {
    console.error(err);
    req.flash("error", "Error deleting user");
    res.redirect("/admin/panel");
  }
};


exports.makeUserAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      req.flash("error", "User not found.");
      return res.redirect("/admin/panel");
    }

    user.role = "admin";
    await user.save();

    req.flash("success", `${user.name} is now an admin.`);
    res.redirect("/admin/panel");
  } catch (err) {
    console.error("Error making user admin:", err);
    req.flash("error", "Failed to update user role.");
    res.redirect("/admin/panel");
  }
};

