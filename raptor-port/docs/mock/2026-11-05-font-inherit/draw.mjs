/* [CSS-FONT-INHERIT] — the drawing: today beside the fix, on the real app.
   The fault: nine rules write `font: 600 13px inherit`, which is not a font (a family cannot be "inherit" inside the
   shorthand), so the browser drops the whole line and the box or button keeps the browser's own letters, size and weight.
   ONE transform: each of the nine rules is found in the page's own stylesheet (the built one, in its own place in the
   cascade) and given the fix as the build would write it — `font-family: inherit` plus the size and weight the line meant
   (and its `/1` line height where it had one). Nothing else is touched, so the "fix" pictures are what the build shows.
   The script prints how many rules it changed (must be 9 found, each once) and every marked element's letters on both
   sides; a pair whose letters measure the same is reported, not shown as a change.
   Run: HP_URL=http://localhost:<port> node docs/mock/2026-11-05-font-inherit/draw.mjs  → img/ and measures.json */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { chromium, webkit, devices } from '@playwright/test'
import { fileURLToPath } from 'node:url'
const HERE = fileURLToPath(new URL('.', import.meta.url))
const BASE = process.env.HP_URL || 'http://localhost:4391'
const OUT = HERE + 'img'; mkdirSync(OUT, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const sleep = ms => new Promise(r => setTimeout(r, ms))

/* the nine rules, as the built stylesheet spells their selectors, and what each line meant */
const RULES = [
  { n: 1, file: '07-inputs-calendar.css', sel: '.ic-pop input[type="text"], .ic-pop input:not([type])', size: '13px', weight: '600' },
  { n: 2, file: '12-schedule-editing.css', sel: '#cxReason', size: '14px', weight: '600' },
  { n: 3, file: '12-schedule-editing.css', sel: '.cxedit-name', size: '12px', weight: '600' },
  { n: 4, file: '14-input-editors.css', sel: '.inped-body select, .inped-body input', size: '13px', weight: '600' },
  { n: 5, file: '14-input-editors.css', sel: '.inped-v', size: '13px', weight: '600' },
  { n: 6, file: '25-inputs-calendar.css', sel: '.pp-sw', size: '12px', weight: '600' },
  { n: 7, file: '25-inputs-calendar.css', sel: '.pp-all', size: '11px', weight: '600' },
  { n: 8, file: '25-inputs-calendar.css', sel: '.inputsday .ic-note .ic-pkadd', size: '14px', weight: '700', lh: '1' },
  { n: 9, file: '25-inputs-calendar.css', sel: '.inputsday .ic-newnote-ppl', size: '12px', weight: '700', lh: '1' },
]
/* on: write the fix into the app's own rule; off: take it back out. Returns how many rules matched each selector. */
const FIX = ([rules, on]) => {
  const found = {}, bySel = new Map(rules.map(x => [x.sel, x]))
  const walk = list => { for (const r of list) {
    if (r.cssRules && !r.selectorText) { walk(r.cssRules); continue }
    const R = bySel.get(r.selectorText); if (!R) continue
    found[R.n] = (found[R.n] || 0) + 1
    if (on) { r.style.setProperty('font-family', 'inherit'); r.style.setProperty('font-size', R.size); r.style.setProperty('font-weight', R.weight); if (R.lh) r.style.setProperty('line-height', R.lh) }
    else { for (const p of ['font-family', 'font-size', 'font-weight', 'line-height']) r.style.removeProperty(p) }
  } }
  for (const s of document.styleSheets) { try { walk(s.cssRules) } catch {} }
  return found
}
/* the place marked: an outline on the element itself (takes no room), never a box laid over the page */
const MARK = ([sel, on]) => {
  const els = [...document.querySelectorAll(sel)].filter(e => e.getBoundingClientRect().width > 0)
  for (const e of els) { e.style.outline = on ? '2px solid #ffb020' : ''; e.style.outlineOffset = on ? '2px' : '' }
  return els.length
}
const MEASURE = sel => [...document.querySelectorAll(sel)].filter(e => e.getBoundingClientRect().width > 0).slice(0, 4).map(e => {
  const c = getComputedStyle(e), r = e.getBoundingClientRect()
  return { what: (e.id ? '#' + e.id : e.tagName.toLowerCase() + '.' + [...e.classList].join('.')) + (e.value ? ' "' + e.value.slice(0, 18) + '"' : ' "' + e.textContent.trim().slice(0, 18) + '"'),
    family: c.fontFamily, size: c.fontSize, weight: c.fontWeight, w: Math.round(r.width), h: Math.round(r.height) }
})

const results = {}
async function scene(page, dev, name, targets, cropSel, keepFocus = false) {
  const marks = targets.map(t => RULES.find(r => r.n === t)).map(r => r.sel).join(', ')
  await page.evaluate(k => { if (!k) document.activeElement?.blur?.(); document.querySelectorAll('.toast,.snack,.snackbar').forEach(t => t.style.display = 'none') }, keepFocus)
  /* a neutral tap target keeps the last pressed control from wearing a hover or focus ring */
  await page.mouse.move(2, 860 > 0 ? 2 : 2)
  await sleep(250)
  const rec = { targets }
  for (const side of ['today', 'fix']) {
    const found = await page.evaluate(FIX, [RULES, side === 'fix'])
    if (side === 'fix' && Object.values(found).some(v => v !== 1)) throw new Error('rule count off: ' + JSON.stringify(found))
    if (side === 'fix' && Object.keys(found).length !== 9) throw new Error('not all nine rules found: ' + JSON.stringify(found))
    await sleep(150)
    rec[side] = await page.evaluate(MEASURE, marks)
    const n = await page.evaluate(MARK, [marks, true])
    if (!n) throw new Error(name + ': nothing to mark')
    /* cropped to the window, and below its top only as far as the last marked place (D1222) */
    const box = await page.evaluate(([s, m]) => { const e = [...document.querySelectorAll(s)].find(x => x.getBoundingClientRect().width > 0); const r = e.getBoundingClientRect()
      const low = Math.max(...[...document.querySelectorAll(m)].filter(x => x.getBoundingClientRect().width > 0).map(x => x.getBoundingClientRect().bottom))
      return { x: r.x, y: r.y, w: r.width, h: Math.min(r.height, low - r.y + 28) } }, [cropSel, marks])
    const vp = page.viewportSize(), pad = 8
    const x = Math.max(0, box.x - pad), y = Math.max(0, box.y - pad)
    const clip = { x, y, width: Math.min(vp.width - x, box.w + pad * 2), height: Math.min(vp.height - y, box.h + pad * 2) }
    await page.screenshot({ path: `${OUT}/${dev}-${name}-${side}.png`, clip })
    await page.evaluate(MARK, [marks, false])
  }
  await page.evaluate(FIX, [RULES, false])
  results[`${dev}-${name}`] = rec
}

async function signIn(page, who) {
  await page.goto(BASE + '/')
  await page.waitForSelector('#luser')
  await page.fill('#luser', who === 'a' ? 'ad' : 'us'); await page.fill('#lpass', who === 'a' ? 'a' : 'us')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' }); await sleep(700)
}
const go = (page, to) => page.evaluate(p => window.go(p), to).then(() => sleep(800))
const setVal = (page, sel, v) => page.evaluate(([s, v]) => { const e = [...document.querySelectorAll(s)].find(x => x.getBoundingClientRect().width > 0)
  const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; set.call(e, v); e.dispatchEvent(new Event('input', { bubbles: true })) }, [sel, v])
const tapVis = (page, sel) => page.locator(sel).locator('visible=true').first().click()

const DEVICES = [
  ['pc1536', chromium, { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 2, ...(existsSync(CHROMIUM) ? {} : {}) }],
  ['iphone', webkit, { ...devices['iPhone 13'], viewport: { width: 402, height: 874 } }],
]
for (const [dev, type, opts] of DEVICES) {
  const browser = await type.launch(type === chromium && existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
  const errs = []
  const fresh = async who => {
    const ctx = await browser.newContext(opts)
    await ctx.clock.install({ time: new Date('2026-11-04T09:00:00') })
    const page = await ctx.newPage()
    page.on('pageerror', e => errs.push('PAGEERROR ' + e.message))
    await signIn(page, who); return { ctx, page }
  }
  /* A — the Scheduler Board's cancel box (2) and its reasons list (3) */
  { const { ctx, page } = await fresh('a')
    await go(page, 'editsched')
    await tapVis(page, '#eWeek [data-sbday="2"]'); await page.waitForSelector('#schedBoard'); await sleep(900)
    await tapVis(page, '#sbBoard .mbtn[data-lcx]'); await sleep(700)
    await setVal(page, '#cxReason', 'U/S AIRCRAFT')
    await scene(page, dev, 'cancel', [2], '#cxPop .cxbox, #cxPop > *')
    await tapVis(page, '#cxPop [data-cxedit]'); await sleep(500)
    await scene(page, dev, 'cancel-reasons', [3], '#cxPop .cxbox, #cxPop > *')
    await ctx.close() }
  /* B — the Inputs page: the opened day's notes (8, 9), then an input's own window (4, 6, 7) */
  { const { ctx, page } = await fresh('a')
    await go(page, 'inputs')
    await tapVis(page, '[data-icday="2026-11-04"]'); await sleep(800)
    await tapVis(page, '#icAddPuck'); await sleep(400)
    /* a note with people on it: typed, then two people added through its own "+ people" picker */
    await page.locator('.ic-newnote .ic-poppuck-edit').fill('BRIEF ROOM')
    await tapVis(page, '#icNewNotePpl'); await sleep(600)
    for (let i = 0; i < 2; i++) { await tapVis(page, '.ic-pickp:not(.already):not(.on)'); await sleep(150) }
    await tapVis(page, '#icPickOk'); await sleep(700)
    /* a second, new note open, so its "+ people" shows beside the first note's + (its box keeps the keyboard) */
    await tapVis(page, '#icAddPuck'); await sleep(500)
    await scene(page, dev, 'day-notes', [8, 9], '[data-testid="win-inputsday"]', true)
    await page.keyboard.press('Escape'); await sleep(400)
    await tapVis(page, '#icPopAdd'); await sleep(800)
    await tapVis(page, '[data-testid="pp-several"]'); await sleep(500)
    await scene(page, dev, 'input-window', [4, 6, 7], '.floatwin.inpedwin')
    await ctx.close() }
  /* C — a member's own new input: the person is fixed, shown as plain words (5) */
  { const { ctx, page } = await fresh('m')
    await go(page, 'inputs')
    await tapVis(page, '[data-icday="2026-11-05"]'); await sleep(800)
    await tapVis(page, '#icPopAdd'); await sleep(800)
    await setVal(page, '#inpEditRmk', 'Dentist 0900'); await sleep(300)
    await scene(page, dev, 'member-input', [5, 4], '.floatwin.inpedwin')
    await ctx.close() }
  results[dev + '-errors'] = errs
  await browser.close()
}
writeFileSync(HERE + 'measures.json', JSON.stringify(results, null, 1))
for (const [k, v] of Object.entries(results)) {
  if (!v.today) { console.log(k, JSON.stringify(v)); continue }
  console.log('\n' + k)
  v.today.forEach((t, i) => { const f = v.fix[i]; console.log(`  ${t.what}: ${t.family.slice(0, 22)} ${t.size} ${t.weight} ${t.w}x${t.h}  →  ${f.family.slice(0, 22)} ${f.size} ${f.weight} ${f.w}x${f.h}`) })
}
