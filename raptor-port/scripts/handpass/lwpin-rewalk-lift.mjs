/* The re-walk after the fresh Opus code read's finding 1 (8 Nov 26, chat 16 — [LW-PIN-LAST-FRAME], D1870): the pinned row
   at the lift of a zoom made part-way down (a phone pinch, a desktop Ctrl+scroll) on the Leave War, Quals' pinch on a phone,
   and the Leave War grid shown again from Balances while scrolled down. Every frame is read (is the real row under the top
   bar, is the copy shown), with a picture right after the gesture and one settled.
   Run from raptor-port/ against a served build: HP_URL=http://localhost:4393 node scripts/handpass/lwpin-rewalk-lift.mjs */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { chromium } from '@playwright/test'
process.env.HP_URL ||= 'http://localhost:4393'
const { BASE, login, go } = await import('./lib.mjs')
const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '../../docs/img/handpass/2026-11-08-lw-pin-last-frame/walk/rewalk-lift')
mkdirSync(OUT, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch({ headless: true, ...(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}) })
const sleep = ms => new Promise(r => setTimeout(r, ms))
const PC = { width: 1536, height: 864 }, PH = { width: 402, height: 874 }
const results = [], ERR = []
const LW = { name: 'leavewar', copy: '[data-testid="sticky-head"]', real: '#page-leavewar .mx-wrap tbody.mxhead th', cls: 'lw-pinching' }
const QU = { name: 'quals', copy: '[data-testid="qsticky-head"]', real: '#qtbl thead th', cls: 'q-pinching' }

async function world(vp, touch, pg) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: touch ? 2 : 1, ...(touch ? { isMobile: true, hasTouch: true } : {}) })
  const P = await ctx.newPage()
  P.on('pageerror', e => ERR.push(`${vp.width} PAGEERROR ${e.message}`))
  P.on('console', m => { if (m.type() === 'error') ERR.push(`${vp.width} console ${m.text()}`) })
  P.on('response', r => { if (r.status() >= 400) ERR.push(`${vp.width} HTTP ${r.status()} ${r.url()}`) })
  await P.goto(BASE + '/'); await login(P, 'a'); await P.addStyleTag({ content: '*{scroll-behavior:auto!important}' })
  await go(P, pg.name)
  await P.waitForSelector(pg.name === 'quals' ? '#qtbl td.qname' : '[data-testid^="month-"]'); await sleep(900)
  if (pg.name === 'leavewar' && await P.locator('[data-testid="lw-tab-grid"]').count()) { await P.evaluate(() => document.querySelector('[data-testid="lw-tab-grid"]').click()); await sleep(300) }
  return { ctx, P, cdp: await ctx.newCDPSession(P), vp, touch }
}
/* every frame, before it paints: the copy's state and the real row's place — and, where an act is named, the press is made
   in the same task that starts the reading, so the first frame after it is always read (`on`: the grid is on screen) */
const LOG = ({ copy, real, cls, n, act }) => {
  window.__f = []
  const tick = () => {
    const el = document.querySelector(copy), th = document.querySelector(real), cs = el ? getComputedStyle(el) : null
    const r = th && th.getBoundingClientRect(), tb = document.querySelector('.topbar').getBoundingClientRect().bottom
    const pg = th && th.closest('.page'), host = th && th.closest('.lw-gridhost')
    window.__f.push({ on: !!pg && pg.classList.contains('on') && !(host && host.hidden), pinching: !!el && el.classList.contains(cls), mounted: !!el, shown: !!cs && +cs.opacity > 0.5 && cs.visibility !== 'hidden', under: !!r && r.height > 0 && r.top < tb - 0.5 })
    if (window.__f.length < n) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
  if (act === 'grid') document.querySelector('[data-testid="lw-tab-grid"]').click()
  if (act === 'goLW') window.go('leavewar')
}
const readLog = async (P, n) => { await P.waitForFunction(n => window.__f.length >= n, n, { timeout: 20000 }); return P.evaluate(() => window.__f) }
const partWay = (w, pg) => w.P.evaluate(real => { const h = document.querySelector(real).getBoundingClientRect(); scrollTo(0, Math.round(scrollY + h.top - document.querySelector('.topbar').getBoundingClientRect().bottom + 300)) }, pg.real)
async function pinch(w, cx, cy, d0, d1) {
  const t = (type, pts) => w.cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x, y], i) => ({ x: Math.round(x), y: Math.round(y), id: i + 1 })) })
  const at = i => { const d = d0 + (d1 - d0) * i / 10; return [[cx - d / 2, cy], [cx + d / 2, cy]] }
  await t('touchStart', [at(0)[0]]); await sleep(30); await t('touchStart', at(0)); await sleep(30)
  for (let i = 1; i <= 10; i++) { await t('touchMove', at(i)); await sleep(16) }
  await t('touchEnd', [])
}
const clip = vp => ({ clip: { x: 0, y: 0, width: vp.width, height: 260 } })
const pic = async (w, name) => { await w.P.screenshot({ path: resolve(OUT, `${name}.png`), ...clip(w.vp) }); return `${name}.png` }

async function lift(pg, nm, vp, touch) {
  const w = await world(vp, touch, pg); const P = w.P
  await partWay(w, pg); await sleep(500)
  const p0 = await pic(w, `${pg.name}-${nm}-0-before`)
  await P.evaluate(LOG, { ...pg, n: 240 })
  if (touch) await pinch(w, 200, pg.name === 'quals' ? 500 : 520, 200, 240)
  else { await P.mouse.move(600, 500); await P.keyboard.down('Control'); await P.mouse.wheel(0, -Math.log(1.2) / 0.002); await P.keyboard.up('Control') }
  await P.waitForFunction(c => !document.querySelector('.' + c), pg.cls, { timeout: 10000 })
  const p1 = await pic(w, `${pg.name}-${nm}-1-right-after-the-lift`)
  await sleep(900); const p2 = await pic(w, `${pg.name}-${nm}-2-settled`)
  const f = await readLog(P, 240)
  const at = f.findIndex((x, i) => i > 0 && f[i - 1].pinching && !x.pinching)
  const gaps = at < 0 ? [] : f.slice(at).map((x, i) => (x.under && !x.shown ? i : -1)).filter(i => i >= 0)
  const end = f[f.length - 1]
  const pass = at > 0 && gaps.length === 0 && end.shown === end.under
  results.push({ id: `${pg.name} ${nm} the zoom's lift part-way down`, verdict: pass ? 'PASS' : 'FAIL', note: `lift seen at frame ${at} of ${f.length}; frames after it with the row under the bar and no copy shown: ${gaps.length ? gaps.join(',') : 'none'}; copy off the page in ${f.filter(x => !x.mounted).length} frames; settled shown=${end.shown} under=${end.under}`, pics: [p0, p1, p2] })
  await w.ctx.close()
}
async function balancesBack(nm, vp, touch) {
  const w = await world(vp, touch, LW); const P = w.P
  await P.evaluate(() => scrollTo(0, 1400)); await sleep(500)
  const p0 = await pic(w, `leavewar-${nm}-balances-0-scrolled-down`)
  await P.evaluate(() => document.querySelector('[data-testid="lw-tab-balances"]').click()); await sleep(500)
  const p1 = await pic(w, `leavewar-${nm}-balances-1-on-balances`)
  await P.evaluate(LOG, { ...LW, n: 40, act: 'grid' })
  const p2 = await pic(w, `leavewar-${nm}-balances-2-grid-right-after`)
  const f = await readLog(P, 40); await sleep(500)
  const p3 = await pic(w, `leavewar-${nm}-balances-3-settled`)
  judge(f, `leavewar ${nm} back on the grid from Balances, scrolled down`, [p0, p1, p2, p3], await P.evaluate(() => Math.round(scrollY)))
  await w.ctx.close()
}
function judge(f, id, pics, y) {
  const on = f.map((x, i) => [x, i]).filter(([x]) => x.on)
  const gaps = on.filter(([x]) => x.under && !x.shown).map(([, i]) => i), end = f[f.length - 1]
  const pass = on.some(([x]) => x.under) && gaps.length === 0 && end.shown === end.under
  results.push({ id, verdict: pass ? 'PASS' : 'FAIL', note: `grid on screen from frame ${on.length ? on[0][1] : '-'} of ${f.length}; row under the bar in ${on.filter(([x]) => x.under).length} of them; frames with it under and no copy shown: ${gaps.length ? gaps.join(',') : 'none'}; scrollY ${y}`, pics })
}
/* the Leave War page left for another page while scrolled down the grid, and come back to: it returns where it was */
async function pageBack(nm, vp, touch) {
  const w = await world(vp, touch, LW); const P = w.P
  await P.evaluate(() => scrollTo(0, 1400)); await sleep(500)
  const p0 = await pic(w, `leavewar-${nm}-page-0-scrolled-down`)
  await go(P, 'quals'); await sleep(500)
  const p1 = await pic(w, `leavewar-${nm}-page-1-on-quals`)
  await P.evaluate(LOG, { ...LW, n: 60, act: 'goLW' })
  const p2 = await pic(w, `leavewar-${nm}-page-2-back-right-after`)
  const f = await readLog(P, 60); await sleep(500)
  const p3 = await pic(w, `leavewar-${nm}-page-3-settled`)
  judge(f, `leavewar ${nm} back on the Leave War from Quals, scrolled down`, [p0, p1, p2, p3], await P.evaluate(() => Math.round(scrollY)))
  await w.ctx.close()
}

const ONLY = (process.env.ONLY || 'lift,balances,page,qlift').split(',')
for (const [nm, vp, touch] of [['pc1536', PC, false], ['ph402', PH, true]]) {
  if (ONLY.includes('lift')) await lift(LW, nm, vp, touch).catch(e => results.push({ id: `leavewar ${nm} lift`, verdict: 'COULD NOT RUN', note: e.message.split('\n')[0] }))
  if (ONLY.includes('balances')) await balancesBack(nm, vp, touch).catch(e => results.push({ id: `leavewar ${nm} balances`, verdict: 'COULD NOT RUN', note: e.message.split('\n')[0] }))
  if (ONLY.includes('page')) await pageBack(nm, vp, touch).catch(e => results.push({ id: `leavewar ${nm} page`, verdict: 'COULD NOT RUN', note: e.message.split('\n')[0] }))
}
if (ONLY.includes('qlift')) await lift(QU, 'ph402', PH, true).catch(e => results.push({ id: 'quals ph402 lift', verdict: 'COULD NOT RUN', note: e.message.split('\n')[0] }))
await browser.close()
for (const r of results) console.log(r.verdict.padEnd(14), r.id, '|', r.note)
console.log('errors:', ERR.length ? ERR.join(' || ') : 'none')
writeFileSync(resolve(OUT, 'results.json'), JSON.stringify({ base: BASE, results, errors: ERR }, null, 1))
