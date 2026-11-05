// Run with: node test.js
// Five bills with hand-calculated answers (all amounts in paise).
const Calc = require('./calc.js');

const bills = [
  { name: '1. plain bill, 5% tax',
    lines: [{ price: 1500, qty: 2 }, { price: 1000, qty: 3 }], discType: 'amt', disc: 0, tax: 5,
    // 30.00 + 30.00 = 60.00 ; tax 3.00
    want: { subtotal: 6000, discount: 0, tax: 300, total: 6300 } },
  { name: '2. decimal qty, 10% discount',
    lines: [{ price: 6250, qty: 2.5 }, { price: 18575, qty: 1 }], discType: 'pct', disc: 10, tax: 5,
    // 156.25 + 185.75 = 342.00 ; disc 34.20 ; 307.80 ; tax 15.39
    want: { subtotal: 34200, discount: 3420, tax: 1539, total: 32319 } },
  { name: '3. rupee discount, 18% tax',
    lines: [{ price: 3899, qty: 3 }], discType: 'amt', disc: 697, tax: 18,
    // 116.97 - 6.97 = 110.00 ; tax 19.80
    want: { subtotal: 11697, discount: 697, tax: 1980, total: 12980 } },
  { name: '4. rounding of discount and tax',
    lines: [{ price: 733, qty: 7 }, { price: 4550, qty: 3 }], discType: 'pct', disc: 12.5, tax: 12,
    // 51.31 + 136.50 = 187.81 ; disc 23.47625 -> 23.48 ; 164.33 ; tax 19.7196 -> 19.72
    want: { subtotal: 18781, discount: 2348, tax: 1972, total: 18405 } },
  { name: '5. tax of 24.975 paise rounds up',
    lines: [{ price: 999, qty: 1 }], discType: 'amt', disc: 0, tax: 2.5,
    // 9.99 ; tax 0.24975 -> 0.25 ; total 10.24
    want: { subtotal: 999, discount: 0, tax: 25, total: 1024 } },
];

let failed = 0;
for (const b of bills) {
  const got = Calc.compute(b.lines, b.discType, b.disc, b.tax);
  const ok = Object.keys(b.want).every(k => got[k] === b.want[k]);
  if (!ok) failed++;
  console.log((ok ? 'PASS ' : 'FAIL ') + b.name + (ok ? '' : ' got ' + JSON.stringify(got)));
}

// A discount bigger than the bill can never make the total negative.
const capped = Calc.compute([{ price: 2750, qty: 1 }], 'amt', 5000, 5);
if (capped.total !== 0) { failed++; console.log('FAIL discount cap'); } else console.log('PASS discount is capped at the subtotal');

console.log(failed ? failed + ' test(s) failed' : 'All tests passed');
process.exit(failed ? 1 : 0);
