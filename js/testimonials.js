(function () {
  var track = document.getElementById("testimonial-track");
  if (!track) return;
  var prev = document.getElementById("testimonial-prev");
  var next = document.getElementById("testimonial-next");
  var bar = document.getElementById("testimonial-bar");

  function step() {
    var card = track.querySelector(".testimonial-card");
    return card ? card.offsetWidth + 24 : 300;
  }
  function update() {
    var max = track.scrollWidth - track.clientWidth;
    var ratio = max > 0 ? track.scrollLeft / max : 0;
    var width = Math.max(0.2, track.clientWidth / track.scrollWidth);
    bar.style.width = width * 100 + "%";
    bar.style.left = ratio * (1 - width) * 100 + "%";
    prev.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft >= max - 2;
  }
  prev.addEventListener("click", function () { track.scrollBy({ left: -step(), behavior: "smooth" }); });
  next.addEventListener("click", function () { track.scrollBy({ left: step(), behavior: "smooth" }); });
  track.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();
})();
