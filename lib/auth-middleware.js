const { KEY } = require("../env");

module.exports = (req, res, next) => {
    if (!KEY) {
        return next();
    }
    if (req.session.login === true) {
        return next();
    }
    req.flash("error", "Please sign in.");
    res.redirect("/@login");
}