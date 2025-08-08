module.exports = (req, res, next) => {
  if (req.session.userRole !== "admin") {
    req.flash("error", "Unauthorized Access");
    return res.redirect("/login");
  }
  next();
};
