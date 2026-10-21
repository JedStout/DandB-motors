// Builds the static site into ./public. Run: npm run build
// Page URLs match the current DealerCenter site so existing search rankings and shared links carry over.
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { site } from './src/site.mjs';
import { inventory, photoUrl } from './src/inventory.mjs';
import {
  layout, pageHero, ctaBand, vehicleGrid, vehicleIcon, icon, breadcrumbs, leadForm, vehicleOptions, hoursList,
  bodyStyles, forSale, vehicleName, vehiclePath, makePath, money, miles, esc, fullAddress,
} from './src/layout.mjs';

const root = dirname(fileURLToPath(import.meta.url));
const out = join(root, 'public');
const pages = [];

// Preview mode (GitHub Pages): PREVIEW=1 adds a "design preview" banner and keeps the copy out of
// search results; BASE_PATH prefixes links when the site is served from a subfolder.
const preview = process.env.PREVIEW === '1';
const base = (process.env.BASE_PATH || '').replace(/\/$/, '');
const previewBanner = `<div style="background:#F1C75E;color:#04242C;text-align:center;font:600 14px/1.4 Barlow,system-ui,sans-serif;padding:8px 16px">Design preview. Not yet the live site for ${site.name}.</div>`;

// Vehicle pages are regenerated from inventory on every build, so clear the old ones first.
rmSync(join(out, 'inventory'), { recursive: true, force: true });

function emit(path, html, { sitemap = true } = {}) {
  const file = path.endsWith('.html') ? join(out, path) : join(out, path, 'index.html');
  if (base) html = html.replace(/(href|src|action)="\/(?!\/)/g, (m, attr) => `${attr}="${base}/`);
  if (preview) {
    html = html.replace('<meta name="theme-color"', '<meta name="robots" content="noindex, nofollow">\n<meta name="theme-color"');
    html = html.replace('<a class="skip"', `${previewBanner}\n<a class="skip"`);
  }
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
  if (sitemap) pages.push(path);
}

const brandTitle = (t) => `${t} | D&B Motors, Shingle Springs CA`;
const count = (fn) => forSale.filter(fn).length;
const makes = [...new Set(forSale.map((v) => v.make))].sort();
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

const dealer = {
  '@context': 'https://schema.org',
  '@type': 'AutoDealer',
  '@id': site.url + '/#dealer',
  name: site.legalName,
  alternateName: site.name,
  url: site.url + '/',
  logo: site.url + '/assets/img/dandb-logo.png',
  image: site.url + '/assets/img/dandb-logo.png',
  telephone: site.phoneE164,
  email: site.email,
  priceRange: '$$',
  address: {
    '@type': 'PostalAddress',
    streetAddress: site.address.street,
    addressLocality: site.address.city,
    addressRegion: site.address.region,
    postalCode: site.address.postalCode,
    addressCountry: 'US',
  },
  openingHoursSpecification: site.hours.filter((h) => h.schema).map((h) => ({
    '@type': 'OpeningHoursSpecification', dayOfWeek: h.schema, opens: h.opens, closes: h.closes,
  })),
  areaServed: site.serviceArea.map((c) => ({ '@type': 'City', name: `${c}, CA` })),
};

const vehicleSchema = (v) => ({
  '@context': 'https://schema.org',
  '@type': v.body === 'Motorcycle' ? 'Motorcycle' : 'Car',
  name: `${vehicleName(v)} ${v.trim}`.trim(),
  brand: { '@type': 'Brand', name: v.make },
  model: v.model,
  vehicleModelDate: String(v.year),
  vehicleConfiguration: v.trim || undefined,
  bodyType: v.body,
  itemCondition: 'https://schema.org/UsedCondition',
  vehicleIdentificationNumber: v.vin,
  sku: v.stock,
  ...(v.miles ? { mileageFromOdometer: { '@type': 'QuantitativeValue', value: v.miles, unitCode: 'SMI' } } : {}),
  ...(v.drivetrain ? { driveWheelConfiguration: v.drivetrain } : {}),
  ...(v.transmission ? { vehicleTransmission: v.transmission } : {}),
  ...(v.exterior ? { color: v.exterior } : {}),
  fuelType: v.fuel,
  image: v.photos.slice(0, 5).map((p) => photoUrl(p, 'lg')),
  url: site.url + vehiclePath(v),
  offers: {
    '@type': 'Offer',
    price: v.price,
    priceCurrency: 'USD',
    availability: v.sold ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock',
    seller: { '@id': site.url + '/#dealer' },
  },
});

/* ---------- Shared blocks ---------- */
const searchForm = (id, label = 'Search inventory') => `<form class="search" action="/inventory/" method="get" role="search">
  <label class="visually-hidden" for="${id}">${label}</label>
  ${icon('search', 'icon search-icon')}
  <input id="${id}" name="q" type="search" placeholder="Search make, model or keyword" autocomplete="off">
  <button class="btn btn-primary" type="submit">Search</button>
</form>`;

const bodyTiles = () => `<div class="type-tiles">${bodyStyles.map((b) => {
  const n = count((v) => v.body === b.key);
  return n ? `<a class="type-tile" href="/inventory/?body=${b.key}">${vehicleIcon(b.icon)}<strong>${b.label}</strong><span>${plural(n, 'vehicle')}</span></a>` : '';
}).join('')}
  <a class="type-tile all" href="/inventory/">${vehicleIcon('suv')}<strong>Shop all</strong><span>${plural(forSale.length, 'vehicle')}</span></a>
</div>`;

const budgets = [5000, 10000, 15000, 20000];
const budgetTiles = () => `<div class="budget-tiles">${budgets.map((b) => {
  const n = count((v) => v.price <= b);
  return `<a class="budget-tile" href="/inventory/?price_max=${b}"><span>Under</span><strong>${money(b)}</strong><small>${n ? plural(n, 'match') : 'Check back soon'}</small></a>`;
}).join('')}</div>`;

const differences = [
  ['family', 'Family owned &amp; operated', 'You deal with the owners, not a sales floor. Straight answers and no pressure.'],
  ['tag', 'Dealer fees included', `The price you see already includes our ${money(site.dealerFee)} dealer fee. Only tax, title and registration are added.`],
  ['dollar', 'Financing options', 'A full range of financing options to fit your budget, and you can get started online.'],
  ['key', 'Trade-ins welcome', 'Get an offer on your current vehicle and put its value toward your next one.'],
];

const differenceList = () => `<ul class="diff">${differences.map(([i, t, d]) => `
  <li>${icon(i, 'icon diff-icon')}<h3>${t}</h3><p>${d}</p></li>`).join('')}
</ul>`;

const budgetCalc = (id = 'budget') => `<div class="budget-calc" data-budget-calc id="${id}">
  <form class="calc-inputs" onsubmit="return false">
    <div class="field"><label for="${id}-pay">Monthly payment</label><div class="affix"><span aria-hidden="true">$</span><input id="${id}-pay" type="number" inputmode="decimal" min="0" step="25" value="300"></div></div>
    <div class="field"><label for="${id}-down">Down payment</label><div class="affix"><span aria-hidden="true">$</span><input id="${id}-down" type="number" inputmode="decimal" min="0" step="250" value="${site.calc.down}"></div></div>
    <div class="field"><label for="${id}-term">Term</label><select id="${id}-term">${[36, 48, 60, 72].map((t) => `<option value="${t}"${t === site.calc.term ? ' selected' : ''}>${t} months</option>`).join('')}</select></div>
    <div class="field"><label for="${id}-apr">APR</label><div class="affix"><input id="${id}-apr" type="number" inputmode="decimal" min="0" max="40" step="0.25" value="${site.calc.apr}"><span aria-hidden="true">%</span></div></div>
  </form>
  <div class="budget-result" aria-live="polite">
    <p class="result-label">You could shop for cars up to about</p>
    <p class="result-big" data-out="budget">—</p>
    <a class="btn btn-primary" data-out="budget-link" href="/inventory/">See cars in your budget</a>
    <p class="fine">Estimate only, before tax, title and registration. Your rate depends on credit and lender approval.</p>
  </div>
</div>`;

/* ---------------- Home ---------------- */
{
  const newest = [...forSale].sort((a, b) => Number(b.stock) - Number(a.stock));
  const spotlight = newest.find((v) => v.photos.length) || newest[0];
  emit('/', layout({
    path: '/',
    title: 'Used Cars, Trucks & SUVs in Shingle Springs, CA | D&B Motors',
    description: `Family-owned used car dealer in Shingle Springs, CA. Shop ${forSale.length} quality pre-owned cars, trucks and SUVs with dealer fees included in the price, plus financing and trade-ins. Call ${site.phone}.`,
    schema: [dealer],
    ogImage: spotlight?.photos[0] ? photoUrl(spotlight.photos[0], 'lg') : undefined,
    body: `
<section class="hero">
  <div class="hero-sun" aria-hidden="true"></div>
  <div class="wrap">
    <div class="hero-copy">
      <p class="eyebrow">Family owned &middot; Shingle Springs, CA</p>
      <h1>Good cars. Fair prices. <span>Family owned.</span></h1>
      <p class="lede">Hand-picked pre-owned cars, trucks and SUVs for the foothills, priced with dealer fees already included.</p>
      ${searchForm('hero-q')}
      <nav class="quick" aria-label="Popular searches">
        <a href="/inventory/?body=SUV">SUVs</a>
        <a href="/inventory/?body=Truck">Trucks</a>
        <a href="/inventory/?drive=4x4">AWD &amp; 4x4</a>
        <a href="/inventory/?price_max=10000">Under $10K</a>
        <a href="/inventory/?sort_by=miles_asc">Lowest miles</a>
      </nav>
    </div>
    ${spotlight ? `<a class="spotlight" href="${vehiclePath(spotlight)}">
      <span class="spotlight-tag">Just in</span>
      <img src="${photoUrl(spotlight.photos[0], 'lg')}" alt="${esc(vehicleName(spotlight))}" width="1024" height="768" fetchpriority="high">
      <span class="spotlight-info"><strong>${vehicleName(spotlight)}</strong><span>${esc(spotlight.trim)} &middot; ${miles(spotlight.miles)}</span><span class="spotlight-price">${money(spotlight.price)}</span></span>
    </a>` : ''}
  </div>
</section>
<div class="sunset-stripe" aria-hidden="true"><span></span><span></span><span></span></div>

<section aria-labelledby="type-h">
  <div class="wrap">
    <div class="section-head row">
      <h2 id="type-h">Shop by type</h2>
    </div>
    ${bodyTiles()}
  </div>
</section>

<section class="alt" aria-labelledby="ready-h">
  <div class="wrap">
    <div class="section-head row">
      <div><p class="eyebrow">On the lot now</p><h2 id="ready-h">Ready for a test drive</h2></div>
      <a class="more" href="/inventory/">See all ${forSale.length} vehicles ${icon('arrow')}</a>
    </div>
    ${vehicleGrid(newest.slice(0, 8))}
  </div>
</section>

<section aria-labelledby="budget-h">
  <div class="wrap">
    <div class="section-head">
      <p class="eyebrow">Shop by budget</p>
      <h2 id="budget-h">Find a car that fits your budget</h2>
      <p class="lede">Start with a price, or work backward from the monthly payment you’re comfortable with.</p>
    </div>
    ${budgetTiles()}
    ${budgetCalc('home-budget')}
  </div>
</section>

<section class="trade-band" aria-labelledby="trade-h">
  <div class="wrap inner">
    ${vehicleIcon('suv', 'vicon big')}
    <div>
      <p class="eyebrow">Sell or trade</p>
      <h2 id="trade-h">What’s your car worth?</h2>
      <p>Tell us about your vehicle and we’ll get back to you with an offer. Use it toward your next car, or just sell it to us.</p>
    </div>
    <a class="btn btn-primary" href="/value-your-vehicle/">Get my offer</a>
  </div>
</section>

<section aria-labelledby="diff-h">
  <div class="wrap">
    <div class="section-head">
      <p class="eyebrow">Why D&amp;B</p>
      <h2 id="diff-h">The D&amp;B difference</h2>
    </div>
    ${differenceList()}
  </div>
</section>

<section class="alt" aria-labelledby="make-h">
  <div class="wrap">
    <div class="section-head"><h2 id="make-h">Shop by make</h2></div>
    <div class="make-chips">${makes.map((m) => `<a href="${makePath(m)}">${m} <span>${count((v) => v.make === m)}</span></a>`).join('')}</div>
  </div>
</section>

<section aria-labelledby="visit-h">
  <div class="wrap visit">
    <div>
      <p class="eyebrow">Visit us</p>
      <h2 id="visit-h">Come see us in Shingle Springs</h2>
      <p class="lede">Close to Cameron Park, Placerville and El Dorado Hills.</p>
      <ul class="contact-list">
        <li>${icon('pin')}<a href="${site.mapUrl}">${fullAddress}</a></li>
        <li>${icon('phone')}<span>Sales <a href="${site.phoneHref}">${site.phone}</a></span></li>
        <li>${icon('text')}<span>Text or call <a href="${site.smsHref}">${site.textPhone}</a></span></li>
        <li>${icon('mail')}<a href="mailto:${site.email}">${site.email}</a></li>
      </ul>
      ${hoursList()}
    </div>
    <iframe class="map" src="${site.mapEmbed}" title="Map to D&amp;B Motors, ${esc(fullAddress)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
  </div>
</section>

${ctaBand()}`,
    scripts: ['/assets/js/calculators.js'],
  }));
}

/* ---------------- Inventory (search + filters) ---------------- */
const priceSteps = [5000, 10000, 15000, 20000, 25000, 30000, 35000];
const filterBar = (presetMake = '') => `<form class="filters" data-filters onsubmit="return false" aria-label="Filter vehicles">
  <div class="field grow"><label for="f-q">Search</label><input id="f-q" name="q" type="search" placeholder="Make, model, trim, color…"></div>
  <div class="field"><label for="f-body">Type</label><select id="f-body" name="body"><option value="">All types</option>${bodyStyles.filter((b) => count((v) => v.body === b.key)).map((b) => `<option value="${b.key}">${b.label}</option>`).join('')}</select></div>
  <div class="field"><label for="f-make">Make</label><select id="f-make" name="make"><option value="">All makes</option>${makes.map((m) => `<option${m === presetMake ? ' selected' : ''}>${m}</option>`).join('')}</select></div>
  <div class="field"><label for="f-price">Max price</label><select id="f-price" name="price_max"><option value="">Any price</option>${priceSteps.map((p) => `<option value="${p}">Under ${money(p)}</option>`).join('')}</select></div>
  <div class="field"><label for="f-drive">Drivetrain</label><select id="f-drive" name="drive"><option value="">Any</option><option value="4x4">AWD / 4WD</option><option value="FWD">FWD</option></select></div>
  <div class="field"><label for="f-sort">Sort by</label><select id="f-sort" name="sort_by">
    <option value="price_asc">Price: low to high</option><option value="price_desc">Price: high to low</option>
    <option value="miles_asc">Miles: low to high</option><option value="year_desc">Year: newest first</option><option value="year_asc">Year: oldest first</option>
  </select></div>
</form>
<div class="results-bar"><p class="results-count" data-count aria-live="polite">${plural(forSale.length, 'vehicle')}</p><button class="link-btn" type="button" data-reset hidden>Clear filters</button></div>`;

const emptyState = `<div class="empty" data-empty hidden>
  ${vehicleIcon('sedan', 'vicon big')}
  <h2>No matches right now</h2>
  <p>Our inventory changes often. Tell us what you’re looking for and we’ll text you when we find it.</p>
  <div class="btn-row"><a class="btn btn-primary" href="/contact-us/?topic=find">Help me find a car</a><button class="btn btn-ghost" type="button" data-reset>Clear filters</button></div>
</div>`;

emit('/inventory/', layout({
  path: '/inventory/',
  title: brandTitle('Used Cars for Sale'),
  description: `Browse ${forSale.length} used cars, trucks, SUVs and more for sale at D&B Motors in Shingle Springs, CA. Every price includes dealer fees. Financing and trade-ins available.`,
  crumbs: [{ href: '/', label: 'Home' }, { href: '/inventory/', label: 'Inventory' }],
  schema: [{
    '@context': 'https://schema.org', '@type': 'ItemList', name: 'Used vehicles for sale at D&B Motors',
    itemListElement: forSale.map((v, i) => ({ '@type': 'ListItem', position: i + 1, url: site.url + vehiclePath(v), name: vehicleName(v) })),
  }],
  scripts: ['/assets/js/inventory.js'],
  body: `
${pageHero({
    crumbs: [{ href: '/', label: 'Home' }, { href: '/inventory/', label: 'Inventory' }],
    title: 'Used cars, trucks &amp; SUVs for sale',
    lede: `Every price includes our ${money(site.dealerFee)} dealer fee.`,
  })}
<section class="inventory" aria-label="Vehicles for sale">
  <div class="wrap">
    ${filterBar()}
    ${vehicleGrid(forSale, { headingLevel: 2, eagerFirst: true })}
    ${emptyState}
  </div>
</section>
${ctaBand('Don’t see what you want?', 'Our dealer relationships help us find specific vehicles. Text us what you’re after and we’ll keep an eye out.')}`,
}));

/* ---------------- Make pages (old "Shop by make" URLs) ---------------- */
for (const make of makes) {
  const path = makePath(make);
  const list = forSale.filter((v) => v.make === make);
  const crumbs = [{ href: '/', label: 'Home' }, { href: '/inventory/', label: 'Inventory' }, { href: path, label: make }];
  emit(path, layout({
    path,
    title: brandTitle(`Used ${make} for Sale`),
    description: `Shop ${plural(list.length, `used ${make}`)} for sale at D&B Motors in Shingle Springs, CA. Prices include dealer fees; financing and trade-ins available.`,
    crumbs,
    body: `
${pageHero({ crumbs, title: `Used ${make} for sale`, lede: `${plural(list.length, 'vehicle')} in stock now. <a href="/inventory/">See all inventory</a>.` })}
<section aria-label="${esc(make)} vehicles">
  <div class="wrap">${vehicleGrid(list, { headingLevel: 2, eagerFirst: true })}</div>
</section>
${ctaBand()}`,
  }));
}

/* ---------------- Vehicle detail pages ---------------- */
const specRows = (v) => [
  ['Year', v.year], ['Make', v.make], ['Model', v.model], ['Trim', v.trim], ['Body style', v.body],
  ['Mileage', v.miles ? miles(v.miles) : ''], ['Drivetrain', v.drivetrain], ['Transmission', v.transmission],
  ['Engine', v.engine], ['Fuel', v.fuel], ['Exterior', v.exterior], ['Interior', v.interior],
  ['Doors', v.doors], ['VIN', v.vin], ['Stock #', v.stock],
].filter(([, val]) => val);

function similar(v) {
  return forSale
    .filter((o) => o.stock !== v.stock)
    .map((o) => ({ o, score: (o.body === v.body ? 0 : 1) * 20000 + Math.abs(o.price - v.price) }))
    .sort((a, b) => a.score - b.score)
    .slice(0, 4)
    .map((x) => x.o);
}

for (const v of inventory) {
  const path = vehiclePath(v);
  const name = vehicleName(v);
  const crumbs = [{ href: '/', label: 'Home' }, { href: '/inventory/', label: 'Inventory' }, { href: makePath(v.make), label: v.make }, { href: path, label: `${v.year} ${v.model}` }];
  const sms = `${site.smsHref}?&body=${encodeURIComponent(`Hi! I'm interested in the ${name} (stock ${v.stock}). Is it still available?`)}`;
  const vehiclePrice = v.price - site.dealerFee;

  if (v.sold) {
    emit(path, layout({
      path, noindex: true,
      title: brandTitle(`${name} (Sold)`),
      description: `This ${name} has sold. See similar vehicles at D&B Motors in Shingle Springs, CA.`,
      crumbs,
      body: `
${pageHero({ crumbs, title: `This ${name} has sold`, lede: 'Good news for its new owner. Here are a few similar vehicles we have right now.' })}
<section aria-label="Similar vehicles"><div class="wrap">${vehicleGrid(similar(v))}</div></section>
${ctaBand()}`,
    }), { sitemap: false });
    continue;
  }

  emit(path, layout({
    path,
    title: brandTitle(`Used ${name} ${v.trim}`.trim()),
    description: `${name} ${v.trim} for sale in Shingle Springs, CA: ${money(v.price)} including dealer fees${v.miles ? `, ${miles(v.miles)}` : ''}${v.drivetrain ? `, ${v.drivetrain}` : ''}. Stock ${v.stock}. Call or text D&B Motors.`,
    crumbs,
    ogType: 'product',
    ogImage: v.photos[0] ? photoUrl(v.photos[0], 'lg') : undefined,
    schema: [vehicleSchema(v)],
    scripts: ['/assets/js/calculators.js', '/assets/js/gallery.js'],
    body: `
<section class="vdp-head">
  <div class="wrap">
    ${breadcrumbs(crumbs)}
  </div>
</section>
<section class="vdp" aria-labelledby="vdp-h">
  <div class="wrap vdp-grid">
    <div class="vdp-main">
      ${v.photos.length ? `<div class="gallery" data-gallery>
        <div class="gallery-stage">
          <img data-stage src="${photoUrl(v.photos[0], 'lg')}" alt="${esc(name)}, photo 1 of ${v.photos.length}" width="1024" height="768" fetchpriority="high">
          <button class="gallery-nav prev" type="button" data-prev aria-label="Previous photo">&#8249;</button>
          <button class="gallery-nav next" type="button" data-next aria-label="Next photo">&#8250;</button>
          <span class="gallery-count" data-counter>1 / ${v.photos.length}</span>
        </div>
        <ul class="thumbs" aria-label="All photos">${v.photos.map((p, i) => `
          <li><a href="${photoUrl(p, 'lg')}" data-thumb="${i}"${i === 0 ? ' aria-current="true"' : ''}><img src="${photoUrl(p, 'sm')}" alt="Photo ${i + 1}" width="320" height="240" loading="lazy" decoding="async"></a></li>`).join('')}
        </ul>
      </div>` : `<div class="gallery-empty">${vehicleIcon('sedan', 'vicon big')}<p>Photos coming soon. <a href="${sms}">Text us</a> and we’ll send some.</p></div>`}

      ${v.highlights.length ? `<section class="vdp-section" aria-labelledby="hl-h">
        <h2 id="hl-h">Highlights</h2>
        <ul class="highlights">${v.highlights.map((h) => `<li>${esc(h)}</li>`).join('')}</ul>
      </section>` : ''}

      <section class="vdp-section" aria-labelledby="spec-h">
        <h2 id="spec-h">Vehicle details</h2>
        <dl class="specs">${specRows(v).map(([k, val]) => `<div><dt>${k}</dt><dd>${esc(val)}</dd></div>`).join('')}</dl>
      </section>

      ${v.equipment.length ? `<section class="vdp-section" aria-labelledby="eq-h">
        <h2 id="eq-h">Features &amp; equipment</h2>
        <ul class="equipment">${v.equipment.map((e) => `<li>${esc(e)}</li>`).join('')}</ul>
      </section>` : ''}

      <section class="vdp-section" id="payment" aria-labelledby="pay-h">
        <h2 id="pay-h">Estimate your payment</h2>
        <div class="pay-calc" data-pay-calc data-price="${v.price}">
          <form class="calc-inputs" onsubmit="return false">
            <div class="field"><label for="p-price">Vehicle price</label><div class="affix"><span aria-hidden="true">$</span><input id="p-price" type="number" inputmode="decimal" min="0" step="100" value="${v.price}"></div></div>
            <div class="field"><label for="p-down">Down payment</label><div class="affix"><span aria-hidden="true">$</span><input id="p-down" type="number" inputmode="decimal" min="0" step="250" value="${Math.min(site.calc.down, Math.round(v.price * 0.2))}"></div></div>
            <div class="field"><label for="p-term">Term</label><select id="p-term">${[36, 48, 60, 72].map((t) => `<option value="${t}"${t === site.calc.term ? ' selected' : ''}>${t} months</option>`).join('')}</select></div>
            <div class="field"><label for="p-apr">APR</label><div class="affix"><input id="p-apr" type="number" inputmode="decimal" min="0" max="40" step="0.25" value="${site.calc.apr}"><span aria-hidden="true">%</span></div></div>
          </form>
          <div class="pay-result" aria-live="polite">
            <p class="result-label">Estimated payment</p>
            <p class="result-big"><span data-out="payment">—</span><small>/mo</small></p>
            <a class="btn btn-primary" href="/apply-online/?stock=${v.stock}">Apply for financing</a>
          </div>
        </div>
        <p class="fine">Payment shown is an estimate for illustration only and is not an offer of credit. It excludes tax, title, registration and license fees. Your actual rate and terms depend on credit approval. Not all buyers will qualify.</p>
      </section>

      <section class="vdp-section" id="test-drive" aria-labelledby="td-h">
        <h2 id="td-h">Check availability or schedule a test drive</h2>
        ${leadForm({
          id: 'td',
          subject: `Test drive / availability: ${name} (stock ${v.stock})`,
          hidden: { vehicle: `${name} ${v.trim} (stock ${v.stock}, VIN ${v.vin})` },
          fields: `<div class="field"><label for="td-date">Preferred day</label><input id="td-date" name="preferred_day" type="date"></div>
  <div class="field"><label for="td-time">Preferred time</label><select id="td-time" name="preferred_time"><option>Morning (10–12)</option><option>Midday (12–3)</option><option>Afternoon (3–5)</option><option>Sunday, by appointment</option></select></div>`,
          message: 'Questions or notes',
          messageRequired: false,
          submitLabel: 'Send request',
        })}
      </section>
    </div>

    <aside class="vdp-aside" aria-label="Price and contact">
      <div class="price-card">
        <h1 id="vdp-h">${name}</h1>
        <p class="vdp-trim">${esc(v.trim)}</p>
        <p class="vdp-quick"><span>${icon('gauge')}${miles(v.miles)}</span>${v.drivetrain ? `<span>${v.drivetrain}</span>` : ''}<span>Stock #${v.stock}</span></p>
        <p class="vdp-price">${money(v.price)}</p>
        <details class="price-breakdown">
          <summary>Includes dealer fees</summary>
          <dl>
            <div><dt>Vehicle price</dt><dd>${money(vehiclePrice)}</dd></div>
            <div><dt>Dealer fee</dt><dd>${money(site.dealerFee)}</dd></div>
            <div class="total"><dt>Advertised price</dt><dd>${money(v.price)}</dd></div>
          </dl>
          <p class="fine">Plus government fees and taxes: sales tax, title, registration and license. Ask us for an out-the-door quote.</p>
        </details>
        <p class="vdp-est"><a href="#payment">Est. <strong data-out="payment-short">—</strong>/mo</a> <span class="fine">with ${money(site.calc.down)} down, ${site.calc.term} mo at ${site.calc.apr}% APR</span></p>
        <div class="vdp-actions">
          <a class="btn btn-primary" href="${sms}">${icon('text')}Text about this car</a>
          <a class="btn btn-ghost" href="${site.phoneHref}">${icon('phone')}Call ${site.phone}</a>
          <a class="btn btn-ghost" href="#test-drive">Schedule a test drive</a>
          <a class="btn btn-ghost" href="/apply-online/?stock=${v.stock}">${icon('dollar')}Get pre-qualified</a>
        </div>
        <a class="trade-link" href="/value-your-vehicle/?stock=${v.stock}">${icon('key')}Have a trade-in? Get an offer</a>
      </div>
      <div class="visit-card">
        <p><strong>${site.legalName}</strong></p>
        <p>${icon('pin')}<a href="${site.mapUrl}">${fullAddress}</a></p>
        <p>${icon('clock')}Mon–Sat 10–5 &middot; Sun by appointment</p>
      </div>
    </aside>
  </div>
</section>

<section class="alt" aria-labelledby="sim-h">
  <div class="wrap">
    <div class="section-head row"><h2 id="sim-h">Similar vehicles</h2><a class="more" href="/inventory/">See all inventory ${icon('arrow')}</a></div>
    ${vehicleGrid(similar(v))}
  </div>
</section>`,
  }));
}

/* ---------------- Financing (/apply-online/) ---------------- */
emit('/apply-online/', layout({
  path: '/apply-online/',
  title: brandTitle('Auto Financing & Credit Application'),
  description: 'Get pre-qualified for a used car loan at D&B Motors in Shingle Springs, CA. Financing options for many credit situations, plus a payment calculator to find your budget.',
  crumbs: [{ href: '/', label: 'Home' }, { href: '/apply-online/', label: 'Financing' }],
  scripts: ['/assets/js/calculators.js'],
  body: `
${pageHero({
    crumbs: [{ href: '/', label: 'Home' }, { href: '/apply-online/', label: 'Financing' }],
    title: 'Financing made simple',
    lede: 'We offer a full range of financing options to fit your needs. Start here and we’ll walk you through the rest.',
  })}
<section aria-labelledby="apply-h">
  <div class="wrap split">
    <div>
      <h2 id="apply-h">${site.creditAppUrl ? 'Apply online' : 'Get pre-qualified'}</h2>
      ${site.creditAppUrl
        ? `<p class="lede">Our secure credit application takes about five minutes.</p>
      <a class="btn btn-primary" href="${site.creditAppUrl}">Start secure application</a>`
        : `<p class="lede">Tell us a little about yourself and the car you want. We’ll reach out with next steps and a secure application link.</p>
      <p class="notice">${icon('tag')}<span>Please don’t include your Social Security number or bank details here. We’ll collect those only through a secure application.</span></p>
      ${leadForm({
          id: 'fin',
          subject: 'Financing pre-qualification request',
          fields: `<div class="field full"><label for="fin-vehicle">Vehicle of interest <span class="hint">(optional)</span></label><select id="fin-vehicle" name="vehicle" data-stock-select><option value="">Not sure yet</option>${vehicleOptions()}</select></div>
  <div class="field"><label for="fin-down">Down payment</label><div class="affix"><span aria-hidden="true">$</span><input id="fin-down" name="down_payment" type="number" inputmode="decimal" min="0" step="250"></div></div>
  <div class="field"><label for="fin-credit">How’s your credit?</label><select id="fin-credit" name="credit"><option>Excellent</option><option selected>Good</option><option>Fair</option><option>Rebuilding</option><option>Not sure</option></select></div>
  <div class="field"><label for="fin-income">Monthly income <span class="hint">(before taxes)</span></label><div class="affix"><span aria-hidden="true">$</span><input id="fin-income" name="monthly_income" type="number" inputmode="decimal" min="0" step="100"></div></div>
  <div class="field"><label for="fin-trade">Trading in a vehicle?</label><select id="fin-trade" name="trade_in"><option>No</option><option>Yes</option></select></div>`,
          message: 'Anything else we should know?',
          messageRequired: false,
          submitLabel: 'Send pre-qualification request',
        })}`}
    </div>
    <aside class="aside-card" aria-labelledby="steps-h">
      <h2 id="steps-h">How it works</h2>
      <ol class="steps">
        <li><strong>Tell us about you</strong><span>A few quick details and the car you like.</span></li>
        <li><strong>Review your options</strong><span>We’ll go over financing that fits your budget.</span></li>
        <li><strong>Drive home</strong><span>Sign, grab the keys and go.</span></li>
      </ol>
      <p class="muted">Questions? Text <a href="${site.smsHref}">${site.textPhone}</a> or call <a href="${site.phoneHref}">${site.phone}</a>.</p>
    </aside>
  </div>
</section>
<section class="alt" aria-labelledby="bud-h">
  <div class="wrap">
    <div class="section-head"><p class="eyebrow">Budget calculator</p><h2 id="bud-h">What can I afford?</h2></div>
    ${budgetCalc('fin-budget')}
  </div>
</section>
${ctaBand()}`,
}));

/* ---------------- Sell / trade (/value-your-vehicle/) ---------------- */
emit('/value-your-vehicle/', layout({
  path: '/value-your-vehicle/',
  title: brandTitle('Sell or Trade In Your Car'),
  description: 'Get an offer on your car, truck or SUV from D&B Motors in Shingle Springs, CA. Sell it to us outright or put its value toward your next vehicle.',
  crumbs: [{ href: '/', label: 'Home' }, { href: '/value-your-vehicle/', label: 'Sell / Trade' }],
  body: `
${pageHero({
    crumbs: [{ href: '/', label: 'Home' }, { href: '/value-your-vehicle/', label: 'Sell / Trade' }],
    title: 'Get an offer on your vehicle',
    lede: 'Selling outright or trading in, tell us about your vehicle and we’ll get back to you with a fair offer.',
  })}
<section aria-labelledby="trade-form-h">
  <div class="wrap split">
    <div>
      <h2 id="trade-form-h">Your vehicle</h2>
      ${leadForm({
        id: 'tr',
        subject: 'Vehicle appraisal request',
        fields: `<div class="field"><label for="tr-year">Year</label><input id="tr-year" name="year" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" required></div>
  <div class="field"><label for="tr-make">Make</label><input id="tr-make" name="make" required></div>
  <div class="field"><label for="tr-model">Model</label><input id="tr-model" name="model" required></div>
  <div class="field"><label for="tr-trim">Trim <span class="hint">(optional)</span></label><input id="tr-trim" name="trim"></div>
  <div class="field"><label for="tr-miles">Mileage</label><input id="tr-miles" name="mileage" type="number" inputmode="numeric" min="0" required></div>
  <div class="field"><label for="tr-vin">VIN <span class="hint">(optional)</span></label><input id="tr-vin" name="vin" maxlength="17" autocapitalize="characters"></div>
  <div class="field"><label for="tr-cond">Condition</label><select id="tr-cond" name="condition"><option>Excellent</option><option selected>Good</option><option>Fair</option><option>Needs work</option></select></div>
  <div class="field"><label for="tr-owe">Do you owe money on it?</label><select id="tr-owe" name="loan_payoff"><option>No</option><option>Yes</option><option>Not sure</option></select></div>
  <div class="field full"><label for="tr-plan">I’m looking to</label><select id="tr-plan" name="plan" data-stock-select><option>Sell my vehicle</option><option>Trade it in on a vehicle from D&amp;B</option>${vehicleOptions()}</select></div>`,
        message: 'Accidents, damage, new tires, recent service?',
        messageRequired: false,
        submitLabel: 'Get my offer',
      })}
    </div>
    <aside class="aside-card" aria-labelledby="tips-h">
      ${vehicleIcon('truck', 'vicon big')}
      <h2 id="tips-h">Speed it up with photos</h2>
      <p>Text a few photos (front, back, both sides, interior and the odometer) to <a href="${site.smsHref}">${site.textPhone}</a> and we can give you a firmer number.</p>
      <ul class="checks">
        <li>Bring your title or loan info</li>
        <li>Bring all keys and remotes</li>
        <li>Service records help your value</li>
      </ul>
    </aside>
  </div>
</section>
${ctaBand('Rather talk it through?', 'Call or text and tell us about your vehicle. We’re happy to help.')}`,
}));

/* ---------------- About ---------------- */
emit('/about-us/', layout({
  path: '/about-us/',
  title: brandTitle('About Our Family-Owned Dealership'),
  description: 'D&B Motors is a family-owned used car dealership in Shingle Springs, CA, offering quality pre-owned vehicles, fair prices with dealer fees included, and financing options.',
  crumbs: [{ href: '/', label: 'Home' }, { href: '/about-us/', label: 'About' }],
  schema: [dealer],
  body: `
${pageHero({
    crumbs: [{ href: '/', label: 'Home' }, { href: '/about-us/', label: 'About' }],
    title: 'A family-owned dealership in Shingle Springs',
    lede: 'We’re dedicated to giving you a better car-buying experience: quality vehicles, honest prices and people who know you by name.',
  })}
<section aria-labelledby="story-h">
  <div class="wrap two-col">
    <div class="prose">
      <h2 id="story-h">Quality pre-owned vehicles at real-world prices</h2>
      <p>D&amp;B Motors is your local source for a quality pre-owned vehicle. Our relationships across the dealer community let us buy a wide variety of lease returns and new-car trade-ins at good values, and we pass those savings on to you.</p>
      <p>We keep a hand-picked inventory of cars, trucks and SUVs suited to life in the foothills, and every advertised price already includes our dealer fee, so there are no surprises when you sit down to sign.</p>
      <p>When you’re ready to buy, we offer a full range of financing options and we’re happy to take your current vehicle in trade.</p>
    </div>
    <figure class="logo-figure">
      <img src="/assets/img/dandb-logo.png" alt="D&amp;B Motors, Family Owned logo" width="700" height="574" loading="lazy">
    </figure>
  </div>
</section>
<section class="alt" aria-labelledby="diff-h">
  <div class="wrap">
    <div class="section-head"><h2 id="diff-h">The D&amp;B difference</h2></div>
    ${differenceList()}
  </div>
</section>
${ctaBand('Come say hello', `Stop by ${site.address.street} in Shingle Springs, Monday through Saturday from 10 to 5.`)}`,
}));

/* ---------------- Contact ---------------- */
emit('/contact-us/', layout({
  path: '/contact-us/',
  title: brandTitle('Contact Us & Directions'),
  description: `Contact D&B Motors in Shingle Springs, CA. Sales ${site.phone}, text ${site.textPhone}, email ${site.email}. ${fullAddress}. Open Monday to Saturday, 10 AM to 5 PM.`,
  crumbs: [{ href: '/', label: 'Home' }, { href: '/contact-us/', label: 'Contact' }],
  schema: [dealer],
  body: `
${pageHero({
    crumbs: [{ href: '/', label: 'Home' }, { href: '/contact-us/', label: 'Contact' }],
    title: 'Contact D&amp;B Motors',
    lede: 'Call, text, email or stop by. Sunday visits are by appointment.',
  })}
<section aria-label="Ways to reach us">
  <div class="wrap">
    <div class="contact-cards">
      <a class="contact-card" href="${site.phoneHref}">${icon('phone', 'icon big')}<h2>Call sales</h2><span>${site.phone}</span></a>
      <a class="contact-card" href="${site.smsHref}">${icon('text', 'icon big')}<h2>Text or call</h2><span>${site.textPhone}</span></a>
      <a class="contact-card" href="mailto:${site.email}">${icon('mail', 'icon big')}<h2>Email</h2><span>${site.email}</span></a>
      <a class="contact-card" href="${site.mapUrl}">${icon('pin', 'icon big')}<h2>Visit</h2><span>${site.address.street}<br>${site.address.city}, ${site.address.region} ${site.address.postalCode}</span></a>
    </div>
  </div>
</section>
<section class="alt" aria-labelledby="msg-h">
  <div class="wrap split">
    <div>
      <h2 id="msg-h">Send a message</h2>
      ${leadForm({
        id: 'c',
        subject: 'Website message',
        fields: `<div class="field full"><label for="c-topic">What can we help with?</label><select id="c-topic" name="topic" data-topic-select><option>A vehicle in stock</option><option value="Help me find a car">Help me find a car</option><option>Financing</option><option>Selling or trading my vehicle</option><option>Something else</option></select></div>`,
      })}
    </div>
    <aside class="aside-card" aria-labelledby="hours-h">
      <h2 id="hours-h">Store hours</h2>
      ${hoursList()}
      <iframe class="map small" src="${site.mapEmbed}" title="Map to D&amp;B Motors" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
      <a class="btn btn-ghost" href="${site.mapUrl}">${icon('pin')}Get directions</a>
    </aside>
  </div>
</section>`,
}));

/* ---------------- Privacy policy ---------------- */
emit('/privacy-policy/', layout({
  path: '/privacy-policy/',
  title: brandTitle('Privacy Policy'),
  description: 'How D&B Motors collects, uses and protects the information you share through this website.',
  crumbs: [{ href: '/', label: 'Home' }, { href: '/privacy-policy/', label: 'Privacy policy' }],
  body: `
${pageHero({ crumbs: [{ href: '/', label: 'Home' }, { href: '/privacy-policy/', label: 'Privacy policy' }], title: 'Privacy policy' })}
<section>
  <div class="wrap narrow prose">
    <!-- DRAFT: replace with the dealership's reviewed policy before launch. -->
    <p><strong>Last updated:</strong> ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
    <h2>What we collect</h2>
    <p>When you send a form on this site we receive the details you enter, such as your name, phone number, email address, the vehicle you’re interested in, and information about a vehicle you want to sell or trade. This site does not ask for Social Security numbers or bank details.</p>
    <h2>How we use it</h2>
    <p>We use your information only to respond to your request: answering questions, scheduling test drives, preparing offers and helping with financing. We may contact you by phone, text or email. You can opt out of text messages at any time by replying STOP.</p>
    <h2>Sharing</h2>
    <p>We don’t sell your personal information. If you ask us to help with financing, we share the details needed with lenders only with your permission.</p>
    <h2>Your choices</h2>
    <p>To see, correct or delete the information you’ve sent us, contact us at <a href="mailto:${site.email}">${site.email}</a> or <a href="${site.phoneHref}">${site.phone}</a>.</p>
  </div>
</section>`,
}));

/* ---------------- 404 ---------------- */
emit('/404.html', layout({
  path: '/404.html',
  title: brandTitle('Page Not Found'),
  description: 'The page you’re looking for could not be found.',
  noindex: true,
  body: `
${pageHero({
    title: 'We couldn’t find that page',
    lede: 'If you were looking at a vehicle, it may have sold. <a href="/inventory/">Browse current inventory</a> or go back to the <a href="/">home page</a>.',
  })}
<section aria-label="Current inventory"><div class="wrap">${vehicleGrid(forSale.slice(0, 4))}</div></section>`,
}), { sitemap: false });

/* ---------------- sitemap.xml + robots.txt ---------------- */
const today = new Date().toISOString().slice(0, 10);
writeFileSync(join(out, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((p) => `  <url><loc>${site.url}${p}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`);
writeFileSync(join(out, 'robots.txt'), `User-agent: *
Allow: /

Sitemap: ${site.url}/sitemap.xml
`);

console.log(`Built ${pages.length + 1} pages into public/ (${forSale.length} vehicles for sale)`);
