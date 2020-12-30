const fs = require("fs");
const { relative } = require('../lib/helpers');

module.exports = (req, res) => {
  if (res.stats.error) {
    req.busboy.on("file", (key, file, filename) => {
      if (key == "file") {
        let save = fs.createWriteStream(relative(res.filename));
        file.pipe(save);
        save.on("close", () => {
          res.flash("success", "File saved. ");
          res.redirect("back");
        });
        save.on("error", (err) => {
          res.flash("error", err);
          res.redirect("back");
        });
      }
    });
    req.busboy.on("field", (key, value) => {});
    req.pipe(req.busboy);
  } else {
    req.flash("error", "File exists, cannot overwrite. ");
    res.redirect("back");
  }
};
