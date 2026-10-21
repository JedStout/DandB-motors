// Inventory search, filters and sorting. All vehicles are in the HTML (good for SEO and no-JS
// visitors); this hides and reorders cards. Filters are kept in the URL so results can be shared,
// and the old DealerCenter parameters (price_min, price_max, sort_by) still work.
(function () {
  var form = document.querySelector('[data-filters]');
  var grid = document.querySelector('.vgrid');
  if (!form || !grid) return;
  var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-vehicle]'));
  var countEl = document.querySelector('[data-count]');
  var empty = document.querySelector('[data-empty]');
  var resets = document.querySelectorAll('[data-reset]');
  var f = form.elements;
  var presetMake = f.make.value; // make pages preselect their make

  var sorters = {
    price_asc: function (a, b) { return a.dataset.price - b.dataset.price; },
    price_desc: function (a, b) { return b.dataset.price - a.dataset.price; },
    miles_asc: function (a, b) { return (a.dataset.miles || 1e9) - (b.dataset.miles || 1e9); },
    miles_desc: function (a, b) { return b.dataset.miles - a.dataset.miles; },
    year_desc: function (a, b) { return b.dataset.year - a.dataset.year || a.dataset.price - b.dataset.price; },
    year_asc: function (a, b) { return a.dataset.year - b.dataset.year; },
    make_asc: function (a, b) { return a.dataset.make.localeCompare(b.dataset.make); },
    make_desc: function (a, b) { return b.dataset.make.localeCompare(a.dataset.make); },
  };

  // Read the URL into the form
  var p = new URLSearchParams(location.search);
  var setIf = function (el, val) {
    if (!val) return;
    if (el.tagName === 'SELECT') {
      var match = Array.prototype.find.call(el.options, function (o) { return o.value.toLowerCase() === val.toLowerCase(); });
      if (match) el.value = match.value;
      else if (el === f.price_max) { // old links like ?price_max=12000: add the exact value as an option
        var o = new Option('Under $' + Number(val).toLocaleString('en-US'), val);
        el.add(o); el.value = val;
      }
    } else el.value = val;
  };
  setIf(f.q, p.get('q'));
  setIf(f.body, p.get('body'));
  setIf(f.make, p.get('make'));
  setIf(f.price_max, p.get('price_max'));
  setIf(f.drive, p.get('drive'));
  setIf(f.sort_by, p.get('sort_by'));
  var priceMin = Number(p.get('price_min')) || 0;

  function apply(push) {
    var q = f.q.value.trim().toLowerCase();
    var words = q ? q.split(/\s+/) : [];
    var body = f.body.value, make = f.make.value, max = Number(f.price_max.value) || Infinity, drive = f.drive.value;
    var shown = 0;

    cards.forEach(function (c) {
      var d = c.dataset;
      var ok = (!body || d.body === body) &&
        (!make || d.make === make) &&
        Number(d.price) <= max && Number(d.price) >= priceMin &&
        (!drive || (drive === '4x4' ? /AWD|4WD/.test(d.drive) : d.drive === drive)) &&
        words.every(function (w) { return d.search.indexOf(w) !== -1; });
      c.hidden = !ok;
      if (ok) shown++;
    });

    var sorted = cards.slice().sort(sorters[f.sort_by.value] || sorters.price_asc);
    sorted.forEach(function (c) { grid.appendChild(c); });

    countEl.textContent = shown === 1 ? '1 vehicle' : shown + ' vehicles';
    if (empty) empty.hidden = shown > 0;
    grid.hidden = shown === 0;
    var filtered = q || body || (make && make !== presetMake) || max !== Infinity || drive || priceMin;
    resets.forEach(function (r) { r.hidden = !filtered && r.closest('.results-bar') !== null; });

    if (push) {
      var next = new URLSearchParams();
      if (q) next.set('q', f.q.value.trim());
      if (body) next.set('body', body);
      if (make && make !== presetMake) next.set('make', make);
      if (max !== Infinity) next.set('price_max', max);
      if (drive) next.set('drive', drive);
      if (f.sort_by.value !== 'price_asc') next.set('sort_by', f.sort_by.value);
      var qs = next.toString();
      history.replaceState(null, '', location.pathname + (qs ? '?' + qs : ''));
    }
  }

  var t;
  form.addEventListener('input', function (e) {
    clearTimeout(t);
    t = setTimeout(function () { apply(true); }, e.target === f.q ? 180 : 0);
  });
  resets.forEach(function (r) {
    r.addEventListener('click', function () {
      form.reset();
      f.make.value = presetMake;
      priceMin = 0;
      apply(true);
      f.q.focus();
    });
  });
  apply(false);
})();
