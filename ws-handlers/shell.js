
const pty = require("node-pty");
const querystring = require("querystring");
const { relative } = require("../lib/helpers");
const { SHELL } = require("../env");

const shellArgs = SHELL.split(" ");
const exec = SHELL == "login" ? "/usr/bin/env" : shellArgs[0];
const args = SHELL == "login" ? ["login"] : shellArgs.slice(1);

const initShell = (socket, request) => {
  const { path } = querystring.parse(request.url.split("?")[1]);
  let cwd = relative(path);
  let term = pty.spawn(exec, args, {
    name: "xterm-256color",
    cols: 80,
    rows: 30,
    cwd: cwd,
  });
  console.log(
    "pid " + term.pid + " shell " + process.env.SHELL + " started in " + cwd
  );

  term.on("data", (data) => {
    socket.send(data, { binary: true });
  });
  term.on("exit", (code) => {
    console.log("pid " + term.pid + " ended");
    socket.close();
  });
  socket.on("message", (data) => {
    // special messages should decode to Buffers
    if (Buffer.isBuffer(data)) {
      switch (data.readUInt16BE(0)) {
        case 0:
          term.resize(data.readUInt16BE(1), data.readUInt16BE(2));
          return;
      }
    }
    term.write(data);
  });
  socket.on("close", () => {
    term.end();
  });
};

module.exports = { initShell };
