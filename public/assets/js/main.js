(function () {
  // Mobile menu
  var btn = document.querySelector('.menu-toggle');
  var nav = document.getElementById('nav');
  if (btn && nav) {
    var setOpen = function (open) {
      nav.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    btn.addEventListener('click', function () { setOpen(!nav.classList.contains('open')); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) { setOpen(false); btn.focus(); }
    });
  }

  // Pre-select a vehicle from ?stock= (vehicle pages link here) or ?stock_number= (old DealerCenter links),
  // and a topic from ?topic=find.
  var params = new URLSearchParams(location.search);
  var stock = params.get('stock') || params.get('stock_number');
  if (stock) {
    document.querySelectorAll('select[data-stock-select]').forEach(function (sel) {
      var opt = sel.querySelector('option[data-stock="' + stock.replace(/[^\w-]/g, '') + '"]');
      if (opt) sel.value = opt.value;
    });
  }
  if (params.get('topic') === 'find') {
    var topic = document.querySelector('select[data-topic-select]');
    if (topic) topic.value = 'Help me find a car';
  }

  // Lead forms.
  // With data-endpoint set (e.g. a Formspree URL) the form posts there via fetch;
  // without one it falls back to opening the visitor's email app, pre-filled.
  document.querySelectorAll('form[data-contact-form]').forEach(function (form) {
    var status = form.querySelector('.form-status');
    var say = function (msg, state) { if (status) { status.textContent = msg; status.dataset.state = state || ''; } };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (form.querySelector('.hp input') && form.querySelector('.hp input').value) return; // bot
      if (!form.reportValidity()) return;

      var data = new FormData(form);
      var endpoint = form.dataset.endpoint;

      if (!endpoint) {
        var lines = [];
        data.forEach(function (v, k) { if (k !== '_gotcha' && k !== '_subject' && String(v).trim()) lines.push(k.replace(/_/g, ' ') + ': ' + v); });
        var subject = data.get('_subject') || 'Website inquiry';
        window.location.href = 'mailto:' + form.dataset.email +
          '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines.join('\n'));
        say('Your email app should open with your message. If it doesn’t, call us at ' + form.dataset.phone + '.', 'ok');
        return;
      }

      var submit = form.querySelector('[type="submit"]');
      submit.disabled = true;
      say('Sending…');
      fetch(endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
        .then(function (r) {
          if (!r.ok) throw new Error(r.status);
          form.reset();
          say('Thanks! We got your message and will be in touch soon.', 'ok');
        })
        .catch(function () {
          say('Sorry, something went wrong. Please call us at ' + form.dataset.phone + ' or email ' + form.dataset.email + '.', 'error');
        })
        .finally(function () { submit.disabled = false; });
    });
  });
})();
