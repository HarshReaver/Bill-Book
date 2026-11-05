// Bill Book: shop profile, items, bills, UPI QR, image sharing, history. Data lives in localStorage.
const $ = s => document.querySelector(s);
const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const { money, toPaise, compute } = Calc;
const RS = '₹';

let shop = load('bb_shop', { name: 'My Shop', address: '', phone: '', upi: '', tax: 5 });
let items = load('bb_items', [
  { id: 'a1', name: 'Tea', price: 1500 },
  { id: 'a2', name: 'Biscuit packet', price: 1000 },
  { id: 'a3', name: 'Rice 1 kg', price: 6250 },
  { id: 'a4', name: 'Soap', price: 3899 },
]);
let bills = load('bb_bills', []);
let qty = {};          // item id -> quantity on the bill being made
let editId = null;     // item being edited
let shown = null;      // bill open in the dialog

const today = () => new Date().toLocaleDateString('en-CA'); // local YYYY-MM-DD

// ---------- tabs ----------
document.querySelectorAll('#tabs button').forEach(b => b.onclick = () => {
  document.querySelectorAll('#tabs button').forEach(x => x.classList.toggle('on', x === b));
  document.querySelectorAll('main section').forEach(s => s.hidden = s.id !== b.dataset.tab);
});

// ---------- new bill ----------
function renderRows() {
  $('#rows').innerHTML = items.length ? items.map(i => `
    <div class="row" data-id="${i.id}">
      <div><div class="name">${esc(i.name)}</div><div class="sub">${RS}${money(i.price)}</div></div>
      <div class="stepper">
        <button data-step="-1" aria-label="One less ${esc(i.name)}">-</button>
        <input type="number" min="0" step="any" inputmode="decimal" value="${qty[i.id] || 0}" aria-label="Quantity of ${esc(i.name)}">
        <button data-step="1" aria-label="One more ${esc(i.name)}">+</button>
      </div>
    </div>`).join('') : '<p class="empty">No items yet. Add some in the Items tab.</p>';
}

$('#rows').addEventListener('click', e => {
  const step = e.target.dataset.step;
  if (!step) return;
  const row = e.target.closest('.row'), input = row.querySelector('input');
  input.value = Math.max(0, Math.round((Number(input.value) + Number(step)) * 1000) / 1000);
  qty[row.dataset.id] = Number(input.value);
  renderSummary();
});
$('#rows').addEventListener('input', e => {
  qty[e.target.closest('.row').dataset.id] = Math.max(0, Number(e.target.value) || 0);
  renderSummary();
});
['#discValue', '#discType', '#taxPct'].forEach(s => $(s).addEventListener('input', renderSummary));

// Works out the bill currently on screen
function current() {
  const lines = items.filter(i => qty[i.id] > 0).map(i => ({ name: i.name, price: i.price, qty: qty[i.id] }));
  const discType = $('#discType').value, raw = Number($('#discValue').value) || 0;
  const discValue = discType === 'amt' ? toPaise(raw) : Math.max(0, raw);
  const taxPct = Math.max(0, Number($('#taxPct').value) || 0);
  return { lines, discType, discValue, taxPct, ...compute(lines, discType, discValue, taxPct) };
}

function renderSummary() {
  const c = current();
  $('#summary').innerHTML = `
    <dt>Subtotal</dt><dd>${RS}${money(c.subtotal)}</dd>
    <dt>Discount</dt><dd>- ${RS}${money(c.discount)}</dd>
    <dt>Tax (${c.taxPct}%)</dt><dd>${RS}${money(c.tax)}</dd>
    <dt class="grand">Total</dt><dd class="grand">${RS}${money(c.total)}</dd>`;
}

function resetBill() {
  qty = {};
  $('#discValue').value = 0;
  $('#discType').value = 'amt';
  $('#taxPct').value = shop.tax;
  renderRows();
  renderSummary();
}

$('#clearBill').onclick = resetBill;
$('#saveBill').onclick = () => {
  const c = current();
  if (!c.lines.length) return alert('Add at least one item to the bill first.');
  const seq = load('bb_seq', 0) + 1;
  const bill = { ...c, no: 'B-' + String(seq).padStart(4, '0'), day: today(), time: new Date().toISOString(), shop: { ...shop } };
  bills.unshift(bill);
  save('bb_bills', bills);
  save('bb_seq', seq);
  resetBill();
  renderHistory();
  openBill(bill);
};

// ---------- history ----------
function renderHistory() {
  const total = bills.filter(b => b.day === today()).reduce((s, b) => s + b.total, 0);
  $('#todayTotal').textContent = $('#todayTotal2').textContent = RS + money(total);
  const when = b => new Date(b.time).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
  $('#billList').innerHTML = bills.length ? bills.map((b, n) => `
    <button class="bill" data-n="${n}"><span>${b.no} &nbsp; ${when(b)}</span><strong>${RS}${money(b.total)}</strong></button>`).join('')
    : '<p class="empty">No bills yet.</p>';
}
$('#billList').onclick = e => { const b = e.target.closest('button'); if (b) openBill(bills[b.dataset.n]); };

// ---------- items ----------
function renderItems() {
  $('#itemList').innerHTML = items.map(i => `
    <div class="row" data-id="${i.id}">
      <div><div class="name">${esc(i.name)}</div><div class="sub">${RS}${money(i.price)}</div></div>
      <div class="btns"><button data-act="edit">Edit</button><button class="danger" data-act="del">Delete</button></div>
    </div>`).join('') || '<p class="empty">No items yet.</p>';
}
function stopEdit() {
  editId = null;
  $('#itemForm').reset();
  $('#itemFormTitle').textContent = 'Add an item';
  $('#itemSave').textContent = 'Add item';
  $('#itemCancel').hidden = true;
}
$('#itemForm').onsubmit = e => {
  e.preventDefault();
  const name = $('#itemName').value.trim(), price = toPaise($('#itemPrice').value);
  if (editId) Object.assign(items.find(i => i.id === editId), { name, price });
  else items.push({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5), name, price });
  save('bb_items', items);
  stopEdit();
  renderItems(); renderRows(); renderSummary();
};
$('#itemCancel').onclick = stopEdit;
$('#itemList').onclick = e => {
  const act = e.target.dataset.act;
  if (!act) return;
  const item = items.find(i => i.id === e.target.closest('.row').dataset.id);
  if (act === 'del') {
    if (!confirm('Delete "' + item.name + '"? Old bills keep it.')) return;
    items = items.filter(i => i !== item);
    delete qty[item.id];
    save('bb_items', items);
    renderItems(); renderRows(); renderSummary();
  } else {
    editId = item.id;
    $('#itemName').value = item.name;
    $('#itemPrice').value = (item.price / 100).toFixed(2);
    $('#itemFormTitle').textContent = 'Edit item';
    $('#itemSave').textContent = 'Save changes';
    $('#itemCancel').hidden = false;
    $('#itemName').focus();
  }
};

// ---------- shop profile ----------
function fillShop() {
  $('#shopName').value = shop.name; $('#shopAddr').value = shop.address; $('#shopPhone').value = shop.phone;
  $('#shopUpi').value = shop.upi; $('#shopTax').value = shop.tax;
  $('#shopTitle').textContent = shop.name;
}
$('#shopForm').onsubmit = e => {
  e.preventDefault();
  shop = { name: $('#shopName').value.trim(), address: $('#shopAddr').value.trim(), phone: $('#shopPhone').value.trim(),
           upi: $('#shopUpi').value.trim(), tax: Math.max(0, Number($('#shopTax').value) || 0) };
  save('bb_shop', shop);
  fillShop();
  $('#taxPct').value = shop.tax;
  renderSummary();
  $('#shopMsg').textContent = 'Saved.';
  setTimeout(() => $('#shopMsg').textContent = '', 2000);
};

// ---------- UPI QR and bill image ----------
function upiLink(b) {
  const q = encodeURIComponent;
  return 'upi://pay?pa=' + q(b.shop.upi).replace(/%40/g, '@') + '&pn=' + q(b.shop.name) +
         '&am=' + (b.total / 100).toFixed(2) + '&cu=INR&tn=' + q('Bill ' + b.no);
}

function drawBill(b) {
  const W = 600, P = 32, cv = $('#billCanvas');
  const F = 'system-ui, "Segoe UI", Roboto, sans-serif';
  cv.width = W;
  cv.height = 1400 + b.lines.length * 36;            // tall enough; trimmed to fit at the end
  const g = cv.getContext('2d');
  const text = (t, x, y, font, align = 'left', color = '#1b1b1b') => {
    g.font = font; g.textAlign = align; g.fillStyle = color; g.fillText(t, x, y);
  };
  const rule = y => { g.fillStyle = '#1b1b1b'; g.fillRect(P, y, W - 2 * P, 2); };
  const fit = (t, max) => { g.font = `20px ${F}`; while (g.measureText(t).width > max && t.length > 1) t = t.slice(0, -2) + '…'; return t; };
  g.fillStyle = '#fff'; g.fillRect(0, 0, W, cv.height);

  let y = 60;
  text(b.shop.name, W / 2, y, `bold 34px ${F}`, 'center');
  if (b.shop.address) text(b.shop.address, W / 2, y += 32, `20px ${F}`, 'center', '#555');
  if (b.shop.phone) text('Phone: ' + b.shop.phone, W / 2, y += 30, `20px ${F}`, 'center', '#555');
  rule(y += 24);
  text('Bill ' + b.no, P, y += 40, `bold 22px ${F}`);
  text(new Date(b.time).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }), W - P, y, `20px ${F}`, 'right');
  rule(y += 18);
  text('Item', P, y += 34, `bold 19px ${F}`);
  text('Qty x Price', 420, y, `bold 19px ${F}`, 'right');
  text('Amount', W - P, y, `bold 19px ${F}`, 'right');
  y += 8;
  b.lines.forEach((l, i) => {
    y += 36;
    text(fit(l.name, 230), P, y, `20px ${F}`);
    text(l.qty + ' x ' + money(l.price), 420, y, `19px ${F}`, 'right');
    text(money(b.amounts[i]), W - P, y, `20px ${F}`, 'right');
  });
  rule(y += 22);
  const row = (label, value, font = `21px ${F}`) => {
    text(label, P, y += 36, font); text(value, W - P, y, font, 'right');
  };
  row('Subtotal', money(b.subtotal));
  if (b.discount) row(b.discType === 'pct' ? `Discount (${b.discValue}%)` : 'Discount', '- ' + money(b.discount));
  if (b.taxPct) row(`Tax (${b.taxPct}%)`, money(b.tax));
  rule(y += 16);
  row('TOTAL', RS + money(b.total), `bold 30px ${F}`);

  if (b.shop.upi && b.total > 0) {
    const qr = qrcode(0, 'M');
    qr.addData(upiLink(b));
    qr.make();
    const n = qr.getModuleCount(), cell = Math.floor(280 / (n + 8)), size = cell * (n + 8), x0 = (W - size) / 2;
    y += 30;
    g.fillStyle = '#fff'; g.fillRect(x0, y, size, size);        // white border (quiet zone) around the code
    g.fillStyle = '#000';
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++)
      if (qr.isDark(r, c)) g.fillRect(x0 + (c + 4) * cell, y + (r + 4) * cell, cell, cell);
    text('Scan to pay ' + RS + money(b.total) + ' by UPI', W / 2, y += size + 30, `bold 22px ${F}`, 'center');
    text(b.shop.upi, W / 2, y += 30, `19px ${F}`, 'center', '#555');
  }
  text('Thank you', W / 2, y += 46, `20px ${F}`, 'center', '#555');

  const trimmed = g.getImageData(0, 0, W, y + 30);               // cut off the unused white space
  cv.height = y + 30;
  g.putImageData(trimmed, 0, 0);
}

function openBill(b) {
  shown = b;
  drawBill(b);
  $('#qrNote').textContent = !b.shop.upi ? 'No UPI ID was saved when this bill was made. Add it in the Shop tab to get a QR code on new bills.'
    : b.total <= 0 ? 'The total is zero, so there is nothing to pay.' : '';
  $('#billDialog').showModal();
}

const imageBlob = () => new Promise(done => $('#billCanvas').toBlob(done, 'image/png'));

function download(blob, name) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

$('#shareBtn').onclick = async () => {
  const blob = await imageBlob(), name = shown.no + '.png';
  const file = new File([blob], name, { type: 'image/png' });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ files: [file], title: 'Bill ' + shown.no }); return; }
    catch (e) { if (e.name === 'AbortError') return; }   // user closed the share sheet
  }
  download(blob, name);                                    // fallback: save the image
};
$('#downloadBtn').onclick = async () => download(await imageBlob(), shown.no + '.png');
$('#closeBtn').onclick = () => $('#billDialog').close();

// ---------- start ----------
fillShop(); resetBill(); renderItems(); renderHistory();
if (navigator.storage && navigator.storage.persist) navigator.storage.persist();   // ask the phone not to wipe saved bills
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');
