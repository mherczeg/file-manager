"use strict";
(function () {
  const { Component, h, render, createContext } = window.preact;
  const { useContext, useState, useEffect } = window.preactHooks;
  const { state, updateStatus } = window.store;

  window.addEventListener("DOMContentLoaded", () => {
    const ws = new WebSocket(
      "ws" +
        (window.location.protocol === "https:" ? "s" : "") +
        "://" +
        window.location.host +
        "/websocket/cast"
    );

    window.addEventListener("beforeunload", () => ws.close());

    const send = ({ type, command, data }) => {
      ws.readyState === 1 &&
        ws.send(
          JSON.stringify({
            type,
            command,
            data,
          })
        );
    };

    initCastControls(send);
    ws.addEventListener("open", () => {
      ws.addEventListener("close", (e) => {
        console.log("ws closing", e);
      });
      ws.addEventListener("message", (e) => {
        const message = JSON.parse(e.data);
        switch (message.type) {
          case "serverStatus":
            updateStatus({
              data: message.data,
              status: message.data.status,
            });
            break;
          case "deviceStatus":
            updateStatus({
              data: message.data,
              status: message.data.playerState,
            });
            console.log(message);
            break;
        }
      });

      document.querySelectorAll(".cast-start").forEach((castbutton) =>
        castbutton.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          const media = castbutton.dataset.media;
          const subtitles = Array.from(
            document.querySelectorAll(".subtitle-select")
          )
            .filter(({ checked }) => checked)
            .map(({ dataset }) => dataset.media);
          send({
            type: "command",
            command: "play",
            data: { media, subtitles },
          });
        })
      );
    });
  });

  function initCastControls(send) {
    const State = createContext(state.getValue());

    const Controls = () => {
      const state = useContext(State);
      return h(
        "div",
        null,
        JSON.stringify(state),
        h(
          "button",
          {
            onClick: () =>
              send({
                type: "command",
                command: "pause",
              }),
          },
          "pause"
        ),
        h(
          "button",
          {
            onClick: () =>
              send({
                type: "command",
                command: "resume",
              }),
          },
          "resume"
        ),
        h(
          "button",
          {
            onClick: () =>
              send({
                type: "command",
                command: "stop",
              }),
          },
          "stop"
        )
      );
    };

    /** Components can just be pure functions */
    const CastControls = (props) => {
      const [appState, setAppState] = useState();

      useEffect(() => {
        const subscription = state.subscribe((newState) =>
          setAppState(newState)
        );
        return () => subscription.unsubscribe();
      }, []);

      return (
        appState &&
        h(
          State.Provider,
          { value: appState },
          h("div", null, "Hello", "World"),
          h(Controls, null)
        )
      );
    };
    const root = document.getElementById("cast-controls-root");
    if (root) {
      render(h(CastControls), root);
    }
  }
})();
