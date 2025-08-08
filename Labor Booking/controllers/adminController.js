const User = require('../models/userModel');
const Labor = require('../models/laborModel');

exports.getAdminPanel = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' });
    const labors = await Labor.find().populate('user');

    res.render('admin/panel', {
      users,
      labors
    });
  } catch (err) {
    console.log(err);
    res.send('Error loading admin panel');
  }
};
