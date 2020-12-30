const base32 = require("thirty-two");

const PORT = process.env.PORT || 8080;
const FOLDER = process.env.FOLDER || "";
const SESSION_HASH = process.env.SESSION_HASH || "default";
const KEY = process.env.KEY
  ? base32.decode(process.env.KEY.replace(/ /g, ""))
  : null;
const SHELLABLE = process.env.SHELL != "false" && process.env.SHELL;
const CMDABLE = process.env.CMD != "false" && process.env.CMD;
const SHELL = process.env.SHELL || "";

module.exports = {
  FOLDER,
  SESSION_HASH,
  KEY,
  PORT,
  SHELLABLE,
  CMDABLE,
  SHELL
};
