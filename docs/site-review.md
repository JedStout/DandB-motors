# D&B Motors: Current Site Review and CarMax Comparison

Reviewed 2026-10-20: https://www.dbmotors54.com (live site) and https://www.carmax.com (benchmark).

## What's there today

The current site is a **DealerCenter "DWS" template** (WordPress 6.6 behind Cloudflare). DealerCenter is also
the dealership's inventory/DMS system, so listings, photos and the credit application all flow from it.

| Page | URL | Notes |
|---|---|---|
| Home | `/` | Stock photo slider (a Lexus, a Chevy and a BMW, none of them D&B cars), "Search by price" links, carousel of inventory, "Shop by make", a welcome paragraph |
| Inventory | `/inventory/` | 10 vehicles, sort options, compare checkbox |
| Vehicle pages | `/inventory/<make>/<model>/<stock>/` | Photos, specs, payment calculator, "Request a quote / Confirm availability / Schedule test drive" buttons |
| Apply Online | `/apply-online/` | Full credit application (collects SSN, DOB, employer, income, co-buyer) |
| Value Your Vehicle | `/value-your-vehicle/` | Trade-in form |
| Contact Us | `/contact-us/` | Address, phone, email, hours, message form |
| Privacy Policy | `/privacy-policy/` | Could not be retrieved (Cloudflare challenge). Get a copy from the client or DealerCenter |
| About Us | none | `/about-us/` returns a 404 |

### Contact information (pulled from the site)

- **Name:** D and B Motors (logo: "D&B Motors, Family Owned")
- **Address:** 4120 Sunset Ln, Ste D, Shingle Springs, CA 95682 ([map](https://maps.app.goo.gl/MpzPovNFnb8agUHm6))
- **Sales:** (530) 350-8978
- **Text or call:** (916) 870-9552 (appears only inside vehicle descriptions)
- **Email:** dbmotors54@gmail.com
- **Hours:** Mon–Sat 10:00 AM – 5:00 PM; Sunday by appointment
- **Dealer fee:** $115, already included in advertised prices
- **Social links:** none on the site

### Brand

The logo (and favicon) is a round badge: a gold SUV in front of a sunset, inside a dark ring, with
"D&B MOTORS" in a squared display face and "FAMILY OWNED" in spaced orange caps. Colors sampled from the file:

| Role | Hex | Where |
|---|---|---|
| Ink (deep teal-navy) | `#04242C` | Ring, lettering, ground |
| Sunset orange | `#DD550F` | Sky top, "FAMILY OWNED" (also the old site's accent) |
| Amber | `#EB7520` | Sky middle |
| Gold | `#F1C75E` | Sky bottom, SUV body |
| Steel blue | `#B7CFD6` | Letter bevel, glass |

## Issues found

**Trust and accuracy**
1. Home slider uses generic stock photos of cars D&B doesn't sell (Lexus, BMW).
2. The Jeep Grand Cherokee (stock 10603) is listed at **$9,927** but its description says **$10,927**.
3. The 2021 SONDORS (10415) is listed as a "Storm," but its description is for a **Metacycle**. No mileage is listed.
4. The 2016 Honda Pilot (10611) description says tan leather, but the specs say a gray interior.
5. Descriptions are written in all caps with typos ("SHOULSD," "OWENED," "TODAT") and seasonal copy
   ("summer pricing… when the snow falls") that dates quickly.
6. Four of the 10 vehicles have no exterior/interior color; four have no description.
7. The text line (916) 870-9552 isn't in the header, footer or contact page, only in descriptions.
8. Nothing tells the family story: no names, photos or "About" page, though "Family Owned" is the brand.

**Shopping experience**
9. No keyword search, body-type browsing or filters beyond price and make.
10. The price modal says "No dealer fees disclosed," which contradicts the "Includes dealer fees" label next to the price.
11. No click-to-text, and the calls to action are generic modals.
12. No map or directions embed on the contact page.

**Technical / SEO**
13. Page titles are all-caps listing dumps ("USED SUBARU CROSSTREK 2017 for sale in Shingle Springs, CA").
14. Heavy template: Bootstrap 3, jQuery, 4 slider libraries, 30+ CSS/JS files, Google Translate widget.
15. Cloudflare's bot challenge also blocks some legitimate crawlers and link previews (it blocked our review tools).
16. No `AutoDealer` or `Car` structured data, so Google can't show rich vehicle and dealer results.

## CarMax comparison

| CarMax does | D&B today | New D&B site |
|---|---|---|
| Big "search make, model or keyword" box up top | No search | ✅ Hero search + quick chips (SUVs, Trucks, AWD/4x4, Under $10K, Lowest miles) |
| "Shop popular body styles" icon row | No | ✅ Body-style tiles, icons drawn in the logo badge style and colors |
| Budget shortcuts (Under $20K, etc.) | Price links only | ✅ Budget tiles with live match counts |
| "Find cars that fit your budget" payment → price calculator | No | ✅ Budget calculator links to matching inventory |
| "Get a real offer in 2 minutes" sell/trade band | Buried in nav | ✅ Sell/trade band on home + dedicated page |
| "Ready for you today" vehicle cards | Carousel | ✅ Card grid: photo, body chip, miles, drivetrain, price incl. fees |
| Filters + sort on results | Sort only | ✅ Search, type, make, max price, drivetrain, sort (shareable URLs) |
| Vehicle page: gallery, key specs, payment estimate, clear CTAs | Partial | ✅ Gallery, specs, highlights, price breakdown, payment calculator, text/call/test drive/pre-qualify |
| "The CarMax difference" trust points | Welcome paragraph | ✅ "The D&B difference": family owned, fees included, financing, trade-ins |
| Pre-qualify with no credit impact | Full SSN app only | ✅ Short pre-qualification request (no SSN); full secure app stays with provider |
| Returns window and limited warranty | None stated | ❓ Not offered as far as we know. Ask the client; if they offer any guarantee, it's a strong selling point |
| Saved cars, compare, account | Compare only | Phase 2 |
| Research articles, car-model pages | No | Phase 2 (e.g. "Best used AWD vehicles for the Sierra foothills") |

What a small dealer can do that CarMax can't: **text the owner directly**, a real family face and story, and
local knowledge (snow-ready AWD/4x4, foothill commutes). The new design leans into those.

## Open questions for the client

1. **Inventory feed.** Cars sell weekly. Does D&B want to keep entering vehicles in DealerCenter? If so, ask
   DealerCenter for an inventory export (CSV/XML feed) so the site updates automatically. (See README.)
2. **Credit application.** Keep using DealerCenter's secure application (we need a standalone link), or switch providers?
3. Family names, photos and the story behind "D&B." When did the dealership open?
4. Warranty, return or inspection policies to advertise?
5. Google Business Profile and Facebook URLs, plus any customer reviews we're allowed to quote.
6. Correct model and price for the SONDORS and the Grand Cherokee; the Pilot's interior color.
7. Is "text or call (916) 870-9552" OK to feature everywhere?
8. Which domain/hosting to launch on, and who controls the dbmotors54.com DNS (DealerCenter or the owners)?
