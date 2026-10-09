import { launch, open, openDay, file, shot, cardFacts, toList, overflow, press, judge, saveRows, signOut, signIn, DAYWIN, WIN, rec, recAll, errs } from './icard-A-lib.mjs'
const browser = await launch()
const T = true
const { ctx, page } = await open(browser, { width: 390, height: 844 }, 'ad', 'a', T)
await openDay(page, '2026-07-21', T)
await file(page, T, '2026-07-21', { type: 'Duty', who: 'Ranger', start: '09:00', end: '10:00', title: 'Stores collection', rmk: 'Bring the receipt' })
const mine = await rec(page, { type: 'Duty', title: 'Stores collection' })
console.log('filed', JSON.stringify(mine))
const ur=[]; await page.keyboard.press('Escape'); await page.waitForTimeout(300)
await page.locator('#undoBtn').tap(); await page.waitForTimeout(400); ur.push(!(await rec(page,{type:'Duty',title:'Stores collection'})))
await page.locator('#redoBtn').tap(); await page.waitForTimeout(400); ur.push(!!(await rec(page,{type:'Duty',title:'Stores collection'})))
console.log('undo removed, redo restored', ur)
// one ordinary saved change exists (the file above). Sign out and in as Ranger, in place.
await page.keyboard.press('Escape').catch(() => {})
await signOut(page, T)
await signIn(page, 'us', 'us')
const probs = []
if(!ur[0]) probs.push('Undo did not remove the input'); if(!ur[1]) probs.push('Redo did not bring it back')
// the list
await toList(page, T)
const lcards = (await cardFacts(page, '#inList', 'inl')).filter(c => c.title === 'Stores collection')
const lpic = await shot(page, '5-phone-list-ranger')
const day = async () => { await openDay(page, '2026-07-21', T); await page.waitForTimeout(400); return (await cardFacts(page, DAYWIN, 'idy')).filter(c => c.title === 'Stores collection') }
const dcards = await day()
const dpic = await shot(page, '5-phone-day-ranger')
for (const [label, cs] of [['list', lcards], ['day', dcards]]) {
  if (cs.length !== 1) { probs.push(`${label}: ${cs.length} cards named Stores collection`); continue }
  const c = cs[0]
  if (c.who !== 'Ranger') probs.push(`${label}: who "${c.who}"`)
  if (c.by !== 'By Saber') probs.push(`${label}: by "${c.by}"`)
  if (c.rmk !== 'Bring the receipt') probs.push(`${label}: rmk "${c.rmk}"`)
  const all = (c.who + c.kind + c.when + c.title + c.rmk + c.by)
  if (/for Ranger|Jul|\d\d:\d\d, |placed/i.test((c.by || ''))) probs.push(`${label}: by line carries more than By Saber: "${c.by}"`)
  console.log(label, JSON.stringify(c))
}
// opening keeps the full filing details
await page.locator(`${DAYWIN} [data-testid^="idy-row-"]`).filter({ hasText: 'Stores collection' }).locator('.icard-words').tap()
await page.locator(WIN).waitFor()
const placed = await page.locator(`${WIN} [data-testid="inped-placed"]`).innerText()
const winpic = await shot(page, '5-phone-window-ranger')
if (!/Placed by Saber for Ranger · \d{1,2} \w{3} \d\d, \d\d:\d\d/.test(placed)) probs.push('window small print: ' + placed)
await page.locator('#inpEditCancel').tap()
judge(5, 'phone 390', 'admin setup, member Ranger viewing', probs.length ? 'FAIL' : 'PASS', probs.join(' | ') || `list card and day card read Ranger / DUTY / title / remark / "By Saber" only; window says: ${placed.replace(/\s+/g, ' ')}`, [lpic, dpic, winpic])
await ctx.close()
await browser.close()
saveRows('s5')
console.log('ERRS', JSON.stringify(errs))
