const fs = require("fs");
const { getFileNameByParam, relative } = require('../lib/helpers');

module.exports = (req, res, next) => {
  res.filename = getFileNameByParam(req.params[0]);

  let fileExists = new Promise((resolve, reject) => {
    // check if file exists
    fs.stat(relative(res.filename), (err, stats) => {
      if (err) {
        return reject(err);
      }
      return resolve(stats);
    });
  });

  fileExists
    .then((stats) => {
      res.stats = stats;
      next();
    })
    .catch((err) => {
      res.stats = { error: err };
      next();
    });
};
