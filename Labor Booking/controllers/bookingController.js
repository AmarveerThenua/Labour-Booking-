const Booking = require("../models/bookingModel");
const Labor = require("../models/laborModel");

exports.bookLabor = async (req, res) => {
  const userId = req.session.userId;
  const laborId = req.params.laborId;

  try {
    const labor = await Labor.findById(laborId);

    const booking = new Booking({
      user: userId,
      labor: laborId,
      status: "Pending", // <-- Not accepted yet
    });

    await booking.save();
    
    res.redirect("/dashboard");
  } catch (err) {
    console.log(err);
    res.send("Booking failed");
  }
};

// View all bookings (admin)
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user") // who made the booking
      .populate({ path: "labor", populate: { path: "user" } }) // get labor + labor's user details
      .sort({ date: -1 });

    res.render("admin/bookings", { bookings });
  } catch (err) {
    res.send("Error loading bookings");
  }
};

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
