const Labor = require("../models/laborModel");

exports.getDashboard = async (req, res) => {
  try {
    const labors = await Labor.find().populate("user");
    res.render("user/dashboard", { labors });
  } catch (err) {
    res.send("Error loading dashboard");
  }
};

exports.getUserHome = async (req, res) => {
  try {
    const labors = await Labor.find().populate("user");
    res.render("user/home", { labors });
  } catch (err) {
    console.error("Error loading home page:", err);
    res.send("Error loading laborers.");
  }
};

exports.laborDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const laborDetail = await Labor.findById(id).populate("user");

    if (!laborDetail) {
      return res.status(404).send("Labor not found");
    }

    res.render("user/laborDetails", { laborDetail });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading labor details");
  }
};
