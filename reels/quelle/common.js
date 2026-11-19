// Shared timeline helpers for the Seitz Rechtsschutz reels.
// Every frame is drawn by render(t) from scratch, so rendering is deterministic.
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, k) => a + (b - a) * k;
const E = {
  lin: t => t,
  out3: t => 1 - Math.pow(1 - t, 3),
  out5: t => 1 - Math.pow(1 - t, 5),
  inOut: t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  back: t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  backBig: t => { const c1 = 3.2, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
};
const P = (t, s, d) => clamp((t - s) / d);
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const fmt = (n, dec = 0) => n.toLocaleString('de-DE', { minimumFractionDigits: dec, maximumFractionDigits: dec });

// Generic entrance: fade + offset + scale + rotate, eased.
function enter(el, t, a, o = {}) {
  if (typeof el === 'string') el = $(el);
  if (!el) return 0;
  const { d = .55, y = 70, x = 0, s = 1, r = 0, ease = E.out3, fade = .25 } = o;
  const k = ease(P(t, a, d));
  const op = clamp(P(t, a, d * fade + .0001) );
  el.style.opacity = t < a ? 0 : op;
  const sc = lerp(s, 1, k);
  el.style.transform = `translate(${(1 - k) * x}px,${(1 - k) * y}px) scale(${sc}) rotate(${(1 - k) * r}deg)`;
  return k;
}

function splitWords(el) {
  if (typeof el === 'string') el = $(el);
  const walk = node => {
    Array.from(node.childNodes).forEach(n => {
      if (n.nodeType === 3) {
        const parts = n.textContent.split(/(\s+)/);
        const frag = document.createDocumentFragment();
        parts.forEach(p => {
          if (!p) return;
          if (/^\s+$/.test(p)) frag.appendChild(document.createTextNode(' '));
          else { const s = document.createElement('span'); s.className = 'w'; s.textContent = p; frag.appendChild(s); }
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && !n.classList.contains('w')) {
        if (n.classList.contains('hl') || n.classList.contains('keep')) { n.classList.add('w'); }
        else walk(n);
      }
    });
  };
  walk(el);
  return el;
}
function words(el, t, a, step = .12, o = {}) {
  if (typeof el === 'string') el = $(el);
  el.querySelectorAll('.w').forEach((w, i) => enter(w, t, a + i * step, { d: .42, y: 46, s: .9, ease: E.back, fade: .4, ...o }));
}

function count(el, t, a, d, to, dec = 0, suffix = ' €') {
  if (typeof el === 'string') el = $(el);
  const k = E.out3(P(t, a, d));
  el.textContent = fmt(to * k, dec) + suffix;
}

function showScene(id, t, a, b) {
  const el = $(id);
  el.style.visibility = t >= a && t < b ? 'visible' : 'hidden';
  return t >= a && t < b;
}

// Kamera-Feeling: leichtes Schweben eines Elements
function drift(el, t, amp = 6, sp = 1.3, ph = 0) {
  if (typeof el === 'string') el = $(el);
  el.style.translate = `0 ${Math.sin(t * sp + ph) * amp}px`;
}

const SHIELD_ICON = (s = 64) => `<svg width="${s}" height="${s}" viewBox="0 0 86 86" aria-hidden="true"><rect width="86" height="86" rx="22" fill="#0B0B0A"/><path d="M43 16 C55 22 64 22 68 22 V44 C68 58 56 67 43 72 C30 67 18 58 18 44 V22 C22 22 31 22 43 16Z" fill="#FFD60A"/><path d="M32 44 L40 52 L55 35" stroke="#0B0B0A" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const CHECK = (s = 56) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" aria-hidden="true" style="flex:none"><circle cx="12" cy="12" r="11" fill="#FFD60A" stroke="#0B0B0A" stroke-width="1.6"/><path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="#0B0B0A" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const CROSS = (s = 56) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" aria-hidden="true" style="flex:none"><circle cx="12" cy="12" r="11" fill="#0B0B0A"/><path d="M8 8l8 8M16 8l-8 8" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/></svg>`;
const HOUSE = (s = 44, c = '#FFD60A') => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/></svg>`;
const ARROW_DOWN = `<svg width="90" height="74" viewBox="0 0 74 60" fill="none" stroke="#0B0B0A" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 8 C30 6 48 18 52 46"/><path d="M40 38 L52 50 L62 36"/></svg>`;

// Das Schild-Maskottchen der Website, mit winkendem Arm.
function mascot(w = 300, id = 'm') {
  return `<svg id="${id}" width="${w}" height="${w * 520 / 420}" viewBox="-210 -230 420 520" aria-hidden="true" style="overflow:visible">
  <path d="M-50 150 L-58 230" stroke="#0B0B0A" stroke-width="10" stroke-linecap="round" fill="none"/><path d="M50 150 L58 230" stroke="#0B0B0A" stroke-width="10" stroke-linecap="round" fill="none"/>
  <ellipse cx="-70" cy="236" rx="38" ry="18" fill="#0B0B0A"/><ellipse cx="70" cy="236" rx="38" ry="18" fill="#0B0B0A"/>
  <path d="M-118 10 Q-175 40 -180 95" stroke="#0B0B0A" stroke-width="10" stroke-linecap="round" fill="none"/><circle cx="-180" cy="100" r="22" fill="#FFFFFF" stroke="#0B0B0A" stroke-width="10"/>
  <g class="arm"><path d="M118 10 Q175 -20 190 -70" stroke="#0B0B0A" stroke-width="10" stroke-linecap="round" fill="none"/><circle cx="192" cy="-78" r="22" fill="#FFFFFF" stroke="#0B0B0A" stroke-width="10"/></g>
  <path d="M0 -170 C60 -140 110 -140 128 -140 L128 10 C128 95 60 145 0 172 C-60 145 -128 95 -128 10 L-128 -140 C-110 -140 -60 -140 0 -170Z" fill="#FFD60A" stroke="#0B0B0A" stroke-width="10" stroke-linejoin="round"/>
  <path d="M-92 -112 L-92 0 C-92 50 -55 92 -18 112" fill="none" stroke="#FFFFFF" stroke-width="12" stroke-linecap="round" opacity="0.55"/>
  <g class="eyes"><ellipse cx="-42" cy="-46" rx="26" ry="32" fill="#FFFFFF" stroke="#0B0B0A" stroke-width="10"/><ellipse cx="42" cy="-46" rx="26" ry="32" fill="#FFFFFF" stroke="#0B0B0A" stroke-width="10"/>
  <circle cx="-48" cy="-40" r="11" fill="#0B0B0A"/><circle cx="36" cy="-40" r="11" fill="#0B0B0A"/></g>
  <path d="M-66 -96 Q-42 -110 -18 -98 M18 -98 Q42 -110 66 -96" stroke="#0B0B0A" stroke-width="10" stroke-linecap="round" fill="none"/>
  <path d="M-40 22 Q0 62 40 22" stroke="#0B0B0A" stroke-width="10" stroke-linejoin="round" fill="#FFFFFF"/>
  <circle cx="-80" cy="12" r="15" fill="#FF4F3F" opacity="0.35"/><circle cx="80" cy="12" r="15" fill="#FF4F3F" opacity="0.35"/>
</svg>`;
}
function animMascot(sel, t, a) {
  const m = $(sel); if (!m) return;
  const arm = m.querySelector('.arm');
  const wave = Math.sin((t - a) * 9) * 16 * clamp(P(t, a + .3, .3));
  arm.setAttribute('transform', `rotate(${wave} 118 10)`);
  // Blinzeln
  const ph = (t - a) % 2.6;
  const eyes = m.querySelector('.eyes');
  const sy = ph > 2.45 ? .15 : 1;
  eyes.setAttribute('transform', `translate(0 -46) scale(1 ${sy}) translate(0 46)`);
}

// ---------- Grundgerüst: Marke, Wischblende, Abschluss-Karte ----------
const DISCLAIMER = 'Adrian Seitz, selbstständiger Versicherungsvermittler und Vertriebspartner der ARAG. Leistungen je nach Tarif; maßgeblich sind die Versicherungsbedingungen. Wartezeiten möglich, bestehende Streitigkeiten sind nicht versicherbar.';

function baseMarkup() {
  return `
  <div id="brand">${SHIELD_ICON(64)}<div class="t">Seitz <span class="serif" style="letter-spacing:0">Rechtsschutz</span></div></div>
  <div id="wipe">${mascot(260, 'wm')}</div>
  <div class="scene" id="end">
    <div class="abs a" id="e-m" style="left:${540 - 175}px;top:300px">${mascot(350, 'em')}</div>
    <div class="abs a" id="e-h" style="left:0;width:1080px;top:790px;text-align:center">
      <div class="h1" style="font-size:112px">Kostenloser Check</div>
      <div class="serif" style="font-size:96px;line-height:1.05;margin-top:6px"><span class="hl">in 60 Sekunden.</span></div>
    </div>
    <div class="abs" style="left:0;width:1080px;top:1050px;display:flex;justify-content:center;gap:22px">
      <div class="chip a" id="e-c1" style="font-size:34px;padding:12px 24px;box-shadow:5px 5px 0 #0B0B0A">${CHECK(40)} Kostenlos &amp; unverbindlich</div>
      <div class="chip a" id="e-c2" style="font-size:34px;padding:12px 24px;box-shadow:5px 5px 0 #0B0B0A">${CHECK(40)} Persönlich</div>
    </div>
    <div class="abs a" id="e-btn" style="left:110px;width:860px;top:1180px">
      <div class="ycard" style="padding:30px 36px;display:flex;align-items:center;justify-content:center;gap:20px;font-weight:900;font-size:56px;letter-spacing:-.04em">Jetzt Absicherung prüfen
        <svg width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="#0B0B0A" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></div>
    </div>
    <div class="abs a hand" id="e-tap" style="left:560px;top:1325px;font-size:60px;display:flex;align-items:flex-start;gap:6px;transform-origin:left top">Link antippen ${ARROW_DOWN}</div>
    <p class="abs fine a" id="e-disc" style="left:80px;top:1340px;width:470px;margin:0;font-size:21px">${DISCLAIMER}</p>
  </div>`;
}

function renderBase(t, endAt, wipes) {
  // Wischblende
  const w = $('#wipe');
  let y = 2200;
  for (const at of wipes) {
    const k = P(t, at - .38, .76);
    if (k > 0 && k < 1) { y = lerp(1920, -2100, E.inOut(k)); break; }
  }
  w.style.transform = `translateY(${y}px)`;
  const wm = $('#wm');
  wm.style.transform = `translate(-50%,-50%) rotate(${Math.sin(t * 6) * 6}deg)`;
  animMascot('#wm', t, 0);

  // Abschluss
  if (showScene('#end', t, endAt, 1e9)) {
    enter('#e-m', t, endAt + .05, { d: .7, y: 120, s: .5, ease: E.backBig });
    drift('#e-m', t, 10, 2.2);
    animMascot('#em', t, endAt + .4);
    enter('#e-h', t, endAt + .3, { d: .55, y: 60, s: .92, ease: E.back });
    enter('#e-c1', t, endAt + .75, { d: .45, y: 40, s: .8, ease: E.back });
    enter('#e-c2', t, endAt + .9, { d: .45, y: 40, s: .8, ease: E.back });
    const kb = enter('#e-btn', t, endAt + 1.15, { d: .55, y: 60, s: .85, ease: E.backBig });
    if (t > endAt + 2) { const pulse = 1 + Math.max(0, Math.sin((t - endAt - 2) * 4.2)) * .035; $('#e-btn').style.transform = `scale(${pulse})`; }
    enter('#e-tap', t, endAt + 1.6, { d: .5, y: 20, r: -8, ease: E.back });
    if (t > endAt + 1.6) $('#e-tap').style.rotate = '-3deg';
    enter('#e-disc', t, endAt + 1.3, { d: .5, y: 20 });
  }
}

function boot(duration, wipes, endAt, build, render) {
  const stage = $('#stage');
  stage.insertAdjacentHTML('beforeend', baseMarkup());
  build();
  window.DURATION = duration;
  window.render = t => { render(t); renderBase(t, endAt, wipes); };
  window.render(0);
}
