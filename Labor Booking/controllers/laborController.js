const Labor = require('../models/laborModel');
const Booking = require('../models/bookingModel');
const User = require('../models/userModel');

exports.getLaborDashboard = async (req, res) => {
  try {
    const labor = await Labor.findOne({ user: req.session.userId });
    res.render('labor/dashboard', { labor });
  } catch (err) {
    res.send('Error loading labor dashboard');
  }
};

exports.postLaborDetails = async (req, res) => {
  const { area, skills, availability, dailyWage, experience } = req.body;
  try {
    let labor = await Labor.findOne({ user: req.session.userId });
    if (labor) {
      // Update existing
      labor.area = area;
      labor.skills = skills;
      labor.availability = availability;
      labor.dailyWage = dailyWage;
      labor.experience = experience;
      await labor.save();
    } else {
      // Create new
      labor = new Labor({
        user: req.session.userId,
        area,
        skills,
        availability,
        dailyWage,
        experience
      });
      await labor.save();
    }
    res.redirect('/labor/dashboard');
  } catch (err) {
    res.send('Error saving labor details');
  }
};

exports.getLaborRequests = async (req, res) => {
  try {
    const labor = await Labor.findOne({ user: req.session.userId });

    if (!labor) return res.send("Labor profile not found.");

    const bookings = await Booking.find({ labor: labor._id })
      .populate('user') // user who booked
      .populate({ path: 'labor', populate: { path: 'user' } }) // labor.user (nested)
      .sort({ date: -1 });

    res.render('labor/requests', { bookings, success: req.query.success });

  } catch (err) {
    console.log(err);
    res.send('Error loading booking requests.');
  }
};


exports.viewLaborProfile = async (req, res) => {
  try {
    const labor = await Labor.findOne({ user: req.session.userId }).populate('user');
    res.render('labor/profile', { labor });
  } catch (err) {
    console.log(err);
    res.send('Error loading profile');
  }
};


exports.acceptRequest = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) return res.send('Booking not found');

    booking.status = 'Accepted';

    const labor = await Labor.findById(booking.labor);
    labor.availability = 'Busy';

    await booking.save();
    await labor.save();

    res.redirect('/labor/requests?success=1'); // ✅ add query param
  } catch (err) {
    console.log(err);
    res.send('Error accepting request');
  }
};


exports.rejectRequest = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) return res.send('Booking not found');

    booking.status = 'Rejected';
    await booking.save();

    res.redirect('/labor/requests');
  } catch (err) {
    console.log(err);
    res.send('Error rejecting request');
  }
};
