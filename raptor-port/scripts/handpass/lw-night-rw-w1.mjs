// RE-WALK W1 (w2 FAIL 1, 2): Ranger's own war-approved leave window — add a document, press its chip's ✕ → the chip leaves at once and the button reads "Document";
// untick the till, tick it again → shown ticked at once (the screen follows what is saved).
// usage (from raptor-port/): node scripts/handpass/lw-night-rw-w1.mjs <desk|phone|webkit>
const R = await import('./lw-night-rw-lib.mjs')
const { H2: H, L, T, rec, judge, sleep } = R
import path from 'node:path'
import { writeFileSync } from 'node:fs'
const which = process.argv[2] || 'desk'
const size = which === 'desk' ? 'desk' : 'phone', engine = which === 'webkit' ? 'webkit' : 'chromium'
const label = which === 'desk' ? 'desktop/Chromium' : which === 'webkit' ? 'phone/WebKit' : 'phone/Chromium'
const tag = `w1-${which === 'desk' ? 'dk' : which === 'webkit' ? 'phw' : 'ph'}`
console.log('lw-night-rw-w1 v1', which, tag)
const dd = n => `2026-12-${String(n).padStart(2, '0')}`
const ME = 'bane'
const PNG = path.join(L.OUT, 'rw-pic.png')
writeFileSync(PNG, Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64'))
// ---- fixture as admin (desktop): Ranger's war-approved LL on 25 Dec and 28 Dec, and 21 Dec
const fx = await L.newCtx('desk')
await H.signInAs(fx, 'admin')
const ids = await H.people(fx.page)
if (ids.Ranger !== ME) throw new Error('Ranger is not bane: ' + ids.Ranger)
for (const n of [21, 25, 28]) await H.place(fx, ME, dd(n), 'LL', { approve: true })
const STATE = await fx.ctx.storageState()
await fx.ctx.close()
const w = await H.ctxFrom(size, engine, STATE)
const P = w.page
await H.signInAs(w, 'member')
const snap = async n => { await L.shot(w, `${tag}-${n}`); return `${tag}-${n}.png` }
const stored = async iso => (await H.inputsOn(P, ME, iso)).filter(x => /^(LL|OL|OIL|CCL|FCL|PL|EL|CL)$/.test(x.type)).map(x => ({ remarks: x.remarks, till: x.till, docs: x.docs.length, span: `${x.from.slice(5)}..${x.to.slice(5)}`, lw: x.lw }))
const openOwn = async iso => { await L.openCellR(w, ME, iso); let s = await H.sheetOf(P); for (let i = 0; i < 6 && s === 'nothing'; i++) { await sleep(w, 300); s = await H.sheetOf(P) } if (s !== 'remarks-sheet') throw new Error(`${iso} opened ${s}`); return s }
const docState = () => P.evaluate(() => ({ chips: document.querySelectorAll('[data-testid="remarks-sheet"] .docchip').length, chipNames: [...document.querySelectorAll('[data-testid="remarks-sheet"] .docchip .docname')].map(e => e.textContent.trim()), btn: (document.querySelector('[data-testid="remarks-doc-row"] button.docbtn')?.innerText || '').replace(/\s+/g, ' ').trim() }))
const tillState = () => P.evaluate(() => ({ checked: document.querySelector('[data-testid="remarks-till"]')?.checked, text: document.querySelector('[data-testid="remarks-tilldate"]')?.innerText, struck: document.querySelector('[data-testid="remarks-tilldate"]')?.classList.contains('off') }))
// ================= W1a: a document added, then its chip's ✕ =================
try {
  const iso = dd(25)
  await openOwn(iso)
  const d0 = await docState()
  await P.locator('[data-testid="remarks-doc-row"] input[type=file]').first().setInputFiles(PNG); await sleep(w, 900)
  const d1 = await docState(), s1 = await stored(iso)
  const pAdded = await snap('a-1-added')
  // the ✕ on the chip: a finger on a phone (with its picture right after), a click on a desktop
  const del = '[data-testid="remarks-sheet"] .docchip .docdel'
  let q = null
  if (w.phone) { await L.press(w, del, `${tag}-a-2-x-after-tap`); q = `${tag}-a-2-x-after-tap.png` } else { await L.press(w, del) }
  const d2 = await docState()                         // ~250 ms after (press() waits 250)
  await sleep(w, 400); const d3 = await docState()    // ~650 ms
  await sleep(w, 900); const d4 = await docState()    // ~1.5 s
  const s2 = await stored(iso)
  const pAfter = await snap('a-3-after-x-settled')
  judge('W1a a document added, then its chip’s ✕', label, [
    ['before: no chip, the button reads "Document"', d0.chips === 0 && d0.btn === 'Document', JSON.stringify(d0)],
    ['the document was added (a chip; saved with one document)', d1.chips === 1 && s1[0]?.docs === 1, `${JSON.stringify(d1)} saved ${JSON.stringify(s1)}`],
    ['right after the ✕ the chip is gone', d2.chips === 0, JSON.stringify(d2)],
    ['right after the ✕ the button reads "Document"', d2.btn === 'Document', JSON.stringify(d2)],
    ['still so at 0.65 s and 1.5 s', d3.chips === 0 && d3.btn === 'Document' && d4.chips === 0 && d4.btn === 'Document', JSON.stringify([d3, d4])],
    ['saved: no document', s2[0]?.docs === 0, JSON.stringify(s2)],
  ], `before ${JSON.stringify(d0)}; added → ${JSON.stringify(d1)} (saved docs ${s1[0]?.docs}); ✕ → at once ${JSON.stringify(d2)}, 0.65 s ${JSON.stringify(d3)}, 1.5 s ${JSON.stringify(d4)}; saved after ${JSON.stringify(s2)}`, [pAdded, q, pAfter].filter(Boolean))
  await H.closeSheet(w)
} catch (e) { rec('W1a', label, 'NOT DONE', 'script stopped: ' + String(e).slice(0, 500), []); await H.closeSheet(w).catch(() => {}) }
// ================= W1b: the till tick off, then on again, in one open window =================
try {
  const iso = dd(28)
  await openOwn(iso)
  const t0 = await tillState(), s0 = await stored(iso)
  await snap('b-0-open')
  let qa = null, qb = null
  if (w.phone) { await L.press(w, T('remarks-till'), `${tag}-b-1-untick-after-tap`); qa = `${tag}-b-1-untick-after-tap.png` } else await L.press(w, T('remarks-till'))
  const t1 = await tillState(), s1 = await stored(iso)       // ~250 ms
  const pOff = await snap('b-1-unticked')
  if (w.phone) { await L.press(w, T('remarks-till'), `${tag}-b-2-retick-after-tap`); qb = `${tag}-b-2-retick-after-tap.png` } else await L.press(w, T('remarks-till'))
  const t2 = await tillState(), s2 = await stored(iso)       // ~250 ms after the second press
  await sleep(w, 800); const t3 = await tillState(), s3 = await stored(iso)
  await sleep(w, 1500); const s4 = await stored(iso)
  const pOn = await snap('b-2-reticked')
  judge('W1b the till tick off, then on again', label, [
    ['start: ticked, not struck', t0.checked === true && t0.struck === false, JSON.stringify(t0)],
    ['unticked: the screen shows it off and the date struck; saved till false', t1.checked === false && t1.struck === true && s1[0]?.till === false, `${JSON.stringify(t1)} saved ${JSON.stringify(s1.map(x => x.till))}`],
    ['ticked again: the screen shows it ticked, the date not struck, at once', t2.checked === true && t2.struck === false, JSON.stringify(t2)],
    ['still ticked 0.8 s later; saved no longer false by 1 s after the press', t3.checked === true && t3.struck === false && s3[0]?.till !== false, `${JSON.stringify(t3)} saved at 0.25 s ${JSON.stringify(s2.map(x => x.till))}, 1.05 s ${JSON.stringify(s3.map(x => x.till))}, 2.55 s ${JSON.stringify(s4.map(x => x.till))}`],
  ], `start ${JSON.stringify(t0)}; tick pressed → ${JSON.stringify(t1)} saved till ${JSON.stringify(s1.map(x => x.till))}; pressed again → at once ${JSON.stringify(t2)}, 0.8 s later ${JSON.stringify(t3)}, saved till ${JSON.stringify(s2.map(x => x.till))} at 0.25 s, ${JSON.stringify(s3.map(x => x.till))} at 1.05 s, ${JSON.stringify(s4.map(x => x.till))} at 2.55 s`, [pOff, qa, qb, pOn].filter(Boolean))
  await H.closeSheet(w)
} catch (e) { rec('W1b', label, 'NOT DONE', 'script stopped: ' + String(e).slice(0, 500), []); await H.closeSheet(w).catch(() => {}) }
rec('errors-w1', label, w.errs.length ? 'FAIL' : 'PASS', w.errs.length ? w.errs.slice(0, 6).join(' || ') : 'none (console, page, 4xx)')
await w.ctx.close()
await L.closeBrowser()
R.saveResults(`w1-${which}`)
