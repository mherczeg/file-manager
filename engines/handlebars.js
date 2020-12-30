const path = require("path");
const hbs = require("express-handlebars");
const octicons = require("octicons");
const handlebars = require("handlebars");
const { FOLDER } = require("../env");

module.exports = hbs({
  partialsDir: path.join(__dirname, "..", "views", "partials"),
  layoutsDir: path.join(__dirname, "..", "views", "layouts"),
  defaultLayout: "main",
  helpers: {
    octicon: (i, options) => {
      if (!octicons[i]) {
        return new handlebars.SafeString(
          octicons.question.toSVG({ fill: "currentColor" })
        );
      }
      return new handlebars.SafeString(
        octicons[i].toSVG({ fill: "currentColor", height: "24" })
      );
    },
    eachpath: (path, options) => {
      if (typeof path != "string") {
        return "";
      }
      let out = "";
      path = path.split("/");
      path.splice(path.length - 1, 1);
      if (path[0] !== "assets" && FOLDER) {
        FOLDER.split("/").forEach(() => path.shift());
      }
      path.unshift("");
      path.forEach((folder, index) => {
        out += options.fn({
          name: folder + "/",
          path: "/" + path.slice(1, index + 1).join("/"),
          current: index === path.length - 1,
        });
      });
      return out;
    },
  },
});
