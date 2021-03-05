/* jshint esversion: 6 */

$(document).ready(() => {
    $("[title]").tooltip();
});

window.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".cast-file").forEach((castbutton) =>
      castbutton.addEventListener("click", (e) => {
        sessionStorage.setItem('cast-media', castbutton.dataset.media);
      })
    );
  });
  
  