const Labor = require('../models/laborModel');

exports.getDashboard = async (req, res) => {
  try {
    const labors = await Labor.find().populate('user');
    res.render('user/dashboard', { labors });
  } catch (err) {
    res.send('Error loading dashboard');
  }
};
