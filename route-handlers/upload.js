const fs = require("fs");
const path = require("path");
const { getFileNameByParam, relative } = require("../lib/helpers");

module.exports = (req, res) => {
  res.filename = getFileNameByParam(req.params[0]);

  const tempFile = `upload-${new Date().getTime()}`;

  let progress = 0;
  let logDebounce;

  req.busboy.on("file", (key, stream) => {
    // check file size
    const writeStream = fs.createWriteStream(relative(res.filename, tempFile));

    writeStream.on("error", (err) => {
      req.flash("error", err);
      res.redirect("back");
    });

    /*
  // progress without ajax submit? http://jsfiddle.net/jsbo6yya/
          stream.on("data", (chunk) => {
              progress += Buffer.byteLength(chunk);
              if (!logDebounce) {
                  logDebounce = true;
                  setTimeout(() => {
                      logDebounce = false;
                      req.flash("success", `${Math.floor((progress/1024)/1024)} MB`);
                      console.log();
                  }, 1000)
              }
          });
  
          */
    stream.pipe(writeStream);
  });

  req.busboy.on("field", (key, value) => {
    if (key == "saveas") {
      new Promise((resolve, reject) => {
        // check if file already exists
        fs.stat(relative(res.filename, value), (err, stats) =>
          err ? resolve() : reject("File exists, cannot overwrite. ")
        );
      })
        .then(
          () =>
            new Promise((resolve, reject) => {
              fs.rename(
                path.join(res.filename, tempFile),
                path.join(res.filename, value),
                (err) => {
                  if (err) {
                    reject(err);
                  } else {
                    fs.stat(relative(res.filename, value), (err, stats) =>
                      resolve(
                        !stats.size
                          ? "File saved. Warning: empty file."
                          : "File saved."
                      )
                    );
                  }
                }
              );
            })
        )
        .then((success) => {
          req.flash("success", success);
        })
        .catch(
          (error) =>
            new Promise((resolve) => {
              // delete temp file on error
              fs.unlink(relative(res.filename, tempFile), () => {
                req.flash("error", JSON.stringify(error));
                resolve();
              });
            })
        )
        .finally(() => {
          res.redirect("back");
        });
    }
  });

  req.pipe(req.busboy);
};
