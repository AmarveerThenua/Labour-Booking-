const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const userController = require('../controllers/userController');
const bookingController = require('../controllers/bookingController');



// Register Page
router.get('/register', (req, res) => {
  res.render('auth/register');
});

// Register POST
router.post('/register', async (req, res) => {
  const { name, email, mobile, password, role } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.send('User already exists');

    // Only allow 'user' or 'labor' from form, never 'admin'
    const allowedRole = ['user', 'labor'].includes(role) ? role : 'user';

    const user = new User({ name, email, mobile, password, role: allowedRole });
    await user.save();
    res.redirect('/login');
  } catch (err) {
    console.log(err);
    res.send('Registration Error');
  }
});

// Login Page
router.get('/login', (req, res) => {
  res.render('auth/login');
});

// Login POST
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.send('User not found');

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.send('Invalid credentials');

    req.session.userId = user._id;
    req.session.userRole = user.role;

    if (user.role === 'user') return res.redirect('/dashboard');
    if (user.role === 'labor') return res.redirect('/labor/dashboard');
    if (user.role === 'admin') return res.redirect('/admin/panel');
  } catch (err) {
    console.log(err);
    res.send('Login Error');
  }
});

router.get('/dashboard', userController.getDashboard);

router.get('/book/:laborId', bookingController.bookLabor);


router.get('/my-requests', bookingController.getUserRequests);

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

module.exports = router;
