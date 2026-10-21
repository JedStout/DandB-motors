# D&B Motors: Website

A fast, static replacement for the DealerCenter template site at dbmotors54.com.
Design is built from the logo badge: deep teal-navy ink, a sunset orange → amber → gold sky and steel-blue glass,
with a CarMax-style shopping flow (search, body-style browsing, budget tools, clear vehicle pages).
See [`docs/site-review.md`](docs/site-review.md) for the review of the old site and the CarMax comparison.

## Quick start

Requires [Node.js](https://nodejs.org) 18+ (no packages to install).

```
npm run build    # regenerate HTML into public/
npm run serve    # preview at http://localhost:4321
npm start        # both
```

The finished site is the `public/` folder. Upload that folder to any host.

## Project layout

```
build.mjs            Builds every page into public/ (plus sitemap.xml and robots.txt)
serve.mjs            Local preview server
src/site.mjs         Dealership details: phones, email, address, hours, dealer fee, form + credit-app settings
src/inventory.mjs    Vehicles for sale (price, specs, photos, highlights)
src/layout.mjs       Shared header, footer, icons, vehicle cards and lead forms
public/assets/css/   Styles (edit directly)
public/assets/js/    main.js: menu + forms; inventory.js: search/filters; gallery.js; calculators.js
public/assets/img/   Logo, badge icon, favicons (badge cut from the original logo)
public/_redirects    Redirects for Netlify / Cloudflare Pages
public/.htaccess     Redirects + HTTPS for Apache / cPanel hosting
docs/                Site review
```

The HTML pages in `public/` are generated, so edit `src/` and rebuild instead of editing them by hand.

## Pages (same URLs as the current site)

| URL | Page |
|---|---|
| `/` | Home: search, shop by type, featured cars, budget tools, sell/trade, why D&B, shop by make, visit us |
| `/inventory/` | All vehicles with search, filters and sort. Old links like `?price_max=15000&sort_by=price_desc` still work |
| `/inventory/<make>/` | Vehicles by make (the old "Shop by make" links) |
| `/inventory/<make>/<model>/<stock>/` | Vehicle page: gallery, price breakdown, specs, payment calculator, test-drive form |
| `/apply-online/` | Financing: pre-qualification request (or a link to the secure application) + budget calculator |
| `/value-your-vehicle/` | Sell / trade-in offer request |
| `/about-us/` | Family-owned story (new; this URL was a 404 before) |
| `/contact-us/` | Call, text, email, map, hours, message form |
| `/privacy-policy/` | Draft policy, needs the client's review |

## Updating inventory

Each vehicle in `src/inventory.mjs` looks like this:

```js
{
  stock: '10600', year: 2017, make: 'Subaru', model: 'Crosstrek', trim: '2.0i Premium Sport Utility 4D',
  body: 'SUV',                 // SUV | Truck | Sedan | Motorcycle (drives the "Shop by type" tiles)
  price: 9927,                 // advertised price, INCLUDING the dealer fee
  miles: 141632, drivetrain: 'AWD', transmission: 'Automatic', engine: '4-cyl, PZEV, 2.0 liter',
  fuel: 'Gas', doors: 4, exterior: 'Hyper Blue', interior: 'Black', vin: 'JF2GPADC8HH279930',
  slug: 'subaru/crosstrek',    // URL: /inventory/subaru/crosstrek/10600/
  photos: ['202610-14968c….jpg', …],   // DealerCenter image IDs, first one is the main photo
  highlights: ['All-wheel drive', …],
  equipment: [],
}
```

- **Sold a car?** Add `sold: true`. Its page turns into "This vehicle has sold" with similar cars (and drops out of
  the sitemap and search), so shared links don't dead-end. Remove it entirely a few weeks later.
- **New car?** Add an entry and rebuild. Photos can be DealerCenter image IDs, or put files in `public/assets/img/`
  and change `photoUrl` in `src/inventory.mjs`.

**Long-term:** hand-editing won't scale for a dealer. The best fix is an automatic feed: DealerCenter can export
inventory (CSV/XML) to third-party websites. Once we have that export, a small script can turn it into
`src/inventory.mjs` on every build. Ask the client to request it from DealerCenter support.

## SEO and best practices built in

- Same URLs as the old site for every vehicle and page, so rankings and shared links carry over
- Structured data: `AutoDealer` (address, hours, phone, service area), `Car` with `Offer` on every vehicle page,
  `ItemList` for inventory, breadcrumbs
- Descriptive page titles ("Used 2017 Subaru Crosstrek 2.0i Premium… | D&B Motors, Shingle Springs CA"),
  unique meta descriptions, Open Graph images (vehicle photos), canonical URLs, sitemap
- Prices shown include the dealer fee, with a breakdown on each vehicle page
- Tap-to-call and tap-to-text everywhere, sticky Call/Text/Inventory bar on phones, "Text about this car"
  pre-fills the vehicle and stock number
- All vehicles are in the HTML (crawlable); JavaScript only filters and sorts
- Mobile-first, WCAG AA contrast, keyboard navigation, skip link, reduced-motion support, automatic dark mode
- No frameworks: one stylesheet, four small scripts, two web fonts (Saira Condensed + Barlow)

## Before launch: to do

1. **Forms.** Create a form endpoint (e.g. [Formspree](https://formspree.io)) and paste it into `formEndpoint`
   in `src/site.mjs`. Until then, forms open the visitor's email app addressed to dbmotors54@gmail.com.
2. **Credit application.** The old full application collects SSNs and must stay on a secure provider. Get a
   standalone link to DealerCenter's (or another provider's) application and paste it into `creditAppUrl`.
   Until then, `/apply-online/` collects a short pre-qualification request with no SSN.
3. **Inventory feed.** See "Updating inventory" above.
4. **Fix listing data** (flagged in `note` fields in `src/inventory.mjs`): SONDORS model, Jeep price, Pilot interior.
5. **Privacy policy.** The old policy couldn't be retrieved. Get it from the client or DealerCenter and replace the
   draft. Keep the SMS-consent language if they text leads.
6. **About page.** Get names, a family photo and the story behind "D&B." Real faces are the biggest trust signal
   a small dealer has.
7. **Confirm with the client:** warranty/return/inspection policies, Google Business Profile and Facebook URLs,
   reviews we can quote, and that (916) 870-9552 can be shown everywhere.
8. **DNS.** Find out who controls dbmotors54.com (DealerCenter often manages it) before switching hosts.
9. **After launch.** Submit `https://www.dbmotors54.com/sitemap.xml` in Google Search Console.

## Client preview (GitHub Pages)

Every push to `main` runs `.github/workflows/pages.yml`, which builds a **preview** copy and publishes it to
GitHub Pages (Settings → Pages → Source: GitHub Actions). The preview build:

- shows a "Design preview. Not yet the live site" banner
- adds `noindex` so search engines don't list the copy (canonical tags still point to dbmotors54.com)
- prefixes links with the repository name, since Pages serves the site from `/<repo-name>/`

The committed `public/` folder is always the normal (production) build. To try the preview build locally, run
`PREVIEW=1 BASE_PATH=/DandB-motors node build.mjs` (in Git Bash, prefix it with `MSYS_NO_PATHCONV=1`),
then run `npm run build` again before committing.

## Hosting

Any static host works: Netlify, Cloudflare Pages, GitHub Pages, or cPanel/Apache hosting
(upload the contents of `public/`). Point the build command at `npm run build` and the publish directory at `public`.
