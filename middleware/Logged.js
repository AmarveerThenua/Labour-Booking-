module.exports = (req, res, next) => {
  if (req.session.userId) {
    // Redirect based on role
    const role = req.session.userRole;
    if (role === "admin") return res.redirect("/admin/panel");
    if (role === "labor") return res.redirect("/labor/home");
    if (role === "user") return res.redirect("/home");
  } else {
    // If not logged in, allow access
    next();
  }
};
