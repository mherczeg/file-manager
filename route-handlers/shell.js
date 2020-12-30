const { getFileNameByParam, flashify } = require("../lib/helpers");

module.exports = (req, res) => {
  res.filename = getFileNameByParam(req.params[0]);

  res.render(
    "shell",
    flashify(req, {
      path: res.filename,
    })
  );
};
