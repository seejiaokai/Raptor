import { launch, open, openDay, press, shot, cardFacts, toList, overflow, judge, saveRows, saveWin, csId, pickDates, dayHeads, MONTHS, DAYWIN, WIN, rec, recAll, errs } from './icard-A-lib.mjs'
const browser = await launch()
const T = true
const { ctx, page: p } = await open(browser, { width: 390, height: 844 }, 'ad', 'a', T)
const probs = []; const pics = []; const logs = []
// the shared entry (Ranger + Saber) and a Ranger LL, filed through the day window
await openDay(p, '2026-07-28', T)
await press(T, p.locator('#icPopAdd')); await p.locator(WIN).waitFor()
await p.selectOption('#inpEditType', 'Meeting')
await press(T, p.locator(`${WIN} [data-testid="pp-several"]`))
for (const cs of ['Ranger', 'Saber']) { const b = p.locator(`${WIN} [data-pp="${await csId(p, cs)}"]`); await b.scrollIntoViewIfNeeded().catch(() => {}); if ((await b.getAttribute('aria-pressed')) !== 'true') await press(T, b) }
await p.fill('#inpEditStart', '09:00'); await p.fill('#inpEditEnd', '10:00'); await p.fill('#inpEditOwnTitle', 'ZR shared meeting')
await saveWin(p, T, 'no'); await p.keyboard.press('Escape'); await p.waitForTimeout(200)
await press(T, p.locator('#icPopAdd')).catch(() => {})
await openDay(p, '2026-07-21', T)
await press(T, p.locator('#icPopAdd')); await p.locator(WIN).waitFor()
await p.selectOption('#inpEditType', 'LL'); await p.selectOption('#inpEditPerson', await csId(p, 'Ranger'))
await saveWin(p, T, 'no'); await p.keyboard.press('Escape'); await p.waitForTimeout(200)
// filters: Ranger, LL, a July window (13 - 31 Jul)
await toList(p, T, false)
if (!(await p.locator('#inFilters').isVisible())) { await p.locator('#inFiltersBtn').tap(); await p.waitForTimeout(250) }
const setRange = async (from, to) => {
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
  if (await p.locator('#inRangePop').count()) { await p.keyboard.press('Escape'); await p.waitForTimeout(250); if (await p.locator('#inRangePop').count()) { await p.locator('#inRangeBtn').tap().catch(() => {}); await p.waitForTimeout(250) } }
}
await setRange('2026-07-13', '2026-07-31')
await p.selectOption('#inFPerson', await csId(p, 'Ranger')); await p.selectOption('#inFType', 'LL'); await p.waitForTimeout(400)
const snap = async name => { await p.evaluate(() => { const e = document.querySelector('#inRangeBtn'); if (e) { e.scrollIntoView({ block: 'start' }); window.scrollBy(0, -110) } }); await p.waitForTimeout(250); return shot(p, name) }
const read = () => p.evaluate(() => {
  const out = []; let cur = null
  for (const e of document.querySelectorAll('#inList [data-testid="inl-day"], #inList [data-testid^="inl-row-"]')) {
    if (e.matches('[data-testid="inl-day"]')) { cur = { day: e.querySelector('b') ? e.querySelector('b').textContent.trim() : e.textContent, cards: [] }; out.push(cur) }
    else if (cur) cur.cards.push({ iid: e.getAttribute('data-iid') || e.getAttribute('data-popiid'), who: (e.querySelector('[data-testid="inl-who"]') || {}).textContent, kind: (e.querySelector('[data-testid="inl-kind"]') || {}).textContent, title: (e.querySelector('[data-testid="inl-title"]') || {}).textContent })
  }
  return out
})
const flat = l => l.flatMap(d => d.cards.map(c => ({ ...c, day: d.day })))
let l = await read(); logs.push('filtered Ranger+LL+July: ' + JSON.stringify(flat(l).map(c => `${c.who} ${c.kind}@${c.day}`)))
pics.push(await snap('22-phone-filtered'))
// ---- part 1: add a Saber Event in August through "Add input"
await p.evaluate(() => { const e = document.querySelector('#inPerson'); if (e) e.scrollIntoView({ block: 'center' }) })
await p.selectOption('#inPerson', await csId(p, 'Saber'))
await p.selectOption('#inType', 'Event')
// the form's own calendar: go to August 2026 and pick the 4th
const inCalMon = () => p.locator('#inCal .rc-mon, #inCal .ic-mon').first().innerText()
for (let i = 0; i < 6; i++) { if (/aug/i.test(await inCalMon())) break; await p.locator('#inCal .rc-nav[aria-label="Next month"]').first().tap(); await p.waitForTimeout(150) }
await p.locator('#inCal [data-cal="2026-08-04"]').tap(); await p.waitForTimeout(200)
const cust = p.locator('#inDates button, #inCal ~ * button').filter({ hasText: /^Custom$/i }).first()
if (await cust.count()) { await cust.tap().catch(() => {}); await p.waitForTimeout(150) }
await p.fill('#inStartT', '09:00').catch(() => {}); await p.fill('#inEndT', '10:00').catch(() => {})
await p.fill('#inRemarks', 'ZR august event')
await p.locator('#inAdd').scrollIntoViewIfNeeded(); await p.locator('#inAdd').tap()
// the visible confirmation: a toast
const toasts = new Set(); let toastPic = null
for (let i = 0; i < 30; i++) {
  await p.waitForTimeout(100)
  const t = [(await p.getByText(/^Input added/i).first().isVisible().catch(() => false)) ? 'Input added' : '', (await p.locator('#savestat:visible, .savestat:visible').allInnerTexts().catch(() => [])).join('').trim()].filter(Boolean).join(' + ')
  if (t) { toasts.add(t); if (!toastPic && /added|saved/i.test(t)) toastPic = await shot(p, '22-phone-save-toast') }
}
const toast = [...toasts].join(' > ')
await p.waitForTimeout(500)
// oil question for a weekday? none (Tue 4 Aug). any sheet?
if (await p.locator('[data-testid="oilconf"]').count()) { await p.keyboard.press('Escape') }
const added = await rec(p, { remarks: 'ZR august event' })
logs.push('added: ' + JSON.stringify(added && [added.type, added.date, added.person]) + ' toast: ' + toast)
l = await read(); const f1 = flat(l); logs.push('after add: ' + JSON.stringify(f1.map(c => `${c.who} ${c.kind}@${c.day}`)))
pics.push(await snap('22-phone-after-add'))
const sab = f1.filter(c => c.who === 'Saber' && c.kind === 'Event')
if (!added) probs.push('the August event was not saved')
if (sab.length !== 1) probs.push(`the saved August card appears ${sab.length} times after the save`)
else if (!/4 Aug/i.test(sab[0].day)) probs.push(`the saved card stands under "${sab[0].day}", not its August heading`)
if (!/added|saved/i.test(toast)) probs.push('no visible save confirmation seen; the toasts were: ' + toast)
if (toastPic) pics.push(toastPic)
// scroll to the card itself for the picture
if (sab.length) { await p.locator(`#inList [data-testid="inl-row-${sab[0].iid}"]`).scrollIntoViewIfNeeded(); pics.push(await shot(p, '22-phone-added-card')) }
// change a filter: the exception ends and the card disappears
await p.selectOption('#inFType', 'all'); await p.waitForTimeout(300); await p.selectOption('#inFType', 'LL'); await p.waitForTimeout(500)
l = await read(); const f2 = flat(l); logs.push('after changing the type filter away and back: ' + JSON.stringify(f2.map(c => `${c.who} ${c.kind}@${c.day}`)))
if (f2.some(c => c.who === 'Saber' && c.kind === 'Event')) probs.push('after a filter change the August Saber Event still shows although it does not match Ranger + LL')
pics.push(await snap('22-phone-after-filter-change'))
// ---- part 2: a shared entry gains an alphabetically earlier person; no two copies
await p.selectOption('#inFType', 'Meeting'); await p.waitForTimeout(400)
l = await read(); const m0 = flat(l).filter(c => c.title === 'ZR shared meeting'); logs.push('Meeting filter, before: ' + JSON.stringify(m0.map(c => c.who)))
const card = p.locator('#inList [data-testid^="inl-row-"]').filter({ hasText: 'ZR shared meeting' }).first()
await card.scrollIntoViewIfNeeded(); await card.tap(); await p.locator(WIN).waitFor()
const anv = p.locator(`${WIN} [data-pp="${await csId(p, 'Anvil')}"]`); await anv.scrollIntoViewIfNeeded(); await anv.tap()
await saveWin(p, T, 'no')
await p.waitForTimeout(500)
l = await read(); const m1 = flat(l).filter(c => c.title === 'ZR shared meeting'); logs.push('after adding Anvil: ' + JSON.stringify(m1.map(c => c.who + '@' + c.day)))
pics.push(await snap('22-phone-after-anvil'))
if (m1.length !== 1) probs.push(`after adding Anvil the shared meeting appears ${m1.length} times`)
else if (m1[0].who !== 'Anvil, Ranger, Saber') probs.push(`the shared card names "${m1[0].who}"`)
// a filter that hides it: Saber + LL, then add Anvil... (already included). also with Search that hides after the save
await p.selectOption('#inFType', 'LL'); await p.waitForTimeout(400)
l = await read(); logs.push('LL filter again: ' + JSON.stringify(flat(l).map(c => c.who + ' ' + c.kind)))
if (flat(l).some(c => c.title === 'ZR shared meeting')) probs.push('the shared meeting still shows under Ranger + LL')
// undo / redo (main save = the add of the shared person? press once each)
await press(T, p.locator('#undoBtn')); await p.waitForTimeout(500)
const afterU = await recAll(p, { title: 'ZR shared meeting' })
await press(T, p.locator('#redoBtn')); await p.waitForTimeout(500)
const afterR = await recAll(p, { title: 'ZR shared meeting' })
logs.push(`Undo: shared meeting records ${afterU.length}; Redo: ${afterR.length}`)
if (afterU.length !== 2 || afterR.length !== 3) probs.push(`Undo/Redo of adding Anvil: ${afterU.length} then ${afterR.length} records (wanted 2 then 3)`)
judge(22, 'phone 390', 'admin', probs.length ? 'FAIL' : 'PASS', probs.join(' | ') || logs.join(' ## '), pics)
console.log(logs.join('\n'))
await ctx.close()
await browser.close()
saveRows('s22')
console.log('ERRS', JSON.stringify(errs))
