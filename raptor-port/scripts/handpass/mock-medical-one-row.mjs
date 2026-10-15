/* MOCK-UP of [MEDICAL-ONE-ROW] (D912) on the REAL app, and the SWEEP for [GUIDE-ONE-ROW] (D911) — 15 Oct 26.
   1. The Medical tab today beside the change, at his phone's size (390 x 844, 3x) and a desktop's (1280 x 800): the
      "Medical" heading (which repeats the tab's name) removed, and the "as of" date button standing in the row under the
      tabs at that row's button height — MEASURED from the Inputs calendar's own row on the same build, never typed in.
      The ONE transform: the heading node removed; the as-of button (and Today, when shown) given the measured height.
   2. The sweep: the top of every page at the phone's size, for the guide's rule (one row of a page's own controls).
   usage: node scripts/handpass/mock-medical-one-row.mjs [baseURL] [outDir] — the served build (preview_start raptor-walk) */
import { createRequire } from 'node:module'
import { existsSync, mkdirSync } from 'node:fs'
const require = createRequire(import.meta.url)
const { chromium } = require('playwright')
const base = process.argv[2] || 'http://localhost:4173'
const out = process.argv[3] || 'docs/img/handpass/2026-10-15-medical-one-row'
mkdirSync(out, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const b = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const errors = []
const PHONE = { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 }
const DESK = { viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 }
const facts = {}

async function signedIn(dev) {
  const ctx = await b.newContext({ baseURL: base, ...dev })
  const p = await ctx.newPage()
  p.on('pageerror', e => errors.push(e.message))
  await p.goto('/?fresh=1'); await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { state: 'attached' }); await p.waitForTimeout(400)
  return { ctx, p }
}
const mark = (p, sels) => p.evaluate(sels => {
  document.querySelectorAll('[data-mock="marker"]').forEach(e => e.remove())
  for (const sel of sels) {
    const els = [...document.querySelectorAll(sel)].filter(e => e.offsetParent !== null)
    if (!els.length) throw new Error('premise gone: ' + sel)
    const rs = els.map(e => e.getBoundingClientRect())
    const l = Math.min(...rs.map(r => r.left)) - 3, t = Math.min(...rs.map(r => r.top)) - 3
    const r = Math.max(...rs.map(r => r.right)) + 3, bt = Math.max(...rs.map(r => r.bottom)) + 3
    const m = document.createElement('div'); m.setAttribute('data-mock', 'marker')
    m.style.cssText = `position:fixed;left:${l}px;top:${t}px;width:${r - l}px;height:${bt - t}px;border:2px dashed #ff8a1c;border-radius:8px;pointer-events:none;z-index:2147483647`
    document.body.appendChild(m)
  }
}, sels)
const unmark = p => p.evaluate(() => document.querySelectorAll('[data-mock="marker"]').forEach(e => e.remove()))
const press = async (p, sel, phone) => { const l = p.locator(sel).first(); if (phone) await l.tap(); else await l.click() }

for (const [key, dev] of [['phone', PHONE], ['desk', DESK]]) {
  const phone = key === 'phone'
  const { ctx, p } = await signedIn(dev)
  await p.evaluate(() => window.go('inputs')); await p.waitForFunction(() => window.CURPAGE === 'inputs'); await p.waitForTimeout(500)
  /* the row to match: the Inputs calendar's own control row under the tabs — its buttons' height, measured */
  const row = await p.evaluate(() => {
    const h = document.querySelector('#inpCal .ic-head')
    if (!h) return null
    const btns = [...h.querySelectorAll('button')].filter(x => x.offsetParent !== null)
    const hs = btns.map(x => Math.round(x.getBoundingClientRect().height))
    const r = h.getBoundingClientRect()
    return { rowH: Math.round(r.height), btnH: Math.max(...hs), btns: hs }
  })
  facts[key] = { inputsRow: row }
  await p.screenshot({ path: `${out}/${key}-inputs-row-reference.png`, clip: { x: 0, y: 0, width: dev.viewport.width, height: Math.min(dev.viewport.height, 330) } })
  await press(p, '#inMedBtn', phone); await p.waitForSelector('#medView'); await p.waitForTimeout(500)
  const today = await p.evaluate(() => {
    const h = document.querySelector('#medView .ic-head'), t = document.querySelector('#medView .med-title'), c = document.querySelector('#medCalBtn')
    return { headH: Math.round(h.getBoundingClientRect().height), calH: Math.round(c.getBoundingClientRect().height), title: t && t.textContent, firstSecTop: Math.round((document.querySelector('#medView .medsec') || h).getBoundingClientRect().top) }
  })
  facts[key].medicalToday = today
  await mark(p, ['#medView .med-title', '#medCalBtn'])
  await p.screenshot({ path: `${out}/${key}-medical-today.png` })
  await unmark(p)
  /* the transform: the heading removed; the as-of button (and Today) at the measured button height; the row's own
     padding left as the Inputs calendar's row has it */
  /* D912 names the height: 36, the Inputs row's own button height (measured on the phone — its switch and arrows read 36) */
  const h = 36
  if (key === 'phone' && !(row && row.btns.includes(36))) throw new Error('premise gone: the Inputs row has no 36 button')
  await p.evaluate(h => {
    document.querySelector('#medView .med-title')?.remove()
    for (const id of ['medCalBtn', 'medToday']) { const e = document.getElementById(id); if (e) { e.style.height = h + 'px'; e.style.minHeight = h + 'px'; e.style.paddingTop = '0'; e.style.paddingBottom = '0'; e.style.boxSizing = 'border-box' } }
  }, h)
  await p.waitForTimeout(150)
  const after = await p.evaluate(() => {
    const hd = document.querySelector('#medView .ic-head'), c = document.querySelector('#medCalBtn')
    return { headH: Math.round(hd.getBoundingClientRect().height), calH: Math.round(c.getBoundingClientRect().height), titleGone: !document.querySelector('#medView .med-title'), firstSecTop: Math.round((document.querySelector('#medView .medsec') || hd).getBoundingClientRect().top) }
  })
  if (!after.titleGone) throw new Error('premise gone: the heading is still there')
  facts[key].medicalProposed = after
  await mark(p, ['#medCalBtn'])
  await p.screenshot({ path: `${out}/${key}-medical-proposed.png` })
  await ctx.close()
}

/* the sweep: every page's top at the phone's size */
{
  const { ctx, p } = await signedIn(PHONE)
  const pages = ['editsched', 'viewsched', 'inputs', 'quals', 'logic', 'leavewar', 'tracker', 'admin']
  facts.sweep = {}
  for (const pg of pages) {
    try {
      await p.evaluate(x => window.go(x), pg); await p.waitForFunction(x => window.CURPAGE === x, pg, { timeout: 8000 }); await p.waitForTimeout(700)
      await p.evaluate(() => window.scrollTo(0, 0))
      await p.screenshot({ path: `${out}/sweep-${pg}.png`, clip: { x: 0, y: 0, width: 390, height: 300 } })
      facts.sweep[pg] = 'pictured'
    } catch (e) { facts.sweep[pg] = 'not reached: ' + String(e).slice(0, 80) }
  }
  for (const [tab, id] of [['sans', '#inSansMode']]) {
    try {
      await p.evaluate(() => window.go('inputs')); await p.waitForTimeout(500)
      await p.locator(id).first().tap(); await p.waitForTimeout(600)
      await p.screenshot({ path: `${out}/sweep-inputs-${tab}.png`, clip: { x: 0, y: 0, width: 390, height: 300 } })
      facts.sweep['inputs-' + tab] = 'pictured'
    } catch (e) { facts.sweep['inputs-' + tab] = 'not reached' }
  }
  await ctx.close()
}
console.log(JSON.stringify({ facts, errors }, null, 1))
await b.close()
