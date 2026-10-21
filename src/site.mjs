// Dealership details used on every page. Edit here, then run `npm run build`.
// Contact details, hours and the dealer fee were taken from dbmotors54.com on 2026-10-20.
export const site = {
  name: 'D&B Motors',
  legalName: 'D and B Motors',
  tagline: 'Family Owned',
  url: 'https://www.dbmotors54.com',
  phone: '(530) 350-8978',
  phoneHref: 'tel:+15303508978',
  phoneE164: '+1-530-350-8978',
  // Second line listed in every vehicle description as "text or call"
  textPhone: '(916) 870-9552',
  textPhoneHref: 'tel:+19168709552',
  smsHref: 'sms:+19168709552',
  email: 'dbmotors54@gmail.com',
  address: {
    street: '4120 Sunset Ln, Ste D',
    city: 'Shingle Springs',
    region: 'CA',
    postalCode: '95682',
  },
  mapUrl: 'https://maps.app.goo.gl/MpzPovNFnb8agUHm6',
  mapEmbed: 'https://maps.google.com/maps?q=4120+Sunset+Ln+Ste+D,+Shingle+Springs,+CA+95682&output=embed',
  hours: [
    { days: 'Monday – Saturday', time: '10:00 AM – 5:00 PM', schema: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], opens: '10:00', closes: '17:00' },
    { days: 'Sunday', time: 'By appointment' },
  ],
  serviceArea: ['Shingle Springs', 'Cameron Park', 'Placerville', 'El Dorado Hills', 'Folsom', 'Diamond Springs', 'Rescue'],

  // Advertised prices already include this fee (shown as "includes dealer fees" on the old site).
  // Price - dealerFee = vehicle price. Tax, title and registration are extra.
  dealerFee: 115,

  // Payment calculator defaults (estimates only; see the disclaimer on each vehicle page).
  calc: { down: 1000, term: 60, apr: 9.9 },

  // Secure credit application. The full application collects SSNs, so it must stay on a
  // secure, compliant provider (DealerCenter's form today). Paste its URL here. Left empty,
  // /apply-online/ shows a short pre-qualification request (no SSN) instead.
  creditAppUrl: '',

  // Form handling: paste a form-service endpoint (e.g. https://formspree.io/f/xxxxxxx).
  // Left empty, the forms open the visitor's email app pre-filled to `email` instead.
  formEndpoint: '',

  social: {
    // facebook: 'https://www.facebook.com/...',
  },
};
