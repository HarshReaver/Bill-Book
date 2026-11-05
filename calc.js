// Bill maths in whole paise (integers) so there are no floating point errors.
// Works in the browser (global Calc) and in Node (require).
const Calc = {
  // "62.5" -> 6250 paise
  toPaise(text) {
    const n = Number(String(text).replace(/,/g, ''));
    return isFinite(n) && n > 0 ? Math.round(n * 100) : 0;
  },

  // paise -> "1,234.50"
  money(paise) {
    return (paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  },

  // amount * percent / 100, rounded half up, using integers only
  percentOf(paise, pct) {
    const basisPoints = Math.round(pct * 100);
    return Math.floor((paise * basisPoints + 5000) / 10000);
  },

  // lines: [{price (paise), qty}]  discType: 'amt' (discValue in paise) or 'pct' (discValue in %)
  compute(lines, discType, discValue, taxPct) {
    const amounts = lines.map(l => Math.floor((l.price * Math.round(l.qty * 1000) + 500) / 1000));
    const subtotal = amounts.reduce((a, b) => a + b, 0);
    const wanted = discType === 'pct' ? Calc.percentOf(subtotal, discValue) : discValue;
    const discount = Math.min(Math.max(wanted, 0), subtotal);
    const taxable = subtotal - discount;
    const tax = Calc.percentOf(taxable, taxPct);
    return { amounts, subtotal, discount, taxable, tax, total: taxable + tax };
  },
};

if (typeof module !== 'undefined') module.exports = Calc;
