const ChromecastAPI = require("chromecast-api");
const ip = require("ip");
const { PORT } = require("../env");

const localIp = ip.address();
const toStreamUrl = (file) => `http://${localIp}:${PORT}/${file}`;

const initCast = (socket) => {
  const client = new ChromecastAPI();
  const send = ({ type, data }) =>
    socket.readyState === 1 &&
    socket.send(
      JSON.stringify({
        type,
        data,
      })
    );
  const sendError = (error) => {
    if (error)
      send({
        type: "serverStatus",
        data: {
          status: "error",
          error,
        },
      });
  };
  let device;
  const setDevice = (newDevice) => {
    device = newDevice;

    device.on("status", (status) => {
      send({
        type: "deviceStatus",
        data: status,
      });
    });

    device.on("connected", () => {
      send({
        type: "severStatus",
        data: {
          status: "connected",
          name: device.name,
          friendlyName: device.friendlyName,
        },
      });
    });

    send({
      type: "serverStatus",
      data: {
        status: "newdevice",
        name: device.name,
        friendlyName: device.friendlyName,
      },
    });
  };

  client.on("device", (device) => {
    setDevice(device);
  });

  socket.on("message", (message) => {
    const { type, command, data } = JSON.parse(message);
    if (type === "command") {
      device.getStatus((status) => {
        console.log(device, status);
        switch (command) {
          case "play":
            const media = {
              url: toStreamUrl(data.media),
              subtitles: data.subtitles.map((subtitle) => ({
                language: "en-US",
                name: "subtitle",
                url: toStreamUrl(subtitle),
              })),
            };
            device.play(media, sendError);
            break;
          case "pause":
            device.pause(sendError);
            break;
          case "resume":
            device.resume(sendError);
            break;
          case "stop":
            device.stop(sendError);
            break;
        }
      });
    }
  });

  socket.on("close", () => {
    console.log("socket closed");
  });
};

module.exports = { initCast };
