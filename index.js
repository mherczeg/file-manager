#!/usr/bin/env node

/* jshint esversion: 6 */
/* jshint node: true */
"use strict";

const http = require("http");
const https = require("https");
const express = require("express");
const bodyparser = require("body-parser");
const session = require("express-session");
const cors = require("cors");
const busboy = require("connect-busboy");
const flash = require("connect-flash");
const WebSocket = require("ws");
const fs = require("fs");
const { version } = require("./package.json");

const path = require("path");
const {
  SESSION_HASH,
  PORT,
  SHELLABLE,
  CMDABLE,
  HTTPS_PORT,
} = require("./env");

const { initShell } = require("./ws-handlers/shell");
const url = require("url");

const createSecureServer = (app, key, cert) => {
  const privateKey = fs.readFileSync(key, "utf8");
  const certificate = fs.readFileSync(cert, "utf8");

  const credentials = { key: privateKey, cert: certificate };
  return https.createServer(credentials, app);
};

// configure express
const app = express();
const httpServer = http.createServer(app);
const httpsServer = createSecureServer(app, HTTPS_KEY, HTTPS_CERT);
httpServer.listen(PORT);
httpsServer.listen(HTTPS_PORT);

// needed for cast subtitles
app.use(cors());

app.set("views", path.join(__dirname, "views"));

app.engine("handlebars", require("./engines/handlebars"));
app.set("view engine", "handlebars");

const staticContent = (path) => express.static(path, { maxAge: 1 });
app.use(
  "/bootstrap",
  staticContent(path.join(__dirname, "node_modules/bootstrap/dist"))
);
app.use(
  "/octicons",
  staticContent(path.join(__dirname, "node_modules/octicons/build"))
);
app.use(
  "/jquery",
  staticContent(path.join(__dirname, "node_modules/jquery/dist"))
);
app.use(
  "/filesize",
  staticContent(path.join(__dirname, "node_modules/filesize/lib"))
);
app.use(
  "/xterm",
  staticContent(path.join(__dirname, "node_modules/xterm/dist"))
);
app.use(
  "/node_modules/preact/dist",
  staticContent(path.join(__dirname, "node_modules/preact/dist"))
);
app.use(
  "/node_modules/preact/hooks/dist",
  staticContent(path.join(__dirname, "node_modules/preact/hooks/dist"))
);
app.use(
  "/node_modules/rxjs/bundles",
  staticContent(path.join(__dirname, "node_modules/rxjs/bundles"))
);

app.use(
  "/cast-controls/build",
  staticContent(path.join(__dirname, "cast-controls/build"))
);
app.use("/assets", staticContent(path.join(__dirname, "assets")));

app.use(
  session({
    secret: SESSION_HASH,
  })
);
app.use(flash());
app.use(busboy());
app.use(bodyparser.urlencoded());
app.use(require("./lib/auth-middleware"));

// on the cast page, we want to force https, otherwise chrome won't allow us to cast
app.all("/*@cast", (req, res, next) => {
  if (!req.secure) {
    res.redirect(`https://${req.hostname}:${HTTPS_PORT}${req.url}`);
  }
  else next();
});

// everywhere else force http, partly becuase dealing with https is pointless, 
// and partly because we need to serve the media files on http for the receiver
// the reason with that is even if we configure a CA and self signed certificates on the local network,
// there is no way to authorize that CA on the cast device
app.all("/*", (req, res, next) => {
  if (req.secure && !req.url.match(/\/*@cast/)){
    res.redirect(`http://${req.hostname}:${PORT}${req.url}`);
  } 
  else next();
});

// routes
app.all("/*", require("./route-handlers/file-stats"));
app.get("/@logout", require("./route-handlers/logout"));
app.get("/@login", require("./route-handlers/login-page"));
app.post("/@login", require("./route-handlers/login-form"));
app.put("/*", require("./route-handlers/file-put")); // currently unused
app.post("/*@upload", require("./route-handlers/upload"));
app.post("/*@mkdir", require("./route-handlers/mkdir"));
app.post("/*@delete", require("./route-handlers/delete"));
app.get("/*@download", require("./route-handlers/download"));
app.get("/*@cast", require("./route-handlers/cast"));
if (SHELLABLE || CMDABLE) {
  app.post("/*@cmd", require("./route-handlers/cmd")); // currently unused
  app.get("/*@shell", require("./route-handlers/shell"));
}

// need to be last, catch-all
app.get("/*", require("./route-handlers/list"));

// configure websocket
const ws = new WebSocket.Server({ server: httpServer });
ws.on("connection", (socket, request) => {
  const { pathname } = url.parse(request.url);
  const [, wsEnpoint] = pathname.split("/").filter((part) => !!part);
  switch (wsEnpoint) {
    case "shell":
      if (SHELLABLE || CMDABLE) {
        initShell(socket, request);
      }
      break;
    case "cast":
      initCast(socket, request);
      break;
  }
});
