/* ==========================================================
   Digital business card · script.js
   Edit CONFIG, then everything else (vCard, QR, share) follows.
   Without JS the card still reads, links and mailto/tel work.
   ========================================================== */
(() => {
  'use strict';

  const CONFIG = {
    firstName: 'Your',
    lastName: 'Name',
    org: 'Studio Name',
    title: 'Product Designer',
    email: 'hello@example.com',
    phone: '+966500000000',
    url: 'https://example.com',
    city: 'Jeddah',
    country: 'Saudi Arabia',
    note: 'Digital business card',
    // Optional: paste a short link (Bitly, Rebrandly, your own domain). Used for QR + sharing.
    shortUrl: '',
    // Optional: path to a photo to embed in the vCard (small JPEG, < 50 KB)
    photo: '',
  };

  const $ = (s, r = document) => r.querySelector(s);
  const shareUrl = () => CONFIG.shortUrl || location.href.split('#')[0];

  /* ---------- Toast (announced via aria-live) ---------- */
  const toast = $('[data-toast]');
  let toastTimer;
  const notify = (msg) => {
    toast.textContent = msg;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2200);
  };

  /* ---------- Clipboard with fallback ---------- */
  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const ta = Object.assign(document.createElement('textarea'), { value: text });
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;opacity:0';
      document.body.append(ta);
      ta.select();
      const ok = document.execCommand && document.execCommand('copy');
      ta.remove();
      return !!ok;
    }
  }
  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-copy]');
    if (!btn) return;
    const ok = await copyText(btn.dataset.copy);
    notify(ok ? `Copied ${btn.dataset.label}` : 'Copy failed. Select the text and copy it manually.');
    if (ok) { btn.dataset.done = ''; setTimeout(() => delete btn.dataset.done, 1500); }
  });

  /* ---------- vCard 3.0 ---------- */
  const esc = (s) => String(s).replace(/([\\;,])/g, '\\$1').replace(/\n/g, '\\n');
  async function buildVCard() {
    const c = CONFIG;
    const lines = [
      'BEGIN:VCARD', 'VERSION:3.0',
      `N:${esc(c.lastName)};${esc(c.firstName)};;;`,
      `FN:${esc(`${c.firstName} ${c.lastName}`)}`,
      `ORG:${esc(c.org)}`, `TITLE:${esc(c.title)}`,
      `TEL;TYPE=CELL:${c.phone}`, `EMAIL;TYPE=INTERNET:${c.email}`,
      `URL:${c.url}`, `ADR;TYPE=WORK:;;;${esc(c.city)};;;${esc(c.country)}`,
      `NOTE:${esc(c.note)}`,
    ];
    if (c.photo) {
      try {
        const blob = await (await fetch(c.photo)).blob();
        const b64 = await new Promise((res) => { const r = new FileReader(); r.onload = () => res(r.result.split(',')[1]); r.readAsDataURL(blob); });
        lines.push(`PHOTO;ENCODING=b;TYPE=JPEG:${b64}`);
      } catch { /* photo is optional */ }
    }
    lines.push('END:VCARD');
    return lines.join('\r\n');
  }
  $('[data-vcard]')?.addEventListener('click', async () => {
    const blob = new Blob([await buildVCard()], { type: 'text/vcard;charset=utf-8' });
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(blob),
      download: `${CONFIG.firstName}-${CONFIG.lastName}.vcf`.toLowerCase(),
    });
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    notify('Contact file downloaded');
  });

  /* ---------- Share (Web Share API, else hidden) ---------- */
  const shareBtn = $('[data-share]');
  if (shareBtn && navigator.share) {
    shareBtn.hidden = false;
    shareBtn.addEventListener('click', () =>
      navigator.share({ title: document.title, url: shareUrl() }).catch(() => {}));
  }

  /* ---------- QR code + short URL ---------- */
  const qr = $('[data-qr]');
  const urlLabel = $('[data-short-url]');
  if (urlLabel) urlLabel.textContent = shareUrl().replace(/^https?:\/\//, '');
  $('[data-copy-url]')?.addEventListener('click', async () =>
    notify((await copyText(shareUrl())) ? 'Link copied' : 'Copy failed'));

  let qrDrawn = false;
  function drawQR() {
    if (qrDrawn) return;
    const target = $('[data-qr-target]');
    if (typeof QRCode === 'undefined') { qr.hidden = true; return; } // progressive enhancement
    new QRCode(target, { text: shareUrl(), width: 192, height: 192, correctLevel: QRCode.CorrectLevel.M });
    qrDrawn = true;
  }
  qr?.addEventListener('toggle', () => qr.open && drawQR());
  window.addEventListener('beforeprint', () => qr && drawQR()); // QR appears in print

  /* ---------- Theme toggle (system default, manual override saved) ---------- */
  const root = document.documentElement;
  const toggle = $('[data-theme-toggle]');
  const mq = matchMedia('(prefers-color-scheme: dark)');
  const isDark = () => root.dataset.theme ? root.dataset.theme === 'dark' : mq.matches;
  const sync = () => toggle?.setAttribute('aria-pressed', String(isDark()));
  toggle?.addEventListener('click', () => {
    const next = isDark() ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('card-theme', next); } catch { /* private mode */ }
    sync();
  });
  mq.addEventListener?.('change', sync);
  sync();
})();
