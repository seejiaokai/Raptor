/* CHAT 28 — the Tracker's search magnifier before and after D1900 (its handle as long as every other search box's,
   D1127), beside Edit Schedule's search box: close-ups at 4x, desktop 1536 (Chromium) and his iPhone's 402 (WebKit, the
   Find strip opened from its Find button). Each magnifier's handle is measured from its drawing: the path's own length in
   the icon's units, times the icon's drawn size over its 24-unit box.
   Run once per build, from raptor-port/:
     TAG=before WALK_DIR=<fb5d18c21's dist> node scripts/handpass/nk28-mag.mjs
     TAG=after  WALK_DIR=dist                node scripts/handpass/nk28-mag.mjs   (also takes Edit Schedule's box)
   Pictures and measure-<TAG>.json → docs/img/handpass/2026-11-08-chat28-not-kept/magnifier/. Version line: nk28mag v1. */
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
console.log('nk28mag v1')
const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(HERE, '..', '..', 'docs/img/handpass/2026-11-08-chat28-not-kept/magnifier')
mkdirSync(OUT, { recursive: true })
const TAG = process.env.TAG
if (!/^(before|after)$/.test(TAG || '')) { console.error('set TAG=before or TAG=after'); process.exit(2) }
process.env.C9_RESULTS ||= resolve(tmpdir(), 'nk28mag-unused-results.json')
process.env.HP_URL ||= 'http://localhost:4437'
const L = await import('./trk-chat9-lib.mjs')
const { mkWorld, closeW, closeAll, sleep, PHONE, PC } = L
const { serveFrozen, WALK_DIR } = await import('./isr-serve.mjs')
if (!WALK_DIR) { console.error('set WALK_DIR to the built folder'); process.exit(2) }
console.log(`${TAG}: serving ${WALK_DIR} at ${L.BASE}`)
for (const e of ['chromium', 'webkit']) {
  const b = await L.browserFor(e, true, false); const orig = b.newContext.bind(b)
  b.newContext = async o => { const c = await orig(o); await serveFrozen(c, L.BASE); return c }
}
const CLOCK = '2026-11-08T09:00:00+08:00'
const M = { tag: TAG, build: WALK_DIR, errors: {} }

const vis = (page, sel) => page.evaluate(sel => { const e = [...document.querySelectorAll(sel)].find(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }); if (!e) return null; const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height } }, sel)
/* the magnifier's drawing: its box, the circle, the handle's path, and the handle's length on screen */
const glyph = (page, sel) => page.evaluate(sel => {
  const s = [...document.querySelectorAll(sel)].find(e => e.getBoundingClientRect().width > 0); if (!s) return null
  const r = s.getBoundingClientRect(), vb = (s.getAttribute('viewBox') || '0 0 24 24').split(/[ ,]+/).map(Number)
  const p = s.querySelector('path'), c = s.querySelector('circle'), cs = getComputedStyle(s)
  const d = p && p.getAttribute('d')
  const units = p ? p.getTotalLength() : null, u = r.width / vb[2]
  return { w: +r.width.toFixed(2), h: +r.height.toFixed(2), viewBox: vb.join(' '), d, circle: c ? { cx: c.getAttribute('cx'), cy: c.getAttribute('cy'), r: c.getAttribute('r') } : null,
    stroke: p && getComputedStyle(p).strokeWidth, color: cs.color, handleUnits: units && +units.toFixed(2), handlePx: units && +(units * u).toFixed(2) }
}, sel)
const shot = async (page, name, clip) => { await sleep(300); await page.screenshot({ path: resolve(OUT, name + '.png'), clip, animations: 'disabled', caret: 'hide' }); console.log(' pic ' + name) }
/* the icon alone, a little room round it; and the box's left end with the icon, for its place */
const iconClip = (g, pad = 5) => ({ x: Math.max(0, g.l - pad), y: Math.max(0, g.t - pad), width: Math.round(g.w + 2 * pad), height: Math.round(g.h + 2 * pad) })
const boxClip = (box, g, pad = 6, tail = 46) => ({ x: Math.max(0, box.l - pad), y: Math.max(0, box.t - pad), width: Math.round(g.r - box.l + tail + pad), height: Math.round(box.h + 2 * pad) })
async function toEditSchedule(w) {
  const p = w.page
  const tab = p.locator('#topnav a[data-page="editsched"]:visible')
  if (await tab.count()) await tab.click()
  else { await p.locator('#burger').tap(); await sleep(400); await p.locator('#drawer a[data-page="editsched"]').first().tap() }
  await p.waitForFunction(() => window.CURPAGE === 'editsched', null, { timeout: 15000 }); await sleep(1500)
}
async function esBox(w, tag) {
  await toEditSchedule(w)
  const p = w.page, box = await vis(p, '.searchbox:has(#searchE)'), g = await vis(p, '.searchbox:has(#searchE) svg')
  if (!box || !g) throw new Error('premise: Edit Schedule\'s search box not found')
  M[tag + 'Es'] = await glyph(p, '.searchbox:has(#searchE) svg')
  await shot(p, `${tag}-es-icon`, iconClip(g)); await shot(p, `${tag}-es-box`, boxClip(box, g))
}

{ /* desktop, Chromium, 4x */
  const w = await mkWorld({ size: PC, dpr: 4, clock: CLOCK })
  try {
    const p = w.page, S = '#page-tracker header .findbox'
    const box = await vis(p, S), g = await vis(p, S + ' .srchglyph')
    if (!box || !g) throw new Error('premise: the Tracker\'s Find box is not in its bar')
    M.dTrk = await glyph(p, S + ' .srchglyph')
    await shot(p, `d-trk-icon-${TAG}`, iconClip(g)); await shot(p, `d-trk-box-${TAG}`, boxClip(box, g))
    if (TAG === 'after') await esBox(w, 'd')
  } catch (e) { M.dNotrun = String(e.message).split('\n')[0]; console.log(' desktop NOTRUN: ' + M.dNotrun) }
  M.errors.desktop = w.errors.slice(); await closeW(w)
}
{ /* phone, WebKit, touch, 4x */
  const w = await mkWorld({ size: PHONE, touch: true, engine: 'webkit', dpr: 4, clock: CLOCK })
  try {
    const p = w.page
    const btn = await vis(p, '#hSearchBtn'), bg = await vis(p, '#hSearchBtn .srchglyph')
    if (!btn || !bg) throw new Error('premise: the phone\'s Find button is not in the bar')
    M.pBtn = await glyph(p, '#hSearchBtn .srchglyph')
    await shot(p, `p-btn-${TAG}`, { x: Math.max(0, btn.l - 8), y: Math.max(0, btn.t - 8), width: Math.round(btn.w + 16), height: Math.round(btn.h + 16) })
    /* open the Find strip without its box taking the keyboard: a focused box under 16px zooms an emulated phone */
    await p.evaluate(() => { window.__f = HTMLElement.prototype.focus; HTMLElement.prototype.focus = function () {}; document.getElementById('hSearchBtn').click() })
    await sleep(700); await p.evaluate(() => { HTMLElement.prototype.focus = window.__f })
    const S = '#hSearchPanel .findbox', box = await vis(p, S), g = await vis(p, S + ' .srchglyph')
    if (!box || !g) throw new Error('premise: the Find strip did not open')
    M.pScale = await p.evaluate(() => window.visualViewport ? visualViewport.scale : 1)
    M.pTrk = await glyph(p, S + ' .srchglyph')
    await shot(p, `p-trk-icon-${TAG}`, iconClip(g)); await shot(p, `p-trk-box-${TAG}`, boxClip(box, g, 6, 30))
    if (TAG === 'after') { await p.keyboard.press('Escape').catch(() => {}); await sleep(400); await esBox(w, 'p') }
  } catch (e) { M.pNotrun = String(e.message).split('\n')[0]; console.log(' phone NOTRUN: ' + M.pNotrun) }
  M.errors.phone = w.errors.slice(); await closeW(w)
}
await closeAll()
writeFileSync(resolve(OUT, `measure-${TAG}.json`), JSON.stringify(M, null, 1))
const line = (k, g) => g ? `${k}: ${g.w}px icon, handle "${g.d}" = ${g.handleUnits} units = ${g.handlePx}px on screen, circle r ${g.circle && g.circle.r}, stroke ${g.stroke}` : `${k}: not measured`
for (const k of ['dTrk', 'dEs', 'pBtn', 'pTrk', 'pEs']) if (M[k] !== undefined || (TAG === 'after' || !/Es$/.test(k))) console.log(line(k, M[k]))
console.log('errors: ' + JSON.stringify(M.errors))
