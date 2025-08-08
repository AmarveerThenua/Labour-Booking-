const Booking = require("../models/bookingModel");
const Labor = require("../models/laborModel");

// Book Labor
exports.bookLabor = async (req, res) => {
  const userId = req.session.userId;
  const userRole = req.session.userRole;
  const laborId = req.params.laborId;

  if (!userId) return res.redirect("/login");

  if (userRole !== "user") {
    req.flash("error", "Only users can send booking requests.");
    return res.redirect("/home");
  }

  try {
    const labor = await Labor.findById(laborId);
    if (!labor) return res.status(404).send("Labor not found");

    // Only block if already active booking exists
    const existing = await Booking.findOne({
      user: userId,
      labor: laborId,
      status: { $in: ["Pending", "Accepted"] },
    });

    if (existing) {
      req.flash("error", "You already have an active booking request for this labor.");
      return res.redirect("/home");
    }

    // Save new booking
    const booking = new Booking({
      user: userId,
      labor: laborId,
      status: "Pending",
    });

    await booking.save();

    // Emit socket notification to labor (if using Socket.io)
    const io = req.app.get("io");

    const laborUser = await Labor.findById(laborId).populate("user");
    if (laborUser && laborUser.user) {
      io.emit("newBookingRequest", {
        laborUserId: laborUser.user._id.toString(),
        message: `You have a new booking request from a user.`,
      });
    }

    req.flash("success", "Booking request sent successfully!");
    return res.redirect("/home");
  } catch (err) {
    console.error("Booking failed:", err);
    req.flash("error", "Something went wrong while booking.");
    return res.redirect("/home");
  }
};

// Admin: View all bookings
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user")
      .populate({ path: "labor", populate: { path: "user" } })
      .sort({ date: -1 });

    res.render("admin/bookings", { bookings });
  } catch (err) {
    res.send("Error loading bookings");
  }
};

// User: View their booking requests
exports.getUserRequests = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.session.userId })
      .populate({ path: "labor", populate: { path: "user" } })
      .sort({ date: -1 });

    res.render("user/requests", { bookings });
  } catch (err) {
    res.send("Error loading your bookings");
  }
};

// Labor: Mark a booking as Completed
exports.completeBooking = async (req, res) => {
  try {
    const bookingId = req.params.bookingId;
    await Booking.findByIdAndUpdate(bookingId, { status: "Completed" });

    req.flash("success", "Booking marked as completed.");
    res.redirect("/labor/requests");
  } catch (err) {
    console.error("Error marking booking as completed:", err);
    req.flash("error", "Could not mark booking as completed.");
    res.redirect("/labor/requests");
  }
};

// User: Rate a labor after completed booking
exports.rateLabor = async (req, res) => {
  console.log('rateLabor called', { params: req.params, body: req.body, userId: req.session.userId });
  const userId = req.session.userId;
  const bookingId = req.params.bookingId;
  const { laborId, rating } = req.body;

  if (!userId) return res.redirect("/login");
  if (!laborId || !rating) return res.redirect("/my-requests");

  try {
    // Find the booking and validate
    const booking = await Booking.findById(bookingId);
    if (!booking || booking.user.toString() !== userId.toString() || booking.status !== 'Completed' || booking.rated) {
      req.flash("error", "Invalid or already rated booking.");
      return res.redirect("/my-requests");
    }

    // Add rating to labor
    const labor = await Labor.findById(laborId);
    if (!labor) {
      req.flash("error", "Labor not found.");
      return res.redirect("/my-requests");
    }
    labor.ratings.push({ user: userId, booking: bookingId, value: parseInt(rating) });
    await labor.save();

    // Mark booking as rated
    booking.rated = true;
    await booking.save();

    req.flash("success", "Thank you for rating this labor!");
    res.redirect("/my-requests");
  } catch (err) {
    console.error("Error rating labor:", err);
    req.flash("error", "Could not submit rating. Please try again.");
    res.redirect("/my-requests");
  }
};
