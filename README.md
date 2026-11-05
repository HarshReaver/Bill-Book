# Bill Book

A billing app for a small shop. It is an offline PWA: plain HTML, CSS and JavaScript, no framework, no build step, no login, no internet needed after the first visit. Bills are saved on the phone itself.

## Run it

- Laptop: open the folder with any static server (for example `python -m http.server 8000`) and visit `http://localhost:8000`. The service worker needs `http://localhost` or `https`, so double-clicking `index.html` works for the app but not for offline install.
- Test the maths: `node test.js`

## Put it on GitHub Pages

1. Create a new public repository on GitHub (for example `bill-book`).
2. Upload all files from this folder to the repository root (keep `index.html` at the top level).
3. Go to Settings, then Pages. Under "Build and deployment" choose "Deploy from a branch", branch `main`, folder `/ (root)`, and Save.
4. After a minute your app is at `https://YOUR-NAME.github.io/bill-book/`.

## Install on your phone

- Android (Chrome): open the link, wait for the page to load once, then menu (three dots) and "Install app" or "Add to Home screen".
- iPhone (Safari): open the link, tap Share, then "Add to Home Screen".

Open it once while online so the files are saved. After that it works in flight mode.

When you change any file, edit `CACHE = 'bill-book-v1'` in `sw.js` to `v2`, `v3` and so on, or phones will keep showing the old version.

## Features

- Shop profile: name, address, phone, UPI ID and default tax %.
- Item list with prices: add, edit, delete. Four sample items to start.
- Bills with quantity (decimals allowed, like 2.5 kg), discount in rupees or percent, and tax. Tax is added on top of the amount after discount. All maths is done in whole paise, rounded half up.
- UPI QR code for the exact total, made from a `upi://pay` link with your UPI ID, shop name and amount. Created offline by `qrcode.js` (qrcode-generator by Kazuhiko Arase, MIT licence).
- Share a bill as an image: drawn on a canvas, sent through the phone's share sheet, or downloaded if sharing is not available.
- Bill history with bill numbers (B-0001, B-0002 ...) and today's total.

## Files

`index.html`, `style.css`, `app.js` (screens), `calc.js` (bill maths), `qrcode.js` (QR library), `sw.js` (offline cache), `manifest.webmanifest` and `icon-192.png`, `icon-512.png` (install), `test.js` (tests), `prompts.md`.

## Done when, and how to check

| Done when | How to check |
|---|---|
| Totals match hand calculation on 5 bills | Run `node test.js`. All 5 bills and the discount cap should say PASS. The hand calculations are written in the comments of `test.js`. Also make a bill in the app and compare with a calculator. |
| Works in flight mode and old bills stay saved | Open the app online once. Make a bill. Turn on flight mode, close the app fully, open it again. The app loads and the bill is still in History. Make another bill offline. |
| A UPI app scans the QR and shows the right amount | In the Shop tab save your real UPI ID and shop name. Make a bill and scan the QR on the screen with another phone's UPI app. It should show your name and the bill total. |
| It installs on a real phone | Follow "Install on your phone" above. The app opens full screen from the home screen icon. |

Notes: data is kept in the browser storage of the phone, so clearing browser data for the site deletes the bills. Different phones do not share bills.
