// Vehicle photo gallery: thumbnails, previous/next buttons, arrow keys and swipe.
// Without JavaScript each thumbnail simply links to the full-size photo.
(function () {
  var g = document.querySelector('[data-gallery]');
  if (!g) return;
  var stage = g.querySelector('[data-stage]');
  var counter = g.querySelector('[data-counter]');
  var thumbs = Array.prototype.slice.call(g.querySelectorAll('[data-thumb]'));
  var name = stage.alt.replace(/, photo .*$/, '');
  var i = 0;

  function show(n) {
    i = (n + thumbs.length) % thumbs.length;
    stage.src = thumbs[i].href;
    stage.alt = name + ', photo ' + (i + 1) + ' of ' + thumbs.length;
    counter.textContent = (i + 1) + ' / ' + thumbs.length;
    thumbs.forEach(function (t, k) { t.setAttribute('aria-current', k === i ? 'true' : 'false'); });
    thumbs[i].scrollIntoView({ block: 'nearest', inline: 'nearest' });
    // warm the next photo
    new Image().src = thumbs[(i + 1) % thumbs.length].href;
  }

  thumbs.forEach(function (t, k) {
    t.addEventListener('click', function (e) { e.preventDefault(); show(k); });
  });
  g.querySelector('[data-prev]').addEventListener('click', function () { show(i - 1); });
  g.querySelector('[data-next]').addEventListener('click', function () { show(i + 1); });
  g.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') show(i - 1);
    if (e.key === 'ArrowRight') show(i + 1);
  });

  var x0 = null;
  stage.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 40) show(dx < 0 ? i + 1 : i - 1);
    x0 = null;
  });
})();
