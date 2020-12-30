const { KEY } = require("../env");

module.exports = (req, res) => {
  if (KEY) {
    req.session.login = false;
    req.flash("success", "Signed out.");
    res.redirect("/@login");
    return;
  }
  req.flash("error", "You were never logged in...");
  res.redirect("back");
};
