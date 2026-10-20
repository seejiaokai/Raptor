/* [LOGIC-REDRAW-DROPS-TYPING] and [LOGIC-DONE-FIRST-PRESS] — the reproduction (21 Oct 26). Opens the Logic page, records
   every time its body's rule list is replaced in the first three seconds (and what asked for it), then measures the Done
   button before and after a changed setting is saved, at a phone width and a desktop width. Run against a served build:
   node scripts/handpass/logic-repro.mjs [port] */
import { chromium } from 'playwright'
import { existsSync } from 'fs'

const PORT = process.argv[2] || '4290'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})

async function signIn(page) {
  await page.goto(`http://localhost:${PORT}/`)
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  await page.waitForTimeout(600)
}

for (const [label, vp, touch] of [['desktop', { width: 1280, height: 900 }, false], ['phone', { width: 402, height: 874 }, true]]) {
  const ctx = await browser.newContext({ viewport: vp, hasTouch: touch, isMobile: touch })
  const page = await ctx.newPage()
  page.on('pageerror', e => console.log('PAGEERROR', e.message))
  await signIn(page)

  /* 1. the redraw: watch #lgBody's children being replaced, with a stack of what did it */
  await page.evaluate(() => {
    const w = window
    w.__swaps = []
    w.__t0 = 0
    const mo = new MutationObserver(recs => {
      for (const r of recs) if (r.target.id === 'lgBody' && r.removedNodes.length) w.__swaps.push({ t: Math.round(performance.now() - w.__t0), removed: r.removedNodes.length })
    })
    w.__watch = () => { const b = document.getElementById('lgBody'); if (b) mo.observe(b, { childList: true }) }
    /* catch the innerHTML setter on the body, to learn who changes the string */
    const d = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML')
    w.__htmls = []
    Object.defineProperty(Element.prototype, 'innerHTML', { ...d, set(v) { if (this.id === 'lgBody') w.__htmls.push({ t: Math.round(performance.now() - w.__t0), len: String(v).length, v: String(v), stack: new Error().stack.split('\n').slice(2, 9).join(' | ') }); return d.set.call(this, v) } })
  })
  await page.evaluate(() => { window.__t0 = performance.now(); window.go('logic') })
  await page.waitForSelector('#lgBody')
  await page.evaluate(() => window.__watch())
  await page.waitForTimeout(3000)
  const r = await page.evaluate(() => ({ swaps: window.__swaps, htmls: window.__htmls.map(h => ({ t: h.t, len: h.len, stack: h.stack })), diff: (() => {
    const h = window.__htmls; if (h.length < 2) return null
    const a = h[h.length - 2].v, b = h[h.length - 1].v
    let i = 0; while (i < a.length && a[i] === b[i]) i++
    return { at: i, before: a.slice(Math.max(0, i - 120), i + 160), after: b.slice(Math.max(0, i - 120), i + 160) }
  })() }))
  console.log(`\n== ${label}: the body's markup set ${r.htmls.length} time(s); children replaced:`, JSON.stringify(r.swaps))
  for (const h of r.htmls) console.log(`  set at ${h.t}ms, ${h.len} chars — ${h.stack}`)
  if (r.diff) console.log('  first difference at', r.diff.at, '\n  BEFORE:', r.diff.before, '\n  AFTER: ', r.diff.after)

  /* 2. Done: Edit, change "Default rally before take-off", then measure Done, press it once */
  await page.click('#lgEdit')
  await page.waitForTimeout(400)
  const box = page.locator('input[data-lgset="reportLead"]').first()
  await box.scrollIntoViewIfNeeded()
  const before = await page.locator('#lgDone').boundingBox()
  await box.fill('2h30')
  const pt = { x: before.x + before.width / 2, y: before.y + before.height / 2 }
  if (touch) await page.touchscreen.tap(pt.x, pt.y); else await page.mouse.click(pt.x, pt.y)
  await page.waitForTimeout(500)
  const after = await page.locator('#lgDone').boundingBox().catch(() => null)
  const st = await page.evaluate(() => ({ lead: window.VCONF.reportLead, editing: !document.getElementById('lgDone')?.hidden }))
  console.log(`== ${label}: Done before ${JSON.stringify(before)}; after the save ${JSON.stringify(after)}; setting now ${st.lead} min; still editing after ONE press: ${st.editing}`)
  /* put the setting back for the next run */
  await page.evaluate(() => { window.localStorage.clear() })
  await ctx.close()
}
await browser.close()
