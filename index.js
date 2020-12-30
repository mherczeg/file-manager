#!/usr/bin/env node

/* jshint esversion: 6 */
/* jshint node: true */
"use strict";

const express = require("express");
const bodyparser = require("body-parser");
const session = require("express-session");
const busboy = require("connect-busboy");
const flash = require("connect-flash");
const WebSocket = require("ws");

const path = require("path");
const { SESSION_HASH, PORT, SHELLABLE, CMDABLE } = require("./env");
const { initShell } = require("./ws-handlers/shell");
const url = require("url");

// configure express
let app = express();
let http = app.listen(PORT);

app.set("views", path.join(__dirname, "views"));
app.engine("handlebars", require("./engines/handlebars"));
app.set("view engine", "handlebars");

app.use(
  "/bootstrap",
  express.static(path.join(__dirname, "node_modules/bootstrap/dist"))
);
app.use(
  "/octicons",
  express.static(path.join(__dirname, "node_modules/octicons/build"))
);
app.use(
  "/jquery",
  express.static(path.join(__dirname, "node_modules/jquery/dist"))
);
app.use(
  "/filesize",
  express.static(path.join(__dirname, "node_modules/filesize/lib"))
);
app.use(
  "/xterm",
  express.static(path.join(__dirname, "node_modules/xterm/dist"))
);
app.use("/assets", express.static(path.join(__dirname, "assets")));

app.use(
  session({
    secret: SESSION_HASH,
  })
);
app.use(flash());
app.use(busboy());
app.use(bodyparser.urlencoded());
app.use(require("./lib/auth-middleware"));

// routes
app.all("/*", require("./route-handlers/file-stats"));
app.get("/@logout", require("./route-handlers/logout"));
app.get("/@login", require("./route-handlers/login-page"));
app.post("/@login", require("./route-handlers/login-form"));
// currently unused
app.put("/*", require("./route-handlers/file-put"));
app.post("/*@upload", require("./route-handlers/upload"));
app.post("/*@mkdir", require("./route-handlers/mkdir"));
app.post("/*@delete", require("./route-handlers/delete"));
app.get("/*@download", require("./route-handlers/download"));
if (SHELLABLE || CMDABLE) {
  // currently unused
  app.post("/*@cmd", require("./route-handlers/cmd"));
  app.get("/*@shell", require("./route-handlers/shell"));
}

// need to be last, catch-all
app.get("/*", require("./route-handlers/list"));

// configure websocket
const ws = new WebSocket.Server({ server: http });
ws.on("connection", (socket, request) => {
  const { pathname } =  url.parse(request.url);
  const [, wsEnpoint] = pathname.split("/").filter((part) => !!part);
  switch (wsEnpoint) {
    case "shell":
      if (SHELLABLE || CMDABLE) {
        initShell(socket, request);
      }
      break;
  }
});
