const { KEY } = require("../env");

module.exports = (req, res) => {
  let pass = notp.totp.verify(req.body.token.replace(" ", ""), KEY);
  console.log(pass, req.body.token.replace(" ", ""));
  if (pass) {
    req.session.login = true;
    res.redirect("/");
    return;
  }
  req.flash("error", "Bad token.");
  res.redirect("/@login");
};
