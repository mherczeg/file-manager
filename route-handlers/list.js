const fs = require("fs");
const filesize = require("filesize");

const { relative, flashify } = require("../lib/helpers");
const { SHELLABLE, CMDABLE } = require('../env');

module.exports = (req, res) => {
  if (res.stats.error) {
    res.render(
      "list",
      flashify(req, {
        shellable: SHELLABLE,
        cmdable: CMDABLE,
        path: res.filename,
        errors: [res.stats.error],
      })
    );
  } else if (res.stats.isDirectory()) {
    if (!req.url.endsWith("/")) {
      return res.redirect(req.url + "/");
    }

    let readDir = new Promise((resolve, reject) => {
      fs.readdir(relative(res.filename), (err, filenames) => {
        if (err) {
          return reject(err);
        }
        return resolve(filenames);
      });
    });

    readDir
      .then((filenames) => {
        let promises = filenames.map((f) => {
          return new Promise((resolve, reject) => {
            fs.stat(relative(res.filename, f), (err, stats) => {
              if (err) {
                return reject(err);
              }
              resolve({
                name: f,
                isdirectory: stats.isDirectory(),
                size: filesize(stats.size),
              });
            });
          });
        });

        Promise.all(promises)
          .then((files) => {
            res.render(
              "list",
              flashify(req, {
                shellable: SHELLABLE,
                cmdable: CMDABLE,
                path: res.filename,
                files: files,
              })
            );
          })
          .catch((err) => {
            res.render(
              "list",
              flashify(req, {
                shellable: SHELLABLE,
                cmdable: CMDABLE,
                path: res.filename,
                errors: [err],
              })
            );
          });
      })
      .catch((err) => {
        res.render(
          "list",
          flashify(req, {
            shellable: SHELLABLE,
            cmdable: CMDABLE,
            path: res.filename,
            errors: [err],
          })
        );
      });
  } else if (res.stats.isFile()) {
    res.sendFile(relative(res.filename), {
      dotfiles: "allow",
    });
  }
};
