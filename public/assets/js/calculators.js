// Payment calculator (vehicle pages) and budget calculator (home + financing).
// Standard fixed-rate loan formula; estimates only.
(function () {
  var fmt = function (n) { return '$' + Math.round(n).toLocaleString('en-US'); };
  var num = function (el) { var v = parseFloat(el.value); return isFinite(v) && v > 0 ? v : 0; };

  function payment(principal, aprPct, months) {
    if (principal <= 0) return 0;
    var r = aprPct / 100 / 12;
    return r ? principal * r / (1 - Math.pow(1 + r, -months)) : principal / months;
  }
  function principalFor(pay, aprPct, months) {
    var r = aprPct / 100 / 12;
    return r ? pay * (1 - Math.pow(1 + r, -months)) / r : pay * months;
  }

  document.querySelectorAll('[data-pay-calc]').forEach(function (box) {
    var inputs = box.querySelectorAll('input, select');
    var out = box.querySelector('[data-out="payment"]');
    var short = document.querySelector('[data-out="payment-short"]');
    var price = inputs[0], down = inputs[1], term = inputs[2], apr = inputs[3];
    var defaults = { down: down.value, term: term.value, apr: apr.value };
    var calc = function (els) {
      return payment(Math.max(num(els.price) - num(els.down), 0), num(els.apr), Number(els.term.value));
    };
    var update = function () {
      out.textContent = fmt(calc({ price: price, down: down, term: term, apr: apr }));
    };
    box.addEventListener('input', update);
    update();
    // The headline estimate in the price card always uses the stated defaults.
    if (short) {
      short.textContent = fmt(payment(Math.max(Number(box.dataset.price) - Number(defaults.down), 0), Number(defaults.apr), Number(defaults.term)));
    }
  });

  document.querySelectorAll('[data-budget-calc]').forEach(function (box) {
    var inputs = box.querySelectorAll('input, select');
    var pay = inputs[0], down = inputs[1], term = inputs[2], apr = inputs[3];
    var out = box.querySelector('[data-out="budget"]');
    var link = box.querySelector('[data-out="budget-link"]');
    var update = function () {
      var total = principalFor(num(pay), num(apr), Number(term.value)) + num(down);
      var rounded = Math.floor(total / 500) * 500;
      out.textContent = fmt(rounded);
      link.href = link.getAttribute('href').split('?')[0] + (rounded > 0 ? '?price_max=' + rounded : '');
    };
    box.addEventListener('input', update);
    update();
  });
})();
