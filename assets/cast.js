/* jshint esversion: 6 */

$(document).ready(() => {
  let ws = new WebSocket(
    "ws" +
      (window.location.protocol === "https:" ? "s" : "") +
      "://" +
      window.location.host +
      "/websocket/cast"
  );
  ws.addEventListener("open", () => {
    ws.addEventListener("close", (e) => {
      console.log("ws closing", e);
    });
    ws.addEventListener("message", (e) => {
      console.log("ws message", e);
    });

    ws.send(JSON.stringify("init"));

    document.querySelectorAll(".cast-start").forEach((castbutton) =>
      castbutton.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const media = castbutton.dataset.media;
        ws.send(
          JSON.stringify({
            type: "command",
            command: "play",
            data: { media },
          })
        );
      })
    );
  });
});
