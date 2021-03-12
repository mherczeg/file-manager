/* jshint esversion: 6 */

$(document).ready(() => {
    $("[title]").tooltip();
});

window.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".cast-file").forEach((castbutton) =>
      castbutton.addEventListener("click", (e) => {
        e.preventDefault();
        document.cookie = `cast-media=${castbutton.dataset.media};path=/`;
        afterCookieSet(() => {
          location.href = castbutton.getAttribute('href')
        });
      })
    );
  });

const afterCookieSet = (done, count = 0) => {
  setTimeout(() => {
    ++ count;
    const cookie = document.cookie
      .split('; ')
      .find(row => row.startsWith(`cast-media=`));
    if (cookie) {
      done()
    } else if (count > 10) {
      console.error('could not set cast-media cookie in time')
    } else {
      afterCookieSet(done, count);
    }
  }, 100)
}
  
  