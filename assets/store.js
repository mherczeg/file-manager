"use strict";

(function () {
  const { BehaviorSubject } = window.rxjs;
  const state = new BehaviorSubject({
    deviceStatus: { status: "initial", data: {} },
    playStatus: "initial",
  });

  const getPlayStatusByDeviceStatus = (deviceStatus) => {
    return "initial";
  };

  const updateStatus = (deviceStatus) => {
    state.next({
      ...state.getValue(),
      deviceStatus,
      playStatus: getPlayStatusByDeviceStatus(deviceStatus),
    });
  };

  window.store = {
    updateStatus,
    state,
  };
})();
