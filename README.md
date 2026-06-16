# 🪺 TabNest — Landing Page

The marketing site for [TabNest](https://github.com/Janhavi12800/tabnest), a cozy Chrome tab organiser.

Live at **https://janhavi12800.github.io/tabnest-website/**

## What's here

```
.
├── index.html       Landing page (hero, features, pricing, FAQ)
├── styles.css       Cozy theme styling (matches the extension)
├── checkout.js      Razorpay Standard Checkout integration
├── success.html     Post-payment thank-you page with activation instructions
├── privacy.html     Privacy policy (linked from Chrome Web Store listing)
├── preview.html     Static dashboard mockup shown in the hero iframe
└── assets/
    ├── icon.png        128px icon
    └── icon-large.png  256px icon
```

## How payment works

1. Visitor enters their email + clicks **Buy Pro · ₹100**
2. Razorpay Standard Checkout opens (UPI / Card / Netbanking)
3. On success, `checkout.js` calls our Google Apps Script with `paymentId` + `email`
4. Apps Script:
   - Verifies the payment with the Razorpay API
   - Writes a row to the Sales Google Sheet
   - Emails the buyer a 6-digit activation code
5. Visitor is redirected to `success.html` with instructions
6. They paste the email + code into the extension to unlock Pro

The "server" (Apps Script + Sheets) costs ₹0 and the landing page is free on GitHub Pages.

## Setting it up yourself

You need:
- A Google Sheet (the database)
- A Google Apps Script Web App deployment (the backend) — see [Code.gs setup notes](https://github.com/Janhavi12800/tabnest/tree/main#payment-system)
- A Razorpay account with the API keys

Then in `checkout.js`, replace:

```js
const RAZORPAY_KEY_ID = 'rzp_test_PASTE_YOUR_KEY_ID';
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/PASTE-DEPLOYMENT-ID/exec';
```

with your actual values. Push to GitHub, enable Pages, done.

## Deploying

GitHub Pages serves this repo automatically. Settings → Pages → Source: `main` branch, `/` (root). URL will be:

```
https://Janhavi12800.github.io/tabnest-website/
```

## License

MIT — same as the extension.

---

Made with 🪶 in India by [Janhavi](https://github.com/Janhavi12800).
