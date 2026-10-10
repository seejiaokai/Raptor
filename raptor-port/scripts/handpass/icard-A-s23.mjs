import { launch, open, openDay, press, shot, cardFacts, toList, overflow, judge, saveRows, saveWin, csId, MONTHS, DAYWIN, WIN, rec, recAll, errs } from './icard-A-lib.mjs'
const browser = await launch()
const T = true
const { ctx, page: p } = await open(browser, { width: 390, height: 844 }, 'ad', 'a', T)
const probs = []; const pics = []; const logs = []
await toList(p, T)
if (!(await p.locator('#inFilters').isVisible())) { await p.locator('#inFiltersBtn').tap(); await p.waitForTimeout(250) }
const snap = async name => { await p.evaluate(() => { const e = document.querySelector('#inRangeBtn'); if (e) { e.scrollIntoView({ block: 'start' }); window.scrollBy(0, -110) } }); await p.waitForTimeout(250); return shot(p, name) }
const read = () => p.evaluate(() => {
  const out = []; let cur = null
  for (const e of document.querySelectorAll('#inList [data-testid="inl-day"], #inList [data-testid^="inl-row-"]')) {
    if (e.matches('[data-testid="inl-day"]')) { cur = { day: e.querySelector('b') ? e.querySelector('b').textContent.trim() : e.textContent, count: e.querySelector('i') ? e.querySelector('i').textContent.trim() : '', cards: [] }; out.push(cur) }
    else if (cur) cur.cards.push({ iid: e.getAttribute('data-iid') || e.getAttribute('data-popiid'), title: (e.querySelector('[data-testid="inl-title"]') || {}).textContent })
  }
  return out
})
const emptyBox = () => p.evaluate(() => { const e = document.querySelector('#inEmpty'); return e && e.offsetParent ? { text: e.innerText.replace(/\s+/g, ' ').trim(), btns: [...e.querySelectorAll('button')].map(b => b.id + '|' + b.textContent.trim()) } : null })
// 1. a word nothing contains
await p.fill('#inFSearch', 'qqzzxxnothing'); await p.waitForTimeout(500)
let e1 = await emptyBox(); let l = await read()
logs.push('nothing-word: ' + JSON.stringify(e1) + ' headings ' + l.length)
pics.push(await snap('23-phone-nothing-word'))
if (!e1 || !/No inputs match\./.test(e1.text)) probs.push('the nothing-word search does not say "No inputs match." — ' + JSON.stringify(e1))
if (l.length) probs.push('day headings remain with nothing matching')
// 2. isolate one input and delete it
await p.fill('#inFSearch', 'Sports afternoon'); await p.waitForTimeout(500)
l = await read(); logs.push('isolated: ' + JSON.stringify(l))
if (l.length !== 1 || l[0].cards.length !== 1 || l[0].count !== '1 input') probs.push('the isolated input is not one card under one heading with "1 input": ' + JSON.stringify(l))
pics.push(await snap('23-phone-isolated'))
const iid = l[0] && l[0].cards[0] && l[0].cards[0].iid
const card = p.locator(`#inList [data-testid="inl-row-${iid}"]`); await card.scrollIntoViewIfNeeded(); await card.tap(); await p.locator(WIN).waitFor()
await p.locator('#inpEditDel').scrollIntoViewIfNeeded(); await p.locator('#inpEditDel').tap(); await p.waitForTimeout(600)
if (await p.locator('[data-testid="inped-delall"]').count()) { logs.push('a delete question appeared'); await p.locator('[data-testid="inped-delall-yes"]').tap().catch(() => {}); await p.waitForTimeout(500) }
const gone = !(await rec(p, { iid }))
l = await read(); const e2 = await emptyBox()
logs.push('after delete: gone ' + gone + ' headings ' + l.length + ' empty ' + JSON.stringify(e2))
pics.push(await snap('23-phone-after-delete'))
if (!gone) probs.push('the input was not deleted')
if (l.some(d => !d.cards.length)) probs.push('an empty day heading remains after deleting the last card')
if (l.length) probs.push('headings remain: ' + JSON.stringify(l))
if (!e2 || !/No inputs match\./.test(e2.text)) probs.push('after the delete the list does not say "No inputs match." — ' + JSON.stringify(e2))
// 3. undo / redo
await press(T, p.locator('#undoBtn')); await p.waitForTimeout(600)
l = await read(); logs.push('after Undo: ' + JSON.stringify(l))
pics.push(await snap('23-phone-after-undo'))
if (l.length !== 1 || l[0].count !== '1 input' || l[0].cards.length !== 1) probs.push('Undo did not restore the card and its "1 input" count: ' + JSON.stringify(l))
await press(T, p.locator('#redoBtn')); await p.waitForTimeout(600)
l = await read(); const e3 = await emptyBox(); logs.push('after Redo: headings ' + l.length + ' ' + JSON.stringify(e3))
pics.push(await snap('23-phone-after-redo'))
if (l.length) probs.push('Redo did not remove the card: ' + JSON.stringify(l))
if (!(await rec(p, { iid }) === null)) probs.push('Redo left the record')
// 4. a restrictive date window: empty message names the window and offers All dates
await p.fill('#inFSearch', ''); await p.waitForTimeout(400)
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
await setRange('2026-08-10', '2026-08-12')
const e4 = await emptyBox(); l = await read()
logs.push('restrictive window: ' + JSON.stringify(e4) + ' headings ' + l.length + ' button ' + (await p.locator('#inRangeBtn').innerText()))
pics.push(await snap('23-phone-restrictive-window'))
if (!e4) probs.push('no empty message under a window with nothing in it')
else {
  if (!/Aug/.test(e4.text)) probs.push('the empty message does not name the window: ' + e4.text)
  if (!/All dates/i.test(e4.text)) probs.push('the empty message does not offer "All dates": ' + e4.text)
  else {
    logs.push('NOTE: the message offers All dates in words ("pick All dates"); it carries no button of its own (buttons in the message: ' + JSON.stringify(e4.btns) + ')')
    if (!(await p.locator('#inRangePop').isVisible().catch(() => false))) { await p.locator('#inRangeBtn').scrollIntoViewIfNeeded(); await p.locator('#inRangeBtn').tap(); await p.waitForTimeout(300) }
    const all = p.locator('#inRangeAll')
    if (!(await all.count())) probs.push('the date picker has no All dates button')
    else { await all.tap(); await p.waitForTimeout(500); l = await read(); logs.push('after All dates in the picker: headings ' + l.length); if (!l.length) probs.push('All dates showed nothing') }
  }
}
judge(23, 'phone 390', 'admin', probs.length ? 'FAIL' : 'PASS', probs.join(' | ') || logs.join(' ## '), pics)
console.log(logs.join('\n'))
await ctx.close()
await browser.close()
saveRows('s23')
console.log('ERRS', JSON.stringify(errs))
