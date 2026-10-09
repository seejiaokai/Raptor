import { launch, open, openDay, press, shot, cardFacts, toList, overflow, judge, saveRows, saveWin, csId, pickDates, dayHeads, MONTHS, DAYWIN, WIN, rec, recAll, errs } from './icard-A-lib.mjs'
const browser = await launch()
const T = true
const { ctx, page: p } = await open(browser, { width: 390, height: 844 }, 'ad', 'a', T)
async function fileSpan(day, who, from, to, title) {
  await openDay(p, day, T)
  await press(T, p.locator('#icPopAdd')); await p.locator(WIN).waitFor()
  await p.selectOption('#inpEditType', 'Duty'); await p.selectOption('#inpEditPerson', await csId(p, who))
  await p.fill('#inpEditStart', '09:00'); await p.fill('#inpEditEnd', '10:00'); await p.fill('#inpEditOwnTitle', title)
  await pickDates(p, T, from, to)
  await saveWin(p, T, 'no')
  await p.keyboard.press('Escape'); await p.waitForTimeout(200)
  return rec(p, { title })
}
const X = await fileSpan('2026-07-13', 'Anvil', '2026-07-13', '2026-07-22', 'ZW span')
const Y = await fileSpan('2026-07-17', 'Basher', '2026-07-17', '2026-07-19', 'ZW ends19')
console.log('X', X.date, X.endDate, 'Y', Y.date, Y.endDate)
await toList(p, T, false)
if (!(await p.locator('#inFilters').isVisible())) { await p.locator('#inFiltersBtn').tap(); await p.waitForTimeout(250) }
await p.fill('#inFSearch', 'ZW'); await p.waitForTimeout(300)
async function setRange(from, to) {
  if (!(await p.locator('#inRangePop').count())) { await p.locator('#inRangeBtn').scrollIntoViewIfNeeded(); await p.locator('#inRangeBtn').tap(); await p.waitForTimeout(300) }
  const go = async iso => {
    const [y, m] = iso.split('-').map(Number)
    for (let i = 0; i < 40; i++) {
      const [name, year] = (await p.locator('#inRangeCal .rc-mon').innerText()).trim().toLowerCase().split(/\s+/)
      const d = y * 12 + (m - 1) - (+year * 12 + MONTHS.findIndex(x => x.startsWith(name)))
      if (!d) return
      await p.locator(`#inRangeCal .rc-nav[aria-label="${d > 0 ? 'Next' : 'Previous'} month"]`).tap(); await p.waitForTimeout(120)
    }
  }
  await go(from); await p.locator(`#inRangeCal [data-cal="${from}"]`).tap(); await p.waitForTimeout(150)
  await go(to); await p.locator(`#inRangeCal [data-cal="${to}"]`).tap(); await p.waitForTimeout(350)
  // close the pop if it stays open: the button again, then a tap outside it
  for (let k = 0; k < 2; k++) {
    if (await p.locator('#inRangePop').isVisible().catch(() => false)) {
      if (k === 0) await p.locator('#inRangeBtn').tap().catch(() => {}); else await p.touchscreen.tap(380, 150)
      await p.waitForTimeout(300)
    }
  }
  return (await p.locator('#inRangeBtn').innerText()).trim()
}
const snap = async name => { await p.evaluate(() => { const e = document.querySelector('#inRangeBtn'); if (e) { e.scrollIntoView({ block: 'start' }); window.scrollBy(0, -110) } }); await p.waitForTimeout(250); return shot(p, name) }
const read = () => p.evaluate(() => {
  const out = []; let cur = null
  for (const e of document.querySelectorAll('#inList [data-testid="inl-day"], #inList [data-testid^="inl-row-"]')) {
    if (e.matches('[data-testid="inl-day"]')) { cur = { day: e.querySelector('b') ? e.querySelector('b').textContent.trim() : e.textContent, cards: [] }; out.push(cur) }
    else if (cur) cur.cards.push({ title: (e.querySelector('[data-testid="inl-title"]') || {}).textContent, when: (e.querySelector('[data-testid="inl-when"]') || {}).textContent })
  }
  return out
})
const probs = []; const pics = []; const logs = []
const cases = [
  ['20-21', '2026-07-20', '2026-07-21', { X: true, Y: false }],
  ['13-13 (first date only)', '2026-07-13', '2026-07-13', { X: true, Y: false }],
  ['22-22 (last date only)', '2026-07-22', '2026-07-22', { X: true, Y: false }],
  ['12-12 (day before)', '2026-07-12', '2026-07-12', { X: false, Y: false }],
  ['23-23 (day after)', '2026-07-23', '2026-07-23', { X: false, Y: false }],
  ['19-19 (Y last date)', '2026-07-19', '2026-07-19', { X: true, Y: true }],
  ['20-20 (day after Y ends)', '2026-07-20', '2026-07-20', { X: true, Y: false }],
  ['17-17 (Y first date)', '2026-07-17', '2026-07-17', { X: true, Y: true }],
  ['23-31 (after both)', '2026-07-23', '2026-07-31', { X: false, Y: false }],
]
for (const [tag, from, to, want] of cases) {
  const label = await setRange(from, to)
  const l = await read()
  const flat = l.flatMap(d => d.cards.map(c => ({ ...c, day: d.day })))
  const x = flat.find(c => c.title === 'ZW span'), y = flat.find(c => c.title === 'ZW ends19')
  logs.push(`${tag} [${label}]: ${flat.map(c => c.title + '@' + c.day + '(' + c.when + ')').join(', ') || 'none'}`)
  if (!!x !== want.X) probs.push(`window ${tag}: span input ${x ? 'shown' : 'missing'}`)
  if (!!y !== want.Y) probs.push(`window ${tag}: ends-19-Jul input ${y ? 'shown' : 'missing'}`)
  if (x && !/Mon 13 Jul/i.test(x.day)) probs.push(`window ${tag}: span input under "${x.day}"`)
  if (x && !/till 22 Jul/.test(x.when || '')) probs.push(`window ${tag}: span corner "${x.when}"`)
  if (l.some(d => !d.cards.length)) probs.push(`window ${tag}: empty day heading`)
  if (tag === '20-21' || tag.startsWith('22-22') || tag.startsWith('13-13')) pics.push(await snap('21-phone-window-' + tag.split(' ')[0]))
}
console.log(logs.join('\n'))
// undo / redo of the main save: after the last filing (Y), press undo/redo
await press(T, p.locator('#undoBtn')); await p.waitForTimeout(400)
const u = await rec(p, { title: 'ZW ends19' })
await press(T, p.locator('#redoBtn')); await p.waitForTimeout(400)
const r = await rec(p, { title: 'ZW ends19' })
if (u || !r) probs.push(`Undo/Redo of the last filing: after undo ${!!u}, after redo ${!!r}`)
judge(21, 'phone 390', 'admin', probs.length ? 'FAIL' : 'PASS', probs.join(' | ') || logs.join(' ## '), pics)
await ctx.close()
await browser.close()
saveRows('s21')
console.log('ERRS', JSON.stringify(errs))
