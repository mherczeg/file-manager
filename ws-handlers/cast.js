const ChromecastAPI = require("chromecast-api");
const ip = require('ip');
const { FOLDER } = require("../env");

const localIp = ip.address();

const initCast = (socket) => {
  const client = new ChromecastAPI();
  let device;
  const setDevice = (newDevice) => {
    device = newDevice;

    device.on("status", (status) => {
      socket.send(JSON.stringify(status));
    });

    device.on("connected", (e) => {
      socket.send(JSON.stringify(e));
    });

    socket.send(
      JSON.stringify({
        type: "status",
        status: "newdevice",
        data: {
          name: device.name,
          friendlyName: device.friendlyName,
        },
      })
    );
  };

  client.on("device", (device) => {
    setDevice(device);
  });

  socket.on("message", (message) => {
    const { type, command, data } = JSON.parse(message);
    if (type === "command") {
      console.log(FOLDER);
      if (command === "play") {
        device.play(`http://${localIp}:8084/${data.media}`, (err) => {
          if (err) return socket.send(JSON.stringify(err));
        });
      }
    }
  });

  socket.on("close", () => {
    console.log("socket closed");
  });
};

module.exports = { initCast };
