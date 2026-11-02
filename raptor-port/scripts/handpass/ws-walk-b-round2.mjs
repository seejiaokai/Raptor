/* WALKER B, part 3: B13 and B16 again (the first run's reads were the script's own: B13 looked for the change by its stored
   key, not by the seat; B16 looked for a dialog by class names the dialogs do not carry). node ws-walk-b-round2.mjs */
import { start, signIn, editTab, recorder, shotter, around, OUT, writeJson } from './ws-walk-b-lib.mjs'
console.log('ws-walk-b-round2 v1 (B13 and B16 again), pictures in ' + OUT)
const { browser, page, errors } = await start()
const { rows, note } = recorder()
const shot = shotter(page)
await signIn(page); await editTab(page)
const SEAT = '0.0.0.2.p'

/* the same fixture as part 2: an empty seat via the board's "+ aircraft", Comet dragged onto it */
await page.locator('#eWeek .day[data-day="0"] .dt.sb-open').click()
await page.waitForSelector('#schedBoard:not([hidden])'); await page.waitForTimeout(400)
const lac = page.locator('#sbBoard [data-lac="0.0.0"]').first()
await lac.scrollIntoViewIfNeeded(); await lac.click(); await page.waitForTimeout(500)
await page.locator('#sbDone').click(); await page.waitForTimeout(500)
const seatLoc = page.locator(`#eWeek [data-slot="${SEAT}"]`).first()
await seatLoc.scrollIntoViewIfNeeded()
const rp = page.locator('#eRoster .rpuck[data-person="beams"]').first()
await rp.scrollIntoViewIfNeeded()
const a = await rp.boundingBox(), b = await seatLoc.boundingBox()
await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await page.mouse.down()
await page.mouse.move(a.x + a.width / 2 - 12, a.y + a.height / 2 - 6, { steps: 4 })
await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 20 }); await page.waitForTimeout(250); await page.mouse.up(); await page.waitForTimeout(500)
const placed = await page.evaluate(k => document.querySelector(`#eWeek [data-slot="${k}"] [data-person]`)?.dataset.person, SEAT)
console.log('fixture: Comet on the seat?', placed)

/* ---------- B13 ---------- */
await page.locator('#histBtn').click(); await page.waitForTimeout(500)
const winUp = await page.locator('.chgwin:not([hidden])').count()
const allTab = page.locator('.chgwin .win-tab', { hasText: 'All changes' })
if (await allTab.count()) { await allTab.click(); await page.waitForTimeout(300) }
/* the line about the man put on: its text names Comet */
const line = page.locator('.chgwin button[data-cwkey]', { hasText: 'Comet put on' }).first()
const hasLine = await line.count()
/* scroll the week well away from the seat so a jump is a real move */
await page.evaluate(() => { document.querySelectorAll('#eWeek, .page, body, html').forEach(e => { try { e.scrollTop = 0 } catch {} }); window.scrollTo(0, 0) })
const before = await page.evaluate(k => { const e = document.querySelector(`#eWeek [data-slot="${k}"]`); const r = e.getBoundingClientRect(); return { top: Math.round(r.top), left: Math.round(r.left), inView: r.top >= 60 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth } }, SEAT)
const p13a = await shot('B13d-changes-before-tap')
await line.click(); await page.waitForTimeout(800)
const after = await page.evaluate(k => {
  const e = document.querySelector(`#eWeek [data-slot="${k}"]`); const r = e.getBoundingClientRect()
  const p = e.querySelector('.puck'); const cs = p ? getComputedStyle(p) : null
  /* what lies at the seat's middle: the seat itself, not the changes window */
  const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
  return { top: Math.round(r.top), left: Math.round(r.left), inView: r.top >= 60 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth, seatIsTop: !!hit && e.contains(hit), puckOutline: cs ? cs.outlineStyle + ' ' + cs.outlineWidth + ' ' + cs.outlineColor : null, puckClass: p ? p.className : null }
}, SEAT)
const stillOpen = await page.locator('.chgwin:not([hidden])').count()
const p13b = await shot('B13e-after-tap-the-line')
const p13c = await shot('B13f-seat-close-up', await around(page, `#eWeek [data-slot="${SEAT}"]`, 80))
await page.locator('.chgwin .win-x').click(); await page.waitForTimeout(400)
const closed = (await page.locator('.chgwin:not([hidden])').count()) === 0
await shot('B13g-closed-by-x')
note('B13 changes window (re-read): the clock opens it; tapping the line "Comet put on" takes the schedule to Comet\'s seat; ✕ closes it', winUp === 1 && hasLine === 1 && after.inView && after.seatIsTop && stillOpen === 1 && closed, `window ${winUp}; line found ${hasLine}; seat before ${JSON.stringify(before)}; after ${JSON.stringify(after)}; window stayed open ${stillOpen}; closed by ✕ ${closed}`, 'B13d B13e B13f B13g')

/* ---------- B16 ---------- */
await page.locator('#eWeek .day[data-day="0"] .dt.sb-open').click()
await page.waitForSelector('#schedBoard:not([hidden])'); await page.waitForTimeout(400)
const size = () => page.evaluate(() => JSON.stringify(window.DAYS).length + '|' + JSON.stringify(window.SCHED).length)
const d0 = await size()
/* a dialog is found by the words of its title; its ✕ and its buttons by their own box inside it */
const dialogOf = title => page.evaluate(t => {
  const h = [...document.querySelectorAll('#schedBoard *, body > *, #app *')].find(e => e.children.length <= 1 && e.offsetWidth && e.textContent.trim().startsWith(t) && e.textContent.trim().length < t.length + 6)
  if (!h) return null
  let c = h; for (let i = 0; i < 6 && c.parentElement; i++) { c = c.parentElement; if (c.querySelector('button') && c.offsetWidth > 300) break }
  return { cls: c.className, btns: [...c.querySelectorAll('button')].map(b => (b.getAttribute('aria-label') || b.textContent.trim()) + '@' + Math.round(b.getBoundingClientRect().left) + ',' + Math.round(b.getBoundingClientRect().top)), box: c.getBoundingClientRect().toJSON() }
}, title)
const gone = title => page.evaluate(t => ![...document.querySelectorAll('*')].some(e => e.children.length <= 1 && e.offsetWidth && e.textContent.trim().startsWith(t) && e.textContent.trim().length < t.length + 6), title)
async function pressIn(title, name) {
  const d = await dialogOf(title)
  const btn = page.locator('button:visible', { hasText: name instanceof RegExp ? name : new RegExp('^' + name + '$') })
  return { d, btn }
}

/* Sort all: open; Cancel; open; ✕; open; Escape */
const sortResults = {}
for (const how of ['Cancel', 'x', 'Escape']) {
  await page.locator('#sbSortAll').click(); await page.waitForTimeout(400)
  const d = await dialogOf('Sort all —')
  await shot(`B16a-sortall-open-${how}`)
  if (how === 'Cancel') await page.locator('button:visible', { hasText: /^Cancel$/ }).first().click()
  else if (how === 'x') await page.locator('button[aria-label="Close"]:visible').first().click()
  else await page.keyboard.press('Escape')
  await page.waitForTimeout(400)
  sortResults[how] = { up: !!d, closed: await gone('Sort all —'), boardStill: (await page.locator('#schedBoard:not([hidden])').count()) === 1, same: (await size()) === d0 }
  await shot(`B16a-sortall-closed-by-${how}`)
}
note('B16a Sort all: opens; Cancel, ✕ and Escape each close it; nothing sorted; the board stays', Object.values(sortResults).every(r => r.up && r.closed && r.boardStill && r.same), JSON.stringify(sortResults), 'B16a-*')

/* a jet's CX: open; ✕; open; Escape (never "Cancel line", which would cancel it) */
const cx = page.locator('#sbBoard [data-lcx]:visible').first()
const cxResults = {}
for (const how of ['x', 'Escape']) {
  await cx.scrollIntoViewIfNeeded(); await cx.click(); await page.waitForTimeout(400)
  const d = await dialogOf('Cancel this line')
  await shot(`B16b-cx-open-${how}`)
  if (how === 'x') await page.locator('button[aria-label="Close"]:visible').first().click(); else await page.keyboard.press('Escape')
  await page.waitForTimeout(400)
  cxResults[how] = { up: !!d, btns: d ? d.btns : null, closed: await gone('Cancel this line'), boardStill: (await page.locator('#schedBoard:not([hidden])').count()) === 1, same: (await size()) === d0 }
  await shot(`B16b-cx-closed-by-${how}`)
}
note("B16b a jet's CX dialog: opens; ✕ and Escape each close it and the line stays uncancelled", Object.values(cxResults).every(r => r.up && r.closed && r.boardStill && r.same), JSON.stringify(cxResults), 'B16b-*')

console.log('errors:', JSON.stringify(errors))
note('B-errs part 3: no console errors, page errors or failed requests', errors.length === 0, errors.join(' | '))
await browser.close()
writeJson('ws-walk-b-results3.json', rows)
console.log(`\n${rows.filter(r => r.ok).length}/${rows.length} pass`)
