const Labor = require("../models/laborModel");
const Booking = require("../models/bookingModel");
const User = require("../models/userModel");

exports.getLaborDashboard = async (req, res) => {
  try {
    let labor = await Labor.findOne({ user: req.session.userId });

    // If no labor yet, create a safe empty object for the form
    if (!labor) {
      labor = {
        area: "",
        skills: "",
        availability: "Available",
        dailyWage: "",
        experience: "",
        profileImage: null,
        user: req.session.userId,
      };
    }

    res.render("labor/dashboard", { labor });
  } catch (err) {
    console.error("Error loading labor dashboard:", err);
    res.send("Error loading labor dashboard");
  }
};

exports.viewLaborProfile = async (req, res) => {
  try {
    const labor = await Labor.findOne({ user: req.session.userId }).populate(
      "user"
    );
    const averageRating =
      labor && labor.ratings && labor.ratings.length > 0
        ? (
            labor.ratings.reduce((acc, r) => acc + r.value, 0) /
            labor.ratings.length
          ).toFixed(1)
        : null;
    const ratingCount = labor && labor.ratings ? labor.ratings.length : 0;
    res.render("labor/profile", { labor, averageRating, ratingCount });
  } catch (err) {
    console.log(err);
    res.send("Error loading profile");
  }
};

exports.getLaborRequests = async (req, res) => {
  try {
    const labor = await Labor.findOne({ user: req.session.userId }).populate(
      "user"
    );
    if (!labor) {
      req.flash("error", "Labor profile not found.");
      return res.redirect("/labor/dashboard");
    }

    const bookings = await Booking.find({ labor: labor._id })
      .populate({
        path: "user",
        select: "name mobile role profileImage",
      })
      .sort({ date: -1 });

    res.render("labor/requests", {
      bookings: bookings,
      labor, // Pass labor to the view for navbar
      success: req.flash("success"),
      error: req.flash("error"),
    });
  } catch (err) {
    console.error("Error loading booking requests:", err);
    req.flash("error", "Failed to load booking requests.");
    res.redirect("/labor/dashboard");
  }
};

exports.acceptRequest = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) return res.send("Booking not found");

    booking.status = "Accepted";

    const labor = await Labor.findById(booking.labor);
    labor.availability = "Busy";

    await booking.save();
    // console.log("Booking accepted:", booking._id, "Status:", booking.status);
    await labor.save();

    const io = req.app.get("io"); // ✅ emit update to user
    io.emit("bookingStatusChanged", {
      userId: booking.user.toString(),
      message: `Your booking request has been accepted.`,
    });

    res.redirect("/labor/requests?success=1"); // ✅ add query param
  } catch (err) {
    console.log(err);
    res.send("Error accepting request");
  }
};

exports.rejectRequest = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) return res.send("Booking not found");

    booking.status = "Rejected";
    await booking.save();
    const io = req.app.get("io");
    io.emit("bookingStatusChanged", {
      userId: booking.user.toString(),
      message: `Your booking request has been rejected.`,
    });

    res.redirect("/labor/requests");
  } catch (err) {
    console.log(err);
    res.send("Error rejecting request");
  }
};

// labour home page

exports.getLaborHome = async (req, res) => {
  console.log("getLaborHome called");
  try {
    const labor = await Labor.findOne({ user: req.session.userId });
    if (!labor) {
      return res.redirect("/labor/dashboard");
    }

    const allBookings = await Booking.find({ labor: labor._id }).populate(
      "user"
    );

    const totalBookings = allBookings.length;

    // Filter current week's bookings
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay())); // Sunday
    const bookingsThisWeek = allBookings.filter(
      (b) => new Date(b.date) >= weekStart
    ).length;

    // Get next 1–2 upcoming bookings
    const upcomingBookings = allBookings
      .filter((b) => new Date(b.date) >= new Date())
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 2);

    // Count of pending requests
    const pendingRequests = allBookings.filter(
      (b) => b.status === "Pending"
    ).length;
    // Count of incoming requests (future bookings that are pending or accepted)
    const incomingRequests = allBookings.filter(
      (b) =>
        (b.status === "Pending" || b.status === "Accepted") &&
        new Date(b.date) >= new Date()
    ).length;

    res.render("labor/home", {
      labor,
      totalBookings,
      weeklyBookings: bookingsThisWeek,
      upcomingBookings,
      pendingRequests,
      incomingRequests,
    });
  } catch (err) {
    console.error("Error loading labor home:", err);
    res.status(500).send("Failed to load labor home page.");
  }
};

exports.postLaborDetails = async (req, res) => {
  const { area, skills, availability, dailyWage, experience } = req.body;
  const profileImage = req.file ? `/uploads/${req.file.filename}` : undefined;

  try {
    let labor = await Labor.findOne({ user: req.session.userId });
    if (labor) {
      labor.area = area;
      labor.skills = skills;
      labor.availability = availability;
      labor.dailyWage = dailyWage;
      labor.experience = experience;
      if (profileImage) labor.profileImage = profileImage;
      await labor.save();
    } else {
      labor = new Labor({
        user: req.session.userId,
        area,
        skills,
        availability,
        dailyWage,
        experience,
        profileImage,
      });
      await labor.save();
    }

    req.flash("success", "Profile updated successfully!");
    res.redirect("/labor/dashboard");
  } catch (err) {
    console.error("Error saving labor details:", err);
    req.flash("error", "Error saving labor details. Please try again.");
    res.redirect("/labor/dashboard");
  }
};

exports.completeBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) {
      req.flash("error", "Booking not found.");
      return res.redirect("/labor/requests");
    }

    // Update booking status to completed
    booking.status = "Completed";
    await booking.save();

    // Update labor availability to Available
    const labor = await Labor.findById(booking.labor);
    if (labor) {
      labor.availability = "Available";
      await labor.save();
    }

    req.flash(
      "success",
      "Booking marked as completed. Your status is now Available for new bookings."
    );
    res.redirect("/labor/requests");
  } catch (err) {
    console.error("Error completing booking:", err);
    req.flash("error", "Failed to complete booking. Please try again.");
    res.redirect("/labor/requests");
  }
};
