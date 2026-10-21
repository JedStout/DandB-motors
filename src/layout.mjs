import { site } from './site.mjs';
import { inventory, photoUrl } from './inventory.mjs';

const nav = [
  { href: '/inventory/', label: 'Shop Inventory', match: ['/inventory/'] },
  { href: '/apply-online/', label: 'Financing' },
  { href: '/value-your-vehicle/', label: 'Sell / Trade' },
  { href: '/about-us/', label: 'About' },
  { href: '/contact-us/', label: 'Contact' },
];

export const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
export const money = (n) => '$' + Math.round(n).toLocaleString('en-US');
export const miles = (n) => (n ? n.toLocaleString('en-US') + ' mi' : 'Miles n/a');
export const slugify = (s) => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const vehicleName = (v) => `${v.year} ${v.make} ${v.model}`;
export const vehiclePath = (v) => `/inventory/${v.slug}/${v.stock}/`;
export const makePath = (make) => `/inventory/${slugify(make)}/`;
export const forSale = inventory.filter((v) => !v.sold);

// Body styles in the order they appear in the "Shop by type" row.
export const bodyStyles = [
  { key: 'SUV', label: 'SUVs', icon: 'suv' },
  { key: 'Truck', label: 'Trucks', icon: 'truck' },
  { key: 'Sedan', label: 'Sedans', icon: 'sedan' },
  { key: 'Motorcycle', label: 'Motorcycles', icon: 'moto' },
];

/* Icons. Vehicle icons echo the logo badge: a ring around a sunset half-sun, with a deep-teal
   vehicle and steel-blue glass in front. UI icons are simple strokes in currentColor. */
const sprite = `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="sunset" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#DD550F"/><stop offset=".55" stop-color="#EB7520"/><stop offset="1" stop-color="#F1C75E"/>
    </linearGradient>
  </defs>
  <symbol id="i-sedan" viewBox="0 0 64 44"><path d="M5 37a27 27 0 0 1 54 0z" fill="url(#sunset)"/><path class="v-ring" d="M1.5 37a30.5 30.5 0 0 1 61 0"/><g transform="translate(7 9.5) scale(.78)"><path class="v-body" d="M3 33v-6q0-3 4-4l10-2 8-7q2-1.5 5-1.5h11q3 0 5 2l6 6.5 6 1.5q3 1 3 4.5v6h-7a6 6 0 0 0-12 0H22a6 6 0 0 0-12 0z"/><path class="v-glass" d="M20 21l6-5.5h8V21zm16-5.5h5q2 0 3.5 1.5l4 4H36z"/><circle class="v-body" cx="16" cy="33" r="5"/><circle class="v-body" cx="48" cy="33" r="5"/><circle class="v-glass" cx="16" cy="33" r="2"/><circle class="v-glass" cx="48" cy="33" r="2"/></g><path class="v-ground" d="M3 39.5h58"/></symbol>
  <symbol id="i-suv" viewBox="0 0 64 44"><path d="M5 37a27 27 0 0 1 54 0z" fill="url(#sunset)"/><path class="v-ring" d="M1.5 37a30.5 30.5 0 0 1 61 0"/><g transform="translate(7 9.5) scale(.78)"><path class="v-body" d="M3 33v-9q0-3 3-3.5l6-1 5-8.5q1-1.5 3-1.5h30q3 0 4.5 2.5l3.5 7.5q3 1 3 4.5v9h-7a6 6 0 0 0-12 0H22a6 6 0 0 0-12 0z"/><path class="v-glass" d="M15 19.5l4.5-7H29v7zm16-7h10v7H31zm12 0h7q1.5 0 2.3 1.5l2.7 5.5H43z"/><circle class="v-body" cx="16" cy="33" r="5"/><circle class="v-body" cx="48" cy="33" r="5"/><circle class="v-glass" cx="16" cy="33" r="2"/><circle class="v-glass" cx="48" cy="33" r="2"/></g><path class="v-ground" d="M3 39.5h58"/></symbol>
  <symbol id="i-truck" viewBox="0 0 64 44"><path d="M5 37a27 27 0 0 1 54 0z" fill="url(#sunset)"/><path class="v-ring" d="M1.5 37a30.5 30.5 0 0 1 61 0"/><g transform="translate(7 9.5) scale(.78)"><path class="v-body" d="M3 33v-9q0-3 3-3.5l8-1 5-8.5q1-1.5 3-1.5h11q2 0 2 2V20h26v13h-7a6 6 0 0 0-12 0H22a6 6 0 0 0-12 0z"/><path class="v-glass" d="M17 19.5l4-7h11.5v7z"/><circle class="v-body" cx="16" cy="33" r="5"/><circle class="v-body" cx="48" cy="33" r="5"/><circle class="v-glass" cx="16" cy="33" r="2"/><circle class="v-glass" cx="48" cy="33" r="2"/></g><path class="v-ground" d="M3 39.5h58"/></symbol>
  <symbol id="i-moto" viewBox="0 0 64 44"><path d="M5 37a27 27 0 0 1 54 0z" fill="url(#sunset)"/><path class="v-ring" d="M1.5 37a30.5 30.5 0 0 1 61 0"/><g transform="translate(7 9.5) scale(.78)"><circle cx="14" cy="31" r="7" class="v-ring"/><circle cx="50" cy="31" r="7" class="v-ring"/><path class="v-line" d="M14 31l11-12h14l11 12M39 19l5-7h4M23 19l-2-4h9"/><path class="v-body" d="M26 19q4-6 11-5l3 5z"/></g><path class="v-ground" d="M3 39.5h58"/></symbol>
  <symbol id="i-phone" viewBox="0 0 24 24"><path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2"/></symbol>
  <symbol id="i-text" viewBox="0 0 24 24"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1.2-4.4A8 8 0 1 1 21 12zM8.5 12h.01M12 12h.01M15.5 12h.01"/></symbol>
  <symbol id="i-pin" viewBox="0 0 24 24"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></symbol>
  <symbol id="i-clock" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></symbol>
  <symbol id="i-mail" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></symbol>
  <symbol id="i-search" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></symbol>
  <symbol id="i-tag" viewBox="0 0 24 24"><path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.5"/></symbol>
  <symbol id="i-family" viewBox="0 0 24 24"><circle cx="8" cy="7" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M2 20v-1a6 6 0 0 1 12 0v1M14 20v-1a4 4 0 0 1 8 0v1"/></symbol>
  <symbol id="i-key" viewBox="0 0 24 24"><circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M16 7l3 3M14 9l2 2"/></symbol>
  <symbol id="i-dollar" viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 9v.01M18 15v.01"/></symbol>
  <symbol id="i-gauge" viewBox="0 0 24 24"><path d="M4 18a9 9 0 1 1 16 0"/><path d="M12 14l4-5"/></symbol>
  <symbol id="i-arrow" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></symbol>
</svg>`;

export const vehicleIcon = (name, cls = 'vicon') => `<svg class="${cls}" viewBox="0 0 64 44" aria-hidden="true"><use href="#i-${name}"/></svg>`;
export const icon = (name, cls = 'icon') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-${name}"/></svg>`;

const brand = `<span class="brand-badge"><img src="/assets/img/badge.png" alt="" width="88" height="88"></span>
      <span class="brand-text"><span class="brand-name">D&amp;B Motors</span><span class="brand-sub">${site.tagline}</span></span>`;

export function breadcrumbs(items) {
  return `<nav class="breadcrumbs" aria-label="Breadcrumb"><ol>` +
    items.map((c, i) => i === items.length - 1
      ? `<li aria-current="page">${c.label}</li>`
      : `<li><a href="${c.href}">${c.label}</a></li>`).join('') +
    `</ol></nav>`;
}

export function pageHero({ crumbs, eyebrow, title, lede, actions = '' }) {
  return `<section class="page-hero">
  <div class="wrap">
    ${crumbs ? breadcrumbs(crumbs) : ''}
    ${eyebrow ? `<p class="eyebrow">${eyebrow}</p>` : ''}
    <h1>${title}</h1>
    ${lede ? `<p class="lede">${lede}</p>` : ''}
    ${actions}
  </div>
</section>
<div class="sunset-stripe" aria-hidden="true"><span></span><span></span><span></span></div>`;
}

export function ctaBand(heading = 'Found one you like?', text = 'Text or call us to check availability or set up a test drive. We’re open Monday through Saturday, 10 to 5.') {
  return `<section class="cta" aria-labelledby="cta-h">
  <div class="wrap inner">
    <div>
      <h2 id="cta-h">${heading}</h2>
      <p>${text}</p>
    </div>
    <div class="btn-row">
      <a class="btn btn-primary" href="${site.smsHref}">${icon('text')}Text ${site.textPhone}</a>
      <a class="btn btn-light" href="${site.phoneHref}">${icon('phone')}Call ${site.phone}</a>
    </div>
  </div>
</section>`;
}

export function vehicleCard(v, { headingLevel = 3, eager = false } = {}) {
  const name = vehicleName(v);
  const h = `h${headingLevel}`;
  const search = [v.year, v.make, v.model, v.trim, v.body, v.drivetrain, v.exterior, v.stock].join(' ').toLowerCase();
  return `<article class="vcard" data-vehicle data-make="${esc(v.make)}" data-body="${esc(v.body)}" data-price="${v.price}" data-miles="${v.miles || 0}" data-year="${v.year}" data-drive="${esc(v.drivetrain)}" data-search="${esc(search)}">
  <a class="vcard-link" href="${vehiclePath(v)}">
    <div class="vcard-media">
      ${v.photos[0] ? `<img src="${photoUrl(v.photos[0], 'md')}" alt="${esc(name)}" width="640" height="480"${eager ? '' : ' loading="lazy"'} decoding="async">` : `<div class="vcard-noimg">${vehicleIcon(bodyStyles.find((b) => b.key === v.body)?.icon || 'sedan')}<span>Photos coming soon</span></div>`}
      <span class="chip">${v.body}</span>
    </div>
    <div class="vcard-body">
      <${h} class="vcard-title">${name}</${h}>
      <p class="vcard-trim">${esc(v.trim) || '&nbsp;'}</p>
      <p class="vcard-meta"><span>${miles(v.miles)}</span>${v.drivetrain ? `<span>${v.drivetrain}</span>` : ''}${v.fuel !== 'Gas' ? `<span>${v.fuel}</span>` : ''}</p>
      <p class="vcard-price">${money(v.price)}</p>
      <p class="vcard-fee">Includes ${money(site.dealerFee)} dealer fee</p>
    </div>
  </a>
</article>`;
}

export const vehicleGrid = (list, opts) => `<div class="vgrid">${list.map((v, i) => vehicleCard(v, { ...opts, eager: opts?.eagerFirst && i < 3 })).join('\n')}</div>`;

export const hoursList = () => `<dl class="hours">${site.hours.map((h) => `<div><dt>${h.days}</dt><dd>${h.time}</dd></div>`).join('')}</dl>`;

export const fullAddress = `${site.address.street}, ${site.address.city}, ${site.address.region} ${site.address.postalCode}`;

function breadcrumbSchema(crumbs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem', position: i + 1, name: c.label.replace(/&amp;/g, '&'), item: site.url + c.href,
    })),
  };
}

export function layout({ path, title, description, body, schema = [], crumbs, ogType = 'website', ogImage, noindex = false, scripts = [] }) {
  const canonical = site.url + path;
  const isCurrent = (item) => (item.match || [item.href]).some((m) => path.startsWith(m));
  const allSchema = [...schema, ...(crumbs ? [breadcrumbSchema(crumbs)] : [])];
  const year = new Date().getFullYear();
  const makes = [...new Set(forSale.map((v) => v.make))].sort();

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${noindex ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${canonical}">`}
<meta property="og:type" content="${ogType}">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${ogImage || site.url + '/assets/img/dandb-logo.png'}">
<meta name="twitter:card" content="${ogImage ? 'summary_large_image' : 'summary'}">
<meta name="theme-color" content="#04242C">
<link rel="icon" href="/assets/img/favicon-32.png" sizes="32x32" type="image/png">
<link rel="icon" href="/assets/img/favicon-192.png" sizes="192x192" type="image/png">
<link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preconnect" href="https://imagescf.dealercenter.net">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Saira+Condensed:wght@600;700;800&family=Barlow:wght@400;500;600;700&display=swap">
<link rel="stylesheet" href="/assets/css/styles.css">
${allSchema.map((s) => `<script type="application/ld+json">${JSON.stringify(s)}</script>`).join('\n')}
</head>
<body>
${sprite}
<a class="skip" href="#main">Skip to content</a>

<div class="topbar">
  <div class="wrap">
    <a href="${site.mapUrl}">${icon('pin')}${fullAddress}</a>
    <span class="topbar-hours">${icon('clock')}Mon–Sat 10–5 &middot; Sun by appointment</span>
    <a class="topbar-text" href="${site.smsHref}">${icon('text')}Text ${site.textPhone}</a>
  </div>
</div>

<header class="site-header">
  <div class="wrap">
    <a class="brand" href="/" aria-label="${esc(site.name)}, home">
      ${brand}
    </a>
    <nav class="nav" id="nav" aria-label="Main">
      ${nav.map((n) => `<a href="${n.href}"${isCurrent(n) ? ' aria-current="page"' : ''}>${n.label}</a>`).join('\n      ')}
      <a class="nav-call" href="${site.phoneHref}">${icon('phone')}${site.phone}</a>
    </nav>
    <a class="btn btn-primary header-call" href="${site.phoneHref}">${icon('phone')}<span>${site.phone}</span></a>
    <button class="menu-toggle" type="button" aria-controls="nav" aria-expanded="false" aria-label="Open menu">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
    </button>
  </div>
</header>

<main id="main">
${body}
</main>

<footer class="site-footer">
  <div class="sunset-stripe" aria-hidden="true"><span></span><span></span><span></span></div>
  <div class="wrap">
    <div class="foot">
      <div class="foot-brand">
        <a class="brand" href="/" aria-label="${esc(site.name)}, home">${brand}</a>
        <p>Quality pre-owned cars, trucks and SUVs from a family-owned dealership in Shingle Springs, California.</p>
      </div>
      <div>
        <h2>Shop</h2>
        <ul>
          <li><a href="/inventory/">All inventory</a></li>
          ${bodyStyles.filter((b) => forSale.some((v) => v.body === b.key)).map((b) => `<li><a href="/inventory/?body=${b.key}">${b.label}</a></li>`).join('\n          ')}
          <li><a href="/inventory/?price_max=10000">Under $10,000</a></li>
        </ul>
      </div>
      <div>
        <h2>Makes in stock</h2>
        <ul>
          ${makes.map((m) => `<li><a href="${makePath(m)}">${m}</a></li>`).join('\n          ')}
        </ul>
      </div>
      <div>
        <h2>Visit or call</h2>
        <address>
          <ul>
            <li><a href="${site.mapUrl}">${site.address.street}<br>${site.address.city}, ${site.address.region} ${site.address.postalCode}</a></li>
            <li>Sales: <a href="${site.phoneHref}">${site.phone}</a></li>
            <li>Text or call: <a href="${site.smsHref}">${site.textPhone}</a></li>
            <li><a href="mailto:${site.email}">${site.email}</a></li>
          </ul>
        </address>
        ${hoursList()}
      </div>
    </div>
    <div class="legal">
      <span>&copy; ${year} ${site.legalName}</span>
      <span>Prices include a ${money(site.dealerFee)} dealer fee. Tax, title, registration and license fees are extra.</span>
      <a href="/privacy-policy/">Privacy policy</a>
    </div>
  </div>
</footer>

<div class="callbar">
  <a href="${site.phoneHref}">${icon('phone')}Call</a>
  <a href="${site.smsHref}">${icon('text')}Text</a>
  <a href="/inventory/">${icon('search')}Inventory</a>
</div>

<script src="/assets/js/main.js" defer></script>
${scripts.map((s) => `<script src="${s}" defer></script>`).join('\n')}
</body>
</html>
`;
}

// Lead form shared by contact, test drive, financing and trade-in pages.
// `fields` adds extra page-specific fields before the message box.
export function leadForm({ id = 'f', subject = 'Website inquiry', fields = '', message = 'Message', messageRequired = true, submitLabel = 'Send message', hidden = {} } = {}) {
  const action = site.formEndpoint || `mailto:${site.email}`;
  return `<form class="form" method="post" action="${action}"${site.formEndpoint ? '' : ' enctype="text/plain"'}
  data-contact-form data-endpoint="${site.formEndpoint}" data-email="${site.email}" data-phone="${site.phone}">
  <input type="hidden" name="_subject" value="${esc(subject)}">
  ${Object.entries(hidden).map(([k, v]) => `<input type="hidden" name="${k}" value="${esc(v)}">`).join('\n  ')}
  <div class="hp" aria-hidden="true"><label>Leave this empty <input name="_gotcha" tabindex="-1" autocomplete="off"></label></div>
  <div class="field"><label for="${id}-first">First name</label><input id="${id}-first" name="first_name" autocomplete="given-name" required></div>
  <div class="field"><label for="${id}-last">Last name</label><input id="${id}-last" name="last_name" autocomplete="family-name" required></div>
  <div class="field"><label for="${id}-phone">Phone</label><input id="${id}-phone" name="phone" type="tel" autocomplete="tel" required></div>
  <div class="field"><label for="${id}-email">Email</label><input id="${id}-email" name="email" type="email" autocomplete="email" required></div>
  <fieldset class="field full choice">
    <legend>Best way to reach you</legend>
    <label><input type="radio" name="contact_preference" value="Text" checked> Text</label>
    <label><input type="radio" name="contact_preference" value="Call"> Call</label>
    <label><input type="radio" name="contact_preference" value="Email"> Email</label>
  </fieldset>
  ${fields}
  <div class="field full"><label for="${id}-message">${message}${messageRequired ? '' : ' <span class="hint">(optional)</span>'}</label><textarea id="${id}-message" name="message"${messageRequired ? ' required' : ''}></textarea></div>
  <p class="full fine">By sending this form you agree that ${site.legalName} may contact you about your request by phone, text or email. Message and data rates may apply. See our <a href="/privacy-policy/">privacy policy</a>.</p>
  <div class="full btn-row form-actions">
    <button class="btn btn-primary" type="submit">${submitLabel}</button>
    <p class="form-status" role="status" aria-live="polite"></p>
  </div>
</form>`;
}

// Options for "vehicle of interest" selects.
export const vehicleOptions = (selected = '') => forSale.map((v) => `<option value="${esc(`${vehicleName(v)} (stock ${v.stock})`)}" data-stock="${v.stock}"${v.stock === selected ? ' selected' : ''}>${vehicleName(v)}, ${money(v.price)}</option>`).join('');
