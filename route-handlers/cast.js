const path = require("path");
const { FOLDER } = require("../env");

const { flashify } = require("../lib/helpers");

module.exports = (req, res) => {
  const folderPath = (req.header('Referer') || "").replace(/https?:\/\/[^\/]+/i, "")
  res.render(
    "cast",
    flashify(req, {
      path: folderPath ? path.join(FOLDER, folderPath, 'cast') : ''
    })
  );
};
