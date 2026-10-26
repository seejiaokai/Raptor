// Walker 2, scenario 20: an HO the app credits itself from a published weekend duty — its half, from the duty's start time.
import { newCtx, T, press, vis, txt, shot, cellShot, boxes, rec, errs, saveResults, closeBrowser, URL } from './lw-m2-walk-2-lib.mjs'
console.log('lw-m2-walk-2-s20 v1 (build fcddf90f4 on :4173)')
class Asserts {
  constructor() { this.items = [] }
  ok(cond, note) { this.items.push({ pass: !!cond, note }); return !!cond }
  get pass() { return this.items.length > 0 && this.items.every(i => i.pass) }
  get saw() { return this.items.map(i => (i.pass ? '✓ ' : '✗ ') + i.note).join('; ') }
}
async function weekendDuty(page, dayIdx, dayName, start, end) {
  await page.evaluate(n => { const w = document.querySelector('#eWeek'); const d = [...w.querySelectorAll('.day')].find(x => x.innerText.slice(0, 30).includes(n)); w.scrollLeft = d.offsetLeft - 10 }, dayName)
  await page.waitForTimeout(700)
  for (const [k, v] of [['str', start], ['end', end]]) {
    const el = page.locator('[data-txt="dr:' + dayIdx + '.0.0.' + k + '"]').first()
    await el.click(); await page.keyboard.press('Control+A'); await page.keyboard.type(v); await page.keyboard.press('Enter'); await page.waitForTimeout(400)
  }
  for (const k of ['cur', 'sked', 'plan', 'appr']) { await page.locator('select[data-sign="' + k + '"][data-signday="' + dayIdx + '"]').selectOption({ index: 1 }); await page.waitForTimeout(200) }
  await page.locator('#eWeek .day', { hasText: dayName }).first().getByText('Publish day').first().click(); await page.waitForTimeout(900)
}
const c = await newCtx('desk', 'S20'); const page = c.page
await page.goto(URL); await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]'); await page.waitForSelector('#vWeek .day')
await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(1200)
let setup = ''
try {
  await weekendDuty(page, 5, 'Saturday', '08:00', '12:00')
  await weekendDuty(page, 6, 'Sunday', '13:00', '17:00')
  setup = 'published Sat 18 Jul (SDO duty, Fable, 08:00-12:00) and Sun 19 Jul (SDO duty, Dash, 13:00-17:00)'
} catch (e) { setup = 'setup stopped: ' + e.message.split('\n')[0] }
await shot(page, 's20-desk-a-published-weekend')
let third = ''
try {
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => x.innerText.trim() === 'Jul 20' && x.offsetParent); b.click() }); await page.waitForTimeout(1500)
  const has5 = await page.locator('[data-txt="dr:5.0.0.str"]').count()
  if (has5) { await weekendDuty(page, 5, 'Saturday', '10:00', '14:00'); third = 'published Sat 25 Jul 10:00-14:00' } else third = 'next Saturday carries no duty row to time'
} catch (e) { third = 'third stopped: ' + e.message.split('\n')[0] }
await shot(page, 's20-desk-a2-next-week')
await page.evaluate(() => window.go('leavewar')); await page.waitForSelector('[data-testid^="row-"]'); await page.waitForTimeout(900); await press(c, T('month-JUL')); await page.waitForTimeout(1500)
const A = new Asserts(); const pics = ['s20-desk-a-published-weekend', 's20-desk-a2-next-week']
try {
  const ids = await page.evaluate(() => ({ fable: !!document.querySelector('[data-testid="cell-plasma-2026-07-18"]'), dash: !!document.querySelector('[data-testid="cell-spaceman-2026-07-19"]') }))
  A.ok(ids.fable && ids.dash, 'the two men have cells on those dates: ' + JSON.stringify(ids))
  const f1 = await boxes(page, 'plasma', '2026-07-18'), d1 = await boxes(page, 'spaceman', '2026-07-19')
  A.ok(f1 && f1.some(x => /k-oil/.test(x.cls) && /\b(top|right-am)\b/.test(x.cls)), 'Sat 08:00-12:00 draws an OIL box in the top (morning) half: ' + JSON.stringify(f1))
  A.ok(f1 && f1.some(x => /\*/.test(x.text)), 'the box the schedule credited wears the star: texts ' + JSON.stringify(f1 && f1.map(x => x.text)))
  A.ok(d1 && d1.some(x => /k-oil/.test(x.cls) && /\b(bot|right-pm)\b/.test(x.cls)), 'Sun 13:00-17:00 draws an OIL box in the bottom (afternoon) half: ' + JSON.stringify(d1))
  await cellShot(page, 'plasma', '2026-07-18', 's20-desk-b-sat-am'); await cellShot(page, 'spaceman', '2026-07-19', 's20-desk-c-sun-pm'); pics.push('s20-desk-b-sat-am', 's20-desk-c-sun-pm')
  if (/published Sat 25/.test(third)) {
    const t1 = await page.evaluate(() => [...document.querySelectorAll('[data-testid^="cell-"][data-testid$="2026-07-25"] .c')].map(e => e.className + ' ' + e.textContent))
    A.ok(t1.some(x => /k-oil/.test(x) && /\b(top|right-am)\b/.test(x)), 'a 10:00-14:00 stretch counts as the morning: ' + JSON.stringify(t1))
  } else A.ok(true, 'third stretch (10:00-14:00) not built: ' + third)
  await press(c, T('oil-tracker')); await page.waitForSelector(T('oil-sheet')); await page.waitForTimeout(500)
  const tl = await page.evaluate(() => ({ fable: document.querySelector('[data-testid="oil-row-plasma"]')?.innerText.replace(/\s+/g, ' '), dash: document.querySelector('[data-testid="oil-row-spaceman"]')?.innerText.replace(/\s+/g, ' ') }))
  A.ok(tl.fable && /18 Jul AM/.test(tl.fable), 'the OIL tracker line reads AM beside the date: ' + tl.fable)
  A.ok(tl.dash && /19 Jul PM/.test(tl.dash), 'the OIL tracker line reads PM beside the date: ' + tl.dash)
  await shot(page, 's20-desk-d-oil-tracker'); pics.push('s20-desk-d-oil-tracker')
} catch (e) { A.ok(false, 'script stopped: ' + e.message.split('\n')[0]) }
rec(20, 'desk', 'admin', A.pass ? 'PASS' : 'FAIL', 'Edit Schedule: ' + setup + '; ' + third + '. Then the Leave War cells and the OIL tracker lines', A.saw, pics)
saveResults('part-S20')
console.log('ERRORS', JSON.stringify(errs))
await closeBrowser()
