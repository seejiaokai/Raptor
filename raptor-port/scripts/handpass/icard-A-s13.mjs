import { launch, open, openDay, press, shot, cardFacts, toList, overflow, judge, saveRows, geom2, saveWin, csId, DAYWIN, WIN, rec, recAll, errs } from './icard-A-lib.mjs'
const browser = await launch()
const T = true
const { ctx, page: p } = await open(browser, { width: 390, height: 844 }, 'us', 'us', T)
const half = label => p.locator(`${WIN} button`).filter({ hasText: new RegExp('^' + label + '$', 'i') }).first()
// 1. file LL as AM
await openDay(p, '2026-07-21', T)
await press(T, p.locator('#icPopAdd')); await p.locator(WIN).waitFor()
await p.selectOption('#inpEditType', 'LL')
await press(T, half('AM'))
await saveWin(p, T, 'no')
const r0 = await rec(p, { type: 'LL', person: await csId(p, 'Ranger') })
console.log('filed', JSON.stringify(r0))
const seen = []
const probs = []
async function look(label, want) {
  await openDay(p, '2026-07-21', T); await p.waitForTimeout(400)
  const dc = (await cardFacts(p, DAYWIN, 'idy')).find(c => c.iid === r0.iid)
  const dpic = await shot(p, `13-${label}-day`)
  await toList(p, T)
  const lc = (await cardFacts(p, '#inList', 'inl')).find(c => c.iid === r0.iid)
  await p.locator(`#inList [data-testid="inl-row-${r0.iid}"]`).scrollIntoViewIfNeeded()
  const lpic = await shot(p, `13-${label}-list`)
  const rec1 = await rec(p, { iid: r0.iid })
  console.log(label, 'day:', dc && dc.when, '| list:', lc && lc.when, '| record s/e/half', rec1.s, rec1.e, rec1.half)
  if (!dc || dc.when !== want) probs.push(`${label}: day card says "${dc && dc.when}" wanted "${want}"`)
  if (!lc || lc.when !== want) probs.push(`${label}: list card says "${lc && lc.when}" wanted "${want}"`)
  if (dc && /AM|PM/.test(dc.when) && want !== 'AM' && want !== 'PM') probs.push(`${label}: stale AM/PM beside custom hours "${dc.when}"`)
  seen.push({ label, day: dc && dc.when, list: lc && lc.when })
  return [dpic, lpic]
}
let pics = await look('AM', 'AM')
// 2. change to PM, from the list card
async function openFromList() {
  await toList(p, T)
  const c = p.locator(`#inList [data-testid="inl-row-${r0.iid}"]`); await c.scrollIntoViewIfNeeded(); await c.tap(); await p.locator(WIN).waitFor()
}
await openFromList()
const inAM = await half('AM').getAttribute('aria-pressed').catch(() => null)
await press(T, half('PM')); await saveWin(p, T, 'no')
pics = pics.concat(await look('PM', 'PM'))
// 3. custom 09:00-11:00
await openFromList()
await press(T, half('Custom'))
await p.fill('#inpEditStart', '09:00'); await p.fill('#inpEditEnd', '11:00')
await saveWin(p, T, 'no')
pics = pics.concat(await look('custom', '09:00–11:00'))
// undo / redo of the last (main) save
await p.keyboard.press('Escape').catch(() => {})
await press(T, p.locator('#undoBtn')); await p.waitForTimeout(500)
const u = await rec(p, { iid: r0.iid })
await press(T, p.locator('#redoBtn')); await p.waitForTimeout(500)
const rd = await rec(p, { iid: r0.iid })
console.log('undo ->', u && [u.s, u.e, u.half], 'redo ->', rd && [rd.s, rd.e, rd.half])
if (!u || (u.s === 540 && u.e === 660)) probs.push('Undo did not take back the custom hours')
if (!rd || rd.s !== 540 || rd.e !== 660) probs.push('Redo did not restore 09:00-11:00')
judge(13, 'phone 390', 'member Ranger', probs.length ? 'FAIL' : 'PASS', probs.join(' | ') || `cards said AM, then PM, then 09:00–11:00 on both the day and the list; no stale AM/PM; Undo/Redo fine (${JSON.stringify(seen)})`, pics)
await ctx.close()
await browser.close()
saveRows('s13')
console.log('ERRS', JSON.stringify(errs))
