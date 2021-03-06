window.addEventListener("DOMContentLoaded", () => {
  const cjs = new Castjs();
  cjs.on("available", () => {
    console.log(cjs.status);

    const castFile = sessionStorage.getItem("cast-file");
    if (castFile) {
      sessionStorage.removeItem("cast-file");
      cjs.cast(castFile);
    }
  });

  cjs.on("connect", () => {
    console.log(cjs.status);
  });

  document.querySelectorAll(".cast-start").forEach((castbutton) =>
    castbutton.addEventListener("click", (e) => {
      if (!cjs.available) return;
      e.preventDefault();
      e.stopPropagation();
      cjs.cast(castbutton.dataset.media);
    })
  );
});

/* class ChromeCastService {
  constructor() {
    this.castSession = null;

    this.sessionRequest = new chrome.cast.SessionRequest(
      chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID
    );
    const apiConfig = new chrome.cast.ApiConfig(
      this.sessionRequest,
      (session) => {
        // sessionListener
        console.log("Received ChromeCast session", session);
        this.castSession = session;
      },
      (receiverAvailability) => {
        // receiverListener
        if (
          receiverAvailability === chrome.cast.ReceiverAvailability.AVAILABLE
        ) {
          console.log("Chromecast receivers are available");
        } else if (
          receiverAvailability === chrome.cast.ReceiverAvailability.NAVAILABLE
        ) {
          console.log("No Chromecast receiver available");
        }
      }
    );
    chrome.cast.initialize(
      apiConfig,
      (...args) => {
        console.log("Successful ChromeCast initialization", args);
      },
      (error) => {
        console.log("ChromeCast initialization failed", error);
      }
    );
  }

  // Lets the user select a ChromeCast and opens the player on the big screen
  selectDevice() {
    console.log("Opening ChromeCast device selection prompt");
    return new Promise((resolve, reject) => {
      chrome.cast.requestSession(
        (session) => {
          // ChromeCast should now show an empty media player on the screen. You're ready to stream
          console.log("Successfully connected to ChromeCast", session);
          sessionStorage.setItem('cast-session-id', session.sessionId)
          this.castSession = session;
          resolve(this.castSession);
        },
        (error) => {
          console.log("Connection to ChromeCast failed", error);
          reject(error);
        },
        this.sessionRequest
      );
    });
  }

  isConnectedToDevice() {
    return this.castSession && this.castSession.status === "connected";
  }

  setMedia(mediaUrl, subtitlesUrl, contentType) {
    const mediaInfo = new chrome.cast.media.MediaInfo(mediaUrl, contentType);
    let subtitlesPreparationPromise = Promise.resolve();
    if (subtitlesUrl) {
      // Check if the subs exist
      subtitlesPreparationPromise = axios.head(subtitlesUrl).then(
        () => {
          const subtitles = new chrome.cast.media.Track(
            1,
            chrome.cast.media.TrackType.TEXT
          );
          subtitles.trackContentId = subtitlesUrl;
          subtitles.trackContentType = "text/vtt";
          subtitles.subtype = chrome.cast.media.TextTrackType.SUBTITLES;
          subtitles.name = "English Subtitles"; // Can be in any language
          subtitles.language = "en-US"; // Can be in any language
          subtitles.customData = null;
          mediaInfo.tracks = [subtitles];
          mediaInfo.activeTrackIds = [1];
        },
        () => {}
      );
    }

    subtitlesPreparationPromise.then(() => {
      const loadRequest = new chrome.cast.media.LoadRequest(mediaInfo);
      this.castSession.loadMedia(
        loadRequest,
        (media) => {
          console.log("Media loaded successfully");
          const tracksInfoRequest = new chrome.cast.media.EditTracksInfoRequest(
            [1]
          );
          media.editTracksInfo(
            tracksInfoRequest,
            (s) => console.log("Subtitles loaded"),
            (e) => console.log(e)
          );
        },
        (errorCode) => {
          console.error(errorCode);
        }
      );
    });
  }
}
/*
let ChromeCast = null;
window["__onGCastApiAvailable"] = function (isAvailable) {
  if (isAvailable) {
    ChromeCast = new ChromeCastService();
  }
};

window.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".cast-start").forEach((castbutton) =>
    castbutton.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      ChromeCast.setMedia(castbutton.dataset.media);
    })
  );

  document.querySelector("#join").addEventListener("click", ({ target }) => {
    ChromeCast.selectDevice();
  });
});
*/
