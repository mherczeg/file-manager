const fs = require("fs");
const path = require("path");
const filesize = require("filesize");

const { getFileNameByParam, relative, flashify } = require("../lib/helpers");
const { FOLDER } = require("../env");

module.exports = (req, res) => {
  res.filename = getFileNameByParam(req.params[0]);

  if (res.stats.error) {
    res.render(
      "cast",
      flashify(req, {
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
              const isdirectory = stats.isDirectory();
              const extension = f.split(".").pop();
              const isvideo = ["mkv", "mp4", "avi"].includes(extension);
              const issubtitle = ["srt"].includes(extension);
              resolve({
                name: f,
                media: path.join(res.filename, f).replace(`${FOLDER}/`, ''),
                isdirectory,
                size: filesize(stats.size),
                extension,
                isvideo,
                issubtitle,
              });
            });
          });
        });

        Promise.all(promises)
          .then((files) => {
            res.render(
              "cast",
              flashify(req, {
                path: res.filename,
                files: files,
              })
            );
          })
          .catch((err) => {
            res.render(
              "cast",
              flashify(req, {
                path: res.filename,
                errors: [err],
              })
            );
          });
      })
      .catch((err) => {
        res.render(
          "cast",
          flashify(req, {
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
