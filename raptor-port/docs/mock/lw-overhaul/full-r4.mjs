// Round 4 (21 Oct 26): the Leave War's top redrawn after round 3 — the stages gone and one chip saying what is open
// (D1177), the period picker labelled "View" (D1174), no "Viewing as" chip (D1173) — over the round-2 pictures, whose
// own top showed the lock dates. Question 10 (where Approvals opens) is drawn both ways: A where "Viewing as" was, B
// beside the open-dates chip. Also question 9's window gets the app's one Document button (D1159).
// Drawn over the PICTURES in full/ (measured: desktop rows 71-137 and 140-199; phone rows from 147, 3x); nothing here
// runs the app. Run from raptor-port with NODE_PATH at a node_modules that has @playwright/test; pictures to OUT.
import { writeFileSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium, OUT, errs, PINK } from './full-lib.mjs'
const HERE = dirname(fileURLToPath(import.meta.url))
const pic = f => 'data:image/png;base64,' + readFileSync(join(HERE, 'full', f)).toString('base64')

const CHEV = '<svg viewBox="0 0 12 8" width="1em" height=".7em" aria-hidden="true"><path d="M1 1.5l5 5 5-5" fill="none" stroke="#57c97a" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'
const UP = '<svg viewBox="0 0 16 16" width="1.05em" height="1.05em" aria-hidden="true"><path d="M8 11V2.5M4.5 6L8 2.5 11.5 6M2.5 10.5v2.2c0 .5.4.8.8.8h9.4c.4 0 .8-.3.8-.8v-2.2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
const appr = mk => `<span class="chip"${mk ? ` data-mk="${mk}"` : ''}>Approvals <i class="n">15</i></span>`
const view = (phone, mk) => `<span class="vw"${mk ? ` data-mk="${mk}"` : ''}><span class="lab">VIEW</span><span class="chip pick">JAN - DEC 26 ${CHEV}</span></span>`
const open = (phone, mk) => `<span class="chip open"${mk ? ` data-mk="${mk}"` : ''}><span>${phone ? 'Open' : 'Open for bidding'}</span><b>1 Jan – 31 Mar</b></span>`
const under = phone => phone ? '<span class="chip">Under <b>0</b> days</span>' : '<span class="lab">UNDER-MANNED</span><span class="chip"><b>0</b> days</span>'
const myleave = (who, mk) => {
  const [lve, w, nx] = who === 'member' ? ['14.5', '2 waiting', 'next 19 Jan'] : ['17', '0 waiting', 'next 30 Jan']
  return `<span class="ml"${mk ? ` data-mk="${mk}"` : ''}><span class="lab">MY LEAVE</span><b>LVE ${lve}</b> · OIL 0 · ${w} · ${nx}<span class="sp"></span>›</span>`
}
// a band of the picture covered and redrawn: [top, bottom, inner]
const band = (t, b, inner, cls = '') => `<div class="band ${cls}" style="top:${t}px;height:${b - t + 1}px">${inner}</div>`
// copy a clean strip of the same picture over a spot (to lift an old tag off the card's edge)
const line = y => `<div class="line" style="top:${y}px"></div>`
const patch = (img, sx, x, y, w, h) => `<div class="patch" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;background:url(${img}) -${sx}px -${y}px no-repeat"></div>`

function desk(variant, admin = true) {
  const r1 = `<div class="row">${view(false, 'A')}<span class="chip">+ New</span>${admin && variant === 'A' ? appr('B') : ''}</div>`
  const r2 = `<div class="row">${admin && variant === 'B' ? appr('B') : ''}${open(false, 'C')}${under(false)}<span class="chip">Legend</span><span class="sp"></span>${myleave('admin', 'D')}</div>`
  return band(71, 137, r1) + band(140, 199, r2, 'flat')
}
function phone(variant, who, rows = 3, ys) {
  const admin = who === 'admin'
  const [a1, a2, l2, b2, l3, b3] = ys
  const r1 = `<div class="row">${view(true, 'A')}${admin ? '<span class="chip sq">+</span>' : ''}<span class="sp"></span>${admin && variant === 'A' ? appr('B') : ''}</div>`
  const r2 = `<div class="row${variant === 'B' && admin ? ' tight' : ''}">${admin && variant === 'B' ? appr('B') : ''}${open(true, admin ? 'C' : 'B')}${under(true)}<span class="sp"></span><span class="chip">Legend</span></div>`
  const r3 = `<div class="row">${myleave(who, admin ? 'D' : 'C')}</div>`
  return band(a1, a2, r1) + line(a2 + 1) + band(a2 + 4, l2 - 1, r2) + line(l2) + (rows === 3 ? band(l2 + 3, b3, r3) : '')
}

const CSS = u => `
:root{color-scheme:dark}*{box-sizing:border-box}body{margin:0;background:#0b0d10;font-family:system-ui,-apple-system,"Segoe UI",sans-serif}
.pic{position:relative;--u:${u}px}.pic>img{display:block}
.band{position:absolute;left:0;right:0;background:linear-gradient(#0d1015,#090b0e);display:flex;align-items:center;overflow:hidden}
.band.flat{background:#0e1014}
.row{display:flex;align-items:center;gap:calc(8*var(--u));width:100%;padding:0 calc(var(--pad)*var(--u));white-space:nowrap}
.sp{flex:1}
.lab{font:600 calc(11*var(--u)) system-ui;letter-spacing:.14em;color:#8a96a3}
.vw{display:inline-flex;align-items:center;gap:calc(9*var(--u))}
.chip{display:inline-flex;align-items:center;gap:calc(6*var(--u));height:calc(var(--ch)*var(--u));padding:0 calc(10*var(--u));border-radius:calc(7*var(--u));border:max(1px,calc(1*var(--u))) solid #2a323c;background:#12161b;color:#e6edf3;font:600 calc(var(--fs)*var(--u)) system-ui}
.chip b{font-weight:700;color:#fff}
.chip .n{font-style:normal;font:700 calc((var(--fs) - 1)*var(--u)) system-ui;color:#5fd0e6;background:#16303b;border-radius:calc(9*var(--u));padding:calc(1*var(--u)) calc(7*var(--u))}
.chip.pick{border-color:rgba(87,201,122,.55);background:#0f1d15;font-weight:700;height:calc(var(--pk)*var(--u));font-size:calc(var(--pf)*var(--u))}
.chip.sq{height:calc(var(--pk)*var(--u));width:calc(var(--pk)*var(--u));justify-content:center;padding:0;font-size:calc(var(--pf)*1.3*var(--u));font-weight:400;color:#c9d1d9}
.chip.open{border-color:rgba(87,201,122,.7);background:#0f1d15}.chip.open span{color:#e6edf3;font-weight:600}.chip.open b{color:#8FE0A8}
.ml{display:flex;align-items:center;gap:calc(5*var(--u));height:calc(var(--mh)*var(--u));padding:0 calc(12*var(--u));border-radius:calc(8*var(--u));border:max(1px,calc(1*var(--u))) solid #2a323c;background:#1a1f26;color:#e6edf3;font:600 calc(var(--fs)*var(--u)) system-ui}
.row>.ml:only-child{flex:1}.ml b{font-weight:800}.ml .lab{margin-right:calc(4*var(--u))}
.row.tight{gap:calc(6*var(--u));-webkit-mask-image:linear-gradient(90deg,#000 88%,transparent);mask-image:linear-gradient(90deg,#000 88%,transparent)}
.row.tight .sp{display:none}
.patch{position:absolute}.line{position:absolute;left:0;right:0;height:3px;background:rgb(42,49,58)}
.doc{position:absolute;display:flex;align-items:center}
.mk{position:absolute;border:calc(2.4*var(--u)) solid ${PINK};border-radius:calc(7*var(--u));pointer-events:none}
.mk b{position:absolute;top:calc(-11*var(--u));left:calc(-11*var(--u));width:calc(20*var(--u));height:calc(20*var(--u));border-radius:50%;background:${PINK};color:#fff;font:800 calc(11*var(--u))/calc(20*var(--u)) system-ui;text-align:center}
`
const VARS = { desk: '--pad:20;--ch:32;--fs:13.5;--pk:28;--pf:13.5;--mh:34', phone: '--pad:10;--ch:23;--fs:11.2;--pk:28;--pf:12.6;--mh:25' }

// [out name, base picture, width, height, kind, overlay html, crop height]
const DESK_TAGS = img => patch(img, 700, 18, 200, 156, 28) + patch(img, 700, 168, 200, 160, 28) + patch(img, 700, 1436, 200, 176, 28)
const JOBS = []
{ const i = pic('p-desk-admin.png'); JOBS.push(['r4-desk-admin-A', i, 1920, 1075, 'desk', desk('A') + DESK_TAGS(i)], ['r4-desk-admin-B', i, 1920, 1075, 'desk', desk('B') + DESK_TAGS(i)]) }
{ const i = pic('p-phone-admin.png'); for (const v of ['A', 'B']) JOBS.push([`r4-phone-admin-${v}`, i, 1170, 2532, 'phone', phone(v, 'admin', 3, [147, 269, 387, 0, 0, 505]), 1300]) }
{ const i = pic('p-phone-member.png'); JOBS.push(['r4-phone-member', i, 1170, 2532, 'phone', phone('A', 'member', 3, [147, 269, 372, 0, 0, 490])]) }
{ const i = pic('p-w10-desk-approvals.png'); JOBS.push(['r4-w10-desk-approvals', i, 1920, 1075, 'desk', desk('A').replace(/ data-mk="[A-D]"/g, '')]) }
{ const i = pic('p-w10-phone-approvals.png'); JOBS.push(['r4-w10-phone-approvals', i, 1170, 2532, 'phone', phone('A', 'admin', 2, [147, 269, 372, 0, 0, 0]).replace(/ data-mk="[A-D]"/g, '')]) }
{
  const i = pic('p-w7-desk-admin-new.png')
  // the window's document row: the drawn paper clip replaced by the app's one Document button (D1159)
  const doc = `<div class="doc" style="left:733px;top:1003px;width:192px;height:42px;background:#161b22"><span class="chip" style="--ch:30">${UP} Document</span></div>`
  JOBS.push(['r4-w7-desk-admin-new', i, 1920, 1075, 'desk', band(71, 137, `<div class="row">${view(false)}<span class="chip">+ New</span>${appr()}</div>`) + band(140, 196, `<div class="row">${open(false)}${under(false)}<span class="chip">Legend</span><span class="sp"></span>${myleave('admin')}</div>`, 'flat') + doc])
}

const browser = await chromium.launch()
for (const [name, img, W, H, kind, over, crop] of JOBS) {
  const u = kind === 'desk' ? 1.25 : 3
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>${CSS(u)}</style></head><body><div class="pic" id="pic" style="${VARS[kind]};width:${W}px;height:${H}px"><img src="${img}" width="${W}" height="${H}" alt="">${over}</div></body></html>`
  const ctx = await browser.newContext({ viewport: { width: W, height: Math.min(H, crop || H) }, deviceScaleFactor: 1 })
  const p = await ctx.newPage(); p.on('pageerror', e => errs.push(String(e)))
  await p.setContent(html); await p.waitForTimeout(300)
  // pink marks round every new part, drawn from where the browser actually placed it
  const fit = await p.evaluate(() => {
    const pic = document.getElementById('pic'), P = pic.getBoundingClientRect(), u = parseFloat(getComputedStyle(pic).getPropertyValue('--u'))
    for (const el of document.querySelectorAll('[data-mk]')) {
      const r = el.getBoundingClientRect(), m = document.createElement('span'); m.className = 'mk'
      Object.assign(m.style, { left: r.left - P.left - 4 * u + 'px', top: r.top - P.top - 3 * u + 'px', width: r.width + 8 * u + 'px', height: r.height + 6 * u + 'px' })
      m.innerHTML = `<b>${el.dataset.mk}</b>`; pic.appendChild(m)
    }
    // does each row fit its width? (question 10, B on a phone)
    return [...document.querySelectorAll('.row')].map(r => r.scrollWidth - r.clientWidth)
  })
  console.log(name, 'overflow px per row:', fit.join(' '))
  await p.screenshot({ path: join(OUT, name + '.png'), clip: { x: 0, y: 0, width: W, height: Math.min(H, crop || H) } })
  await ctx.close()
}
await browser.close(); console.log('errors:', errs)
