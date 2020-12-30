module.exports = (req, res) => {
  res.render("login", flashify(req, {}));
};
