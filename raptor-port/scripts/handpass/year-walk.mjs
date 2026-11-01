// The WALK of the year build (2 Nov 26 — [LW-YEAR-CLEAR] D1561, [CAL-MONTH-YEAR-JUMP] D1562, [LW-MONTHSTRIP-TWO-YEARS]),
// beyond year-build-check.mjs's measures: the bug-check order's lessons that apply (7.11 — 10 a page hidden and shown,
// 11 a reading of what fits on screen: zoomed out at 1536 and at 2560, the period's two ends; 7.10 the moment after a
// tap on a phone) and the plain-user round (7.0a, D1557): leave filed on the Leave War in July 2027, then found on the
// Inputs calendar by the new jump — his own case of 2 Nov 26. Every step asserts what a person SEES.
// Run from raptor-port/ against the build served on PORT (default 4243): node scripts/handpass/year-walk.mjs
import path from 'node:path'
import { mkdirSync } from 'node:fs'
import { chromium, webkit, devices } from '@playwright/test'

const PORT = process.env.PORT || 4243
const OUT = path.resolve('docs/img/handpass/2026-11-02-year-build/walk')
mkdirSync(OUT, { recursive: true })
const sleep = ms => new Promise(r => setTimeout(r, ms))
const fails = []
const check = (ok, what) => { console.log((ok ? 'PASS ' : 'FAIL ') + what); if (!ok) fails.push(what) }
const q = t => `[data-testid="${t}"]`

async function open(dev, user = 'ad', pass = 'a') {
  const phone = dev === 'phone'
  const b = phone ? await webkit.launch() : await chromium.launch()
  const vw = dev === 'wide' ? 2560 : 1536
  const ctx = phone ? await b.newContext({ ...devices['iPhone 13'], viewport: { width: 402, height: 874 }, deviceScaleFactor: 2 })
    : await b.newContext({ viewport: { width: vw, height: 900 } })
  const P = await ctx.newPage()
  P.on('pageerror', e => { check(false, `${dev}: page error ${String(e).slice(0, 120)}`) })
  await P.goto(`http://localhost:${PORT}/?fresh=1`); await P.waitForSelector('#luser')
  await P.fill('#luser', user); await P.fill('#lpass', pass); await P.click('#loginForm button[type=submit]')
  await P.waitForSelector('#vWeek .day', { state: 'attached' })
  return { b, P, phone, W: phone ? 402 : vw }
}
const press = async (P, phone, sel) => { const l = P.locator(sel).first(); if (phone) await l.tap(); else await l.click(); await sleep(350) }
const years = P => P.evaluate(() => [...document.querySelectorAll('.lw-yr')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.top >= 0 && r.top < innerHeight }).map(e => e.textContent))
/* the first date whose heading stands past the frozen columns — what a person reads as "the first date in view" */
const firstDate = P => P.evaluate(() => {
  const bal = document.querySelector('[data-testid="counter-head"]').getBoundingClientRect().right
  const heads = [...document.querySelectorAll('.mx .mxhead th.day[data-d]')].filter(h => { const r = h.getBoundingClientRect(); return r.right - bal > 2 && r.width > 0 })
  heads.sort((a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left)
  return heads[0]?.dataset.d || ''
})
const agrees = async (P, what) => {
  const [y, d] = [await years(P), await firstDate(P)]
  check(y.length > 0 && y.every(v => v === d.slice(0, 4)), `${what}: the corner reads ${y.join(',')} with ${d} first in view`)
}
async function toWar(P, period) {
  await P.evaluate(() => window.go('leavewar')); await P.waitForSelector(q('month-strip'))
  if (period) { await P.selectOption(q('war-picker'), period); await sleep(900) }
}

async function leaveWarWalk(dev) {
  const { b, P, phone, W } = await open(dev)
  await toWar(P, 'y2027')
  await agrees(P, `${dev}: opened on JAN – DEC 27`)
  // lesson 11: the period's two ends, pressed on the strip
  await press(P, phone, q('month-JAN')); await sleep(600); await agrees(P, `${dev}: JAN pressed`)
  await press(P, phone, q('month-DEC')); await sleep(900); await agrees(P, `${dev}: DEC pressed (the year's end, the view cannot scroll as far)`)
  // lesson 10: the period changed by the View picker — the corner right at once, no scroll
  await P.selectOption(q('war-picker'), 'y2026'); await sleep(900)
  await agrees(P, `${dev}: the View picker to JAN – DEC 26, no scroll`)
  // lesson 10: another tab and back, the period changed while away
  const tabs = await P.$$eval('[role="tab"]', ts => ts.map(t => t.textContent.trim()))
  const appr = tabs.find(t => /Approvals/.test(t)), grid = tabs.find(t => /^Grid/.test(t))
  if (appr && grid) {
    await P.locator('[role="tab"]', { hasText: appr }).first().click(); await sleep(400)
    await P.selectOption(q('war-picker'), 'y2027'); await sleep(2500)                      // past the idle time
    await P.locator('[role="tab"]', { hasText: grid }).first().click(); await sleep(120)
    await P.screenshot({ path: path.join(OUT, `${dev}-back-from-approvals-first-frame.png`), clip: { x: 0, y: 0, width: W, height: 420 } })
    await sleep(600); await agrees(P, `${dev}: back on the grid from Approvals, the period changed while away`)
  } else check(false, `${dev}: the Grid / Approvals tabs were not found (${tabs.join(',')})`)
  // lesson 11 at a desktop: zoomed out by Ctrl + scroll over the grid
  if (!phone) {
    const box = await P.locator('.mx-wrap').boundingBox()
    await P.mouse.move(box.x + box.width / 2, box.y + 200)
    await P.keyboard.down('Control')
    // eslint-disable-next-line react-doctor/async-await-in-loop -- one wheel step after another, as a hand turns it
    for (let i = 0; i < 12; i++) { await P.mouse.wheel(0, 120); await sleep(60) }
    await P.keyboard.up('Control'); await sleep(900)
    await press(P, false, q('month-DEC')); await sleep(900)
    await agrees(P, `${dev}: zoomed out, DEC pressed`)
    await P.screenshot({ path: path.join(OUT, `${dev}-zoomed-out.png`), clip: { x: 0, y: 0, width: Math.min(W, 1536), height: 520 } })
  }
  // Rearrange: the corner widens; the year still in it
  if (await P.$(q('settings-open'))) {
    await press(P, phone, q('settings-open'))
    const ra = P.locator('button', { hasText: /Rearrange the grid/ }).first()
    if (await ra.count()) {
      await (phone ? ra.tap() : ra.click()); await sleep(600)
      const c = await P.evaluate(() => { const th = document.querySelector('.mx .mxhead th.who'); const y = th.querySelector('.lw-yr').getBoundingClientRect(); const r = th.getBoundingClientRect(); return { fits: y.right <= r.right, t: y.width > 0 } })
      check(c.fits && c.t, `${dev}: in Rearrange the year still stands inside the widened corner`)
      await P.screenshot({ path: path.join(OUT, `${dev}-rearrange.png`), clip: { x: 0, y: 0, width: Math.min(W, 900), height: 520 } })
      const done = P.locator('button', { hasText: /Done/ }).first(); if (await done.count()) { await (phone ? done.tap() : done.click()); await sleep(400) }
    } else { await P.keyboard.press('Escape'); await sleep(300) }
  }
  // THE PLAIN-USER ROUND, part 1 — his own case: leave filed on Thu 22 Jul 2027 on the war, the year in sight as he files
  await P.selectOption(q('war-picker'), 'y2027'); await sleep(900)
  await press(P, phone, q('month-JUL')); await sleep(900)
  const row = await P.evaluate(() => document.querySelector('td[data-testid^="cell-"][data-testid$="-2027-07-22"]')?.dataset.testid)
  check(!!row, `${dev}: a row's 22 Jul 2027 cell is on the grid`)
  if (row) {
    await P.locator(`[data-testid="${row}"]`).scrollIntoViewIfNeeded(); await sleep(300)
    await press(P, phone, `[data-testid="${row}"]`)
    const bp = await P.$(q('bid-picker'))
    check(!!bp, `${dev}: a tap on 22 Jul opens the bid window`)
    if (bp) {
      const ll = P.locator(q('bid-LL')).first()
      if (await ll.count()) { await (phone ? ll.tap() : ll.click()); await sleep(600) }
      if (await P.$(q('bid-picker'))) await press(P, phone, q('bid-cancel'))
      const code = await P.locator(`[data-testid="${row}"]`).innerText()
      check(/LL/.test(code), `${dev}: LL stands on 22 Jul 2027 (${code.replace(/\s+/g, ' ')})`)
      await P.screenshot({ path: path.join(OUT, `${dev}-filed-22jul27.png`), clip: { x: 0, y: 0, width: Math.min(W, 1536), height: phone ? 874 : 600 } })
      await agrees(P, `${dev}: after filing, the corner still reads the right year`)
    }
  }
  // THE PLAIN-USER ROUND, part 2 — the Inputs calendar, reached by its title's wheels in one step
  await P.evaluate(() => window.go('inputs')); await sleep(500)
  if (await P.$('#inCalBtn')) { await P.click('#inCalBtn'); await sleep(400) }
  await press(P, phone, '.ic-mon')
  if (phone) await P.screenshot({ path: path.join(OUT, `${dev}-title-tap-moment.png`), clip: { x: 0, y: 0, width: W, height: 874 } })
  const want = { y: 2027, m: 7 }
  // the wheels turned as a person does: the keyboard on a desktop; a finger's flick of the lists on a phone
  for (let i = 0; i < 30; i++) {
    // eslint-disable-next-line react-doctor/async-await-in-loop -- the wheels are turned one row at a time, each read after it rests
    const cur = await P.evaluate(() => document.querySelector('.ic-mon').getAttribute('aria-label'))
    const [mn, yr] = cur.split(' — ')[0].split(' ')
    const m = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].indexOf(mn) + 1
    if (+yr === want.y && m === want.m) break
    const list = +yr !== want.y ? 'mjump-years' : 'mjump-months'
    const dir = (+yr !== want.y ? want.y - +yr : want.m - m) > 0 ? 1 : -1
    if (phone) {
      // eslint-disable-next-line react-doctor/async-await-in-loop -- one flick, then the rest it settles on
      await P.locator(q(list)).evaluate((el, d) => { el.scrollBy({ top: d * 44 * (Math.abs(d) > 0 ? 1 : 0) }) }, dir)
      // eslint-disable-next-line react-doctor/async-await-in-loop -- read only once the list has come to rest
      await sleep(450)
    } else {
      // eslint-disable-next-line react-doctor/async-await-in-loop -- one arrow press after another
      await P.locator(q(list)).press(dir > 0 ? 'ArrowDown' : 'ArrowUp'); await sleep(120)
    }
  }
  const t = await P.evaluate(() => document.querySelector('.ic-mon').textContent)
  check(/2027/.test(t) && /Jul/i.test(t), `${dev}: the wheels brought the Inputs calendar to July 2027 (${t})`)
  await P.screenshot({ path: path.join(OUT, `${dev}-wheels-jul27.png`), clip: { x: 0, y: 0, width: Math.min(W, 1100), height: phone ? 874 : 640 } })
  // a tap outside the card, near the screen's left edge below the top bar
  if (phone) await P.touchscreen.tap(8, 700); else await P.mouse.click(8, 700)
  await sleep(350)
  check(!(await P.$(q('dcal-card'))), `${dev}: a tap outside closes the card`)
  if (phone) {
    await P.screenshot({ path: path.join(OUT, `${dev}-after-close-moment.png`), clip: { x: 0, y: 0, width: W, height: 300 } })
    const tint = await P.evaluate(() => getComputedStyle(document.querySelector('.ic-mon .mjt-w')).color)
    const ink = await P.evaluate(() => getComputedStyle(document.querySelector('#icToday')).color)
    check(tint !== 'rgb(59, 198, 232)', `${dev}: the closed title is not left cyan by the tap (${tint}; Today ${ink})`)
  }
  // the month draws its bars across the week, not inside a date's box: a bar standing over 22 Jul's box
  const bar = await P.evaluate(() => {
    const d = document.querySelector('[data-icday="2027-07-22"]').getBoundingClientRect()
    return [...document.querySelectorAll('.ib-bar')].filter(e => { const r = e.getBoundingClientRect(); return r.left < d.right - 2 && r.right > d.left + 2 && r.top >= d.top && r.bottom <= d.bottom }).map(e => e.textContent).join(' ')
  })
  check(bar.length > 0,`${dev}: 22 Jul 2027 on the Inputs calendar shows the leave filed on the war (${bar.replace(/\s+/g, ' ').slice(0, 60)})`)
  await P.screenshot({ path: path.join(OUT, `${dev}-inputs-jul27.png`), clip: { x: 0, y: 0, width: Math.min(W, 1536), height: phone ? 874 : 700 } })
  // the List keeps the switch in its place (the copy of the title on the List, ▾ and all)
  if (!phone) {
    const sw = () => P.evaluate(() => Math.round(document.querySelector('#inListBtn').getBoundingClientRect().left))
    const a = await sw(); await P.click('#inListBtn'); await sleep(400); const c = await sw(); await P.click('#inCalBtn'); await sleep(400)
    check(a === c, `${dev}: the Calendar | List switch stands still between the two (${a} / ${c})`)
  }
  await b.close()
}

async function memberWalk() {
  const { b, P } = await open('phone', 'us', 'us')
  await toWar(P)
  check((await years(P)).length > 0, 'phone member: the corner carries the year for a member too')
  await P.evaluate(() => window.go('inputs')); await sleep(500)
  if (await P.$('#inCalBtn')) { await P.click('#inCalBtn'); await sleep(400) }
  await P.locator('.ic-mon').tap(); await sleep(400)
  check(!!(await P.$(q('mjump-lists'))), 'phone member: a member\'s title opens the wheels too')
  await P.keyboard.press('Escape'); await sleep(300)
  check(!(await P.$(q('dcal-card'))), 'phone member: Escape closes it')
  await b.close()
}

for (const dev of ['phone', 'desktop', 'wide']) {
  // eslint-disable-next-line react-doctor/async-await-in-loop -- the sizes run one after another
  await leaveWarWalk(dev)
}
await memberWalk()
console.log(fails.length ? `\n${fails.length} FAILED` : '\nall passed')
process.exit(fails.length ? 1 : 0)
