const path = require("path");
const { KEY, FOLDER } = require("../env");

function relative(...paths) {
  return paths.reduce((a, b) => path.join(a, b), process.cwd());
}
function flashify(req, obj) {
  let error = req.flash("error");
  if (error && error.length > 0) {
    if (!obj.errors) {
      obj.errors = [];
    }
    obj.errors.push(error);
  }
  let success = req.flash("success");
  if (success && success.length > 0) {
    if (!obj.successes) {
      obj.successes = [];
    }
    obj.successes.push(success);
  }
  obj.isloginenabled = !!KEY;
  return obj;
}

function getFileNameByParam(param) {
    const withFolder = !FOLDER || param.indexOf("assets") === 0 ? param : path.join(FOLDER, param);
    const withoutRoute = withFolder.replace('@cast', '').replace('@shell', '').replace('@cmd', '');
    return withoutRoute;
};

module.exports = { relative, flashify, getFileNameByParam };
