import { launch, open, openDay, press, shot, cardFacts, toList, overflow, judge, saveRows, geom2, saveWin, csId, pickDates, dayHeads, DAYWIN, WIN, rec, recAll, errs } from './icard-A-lib.mjs'
const browser = await launch()

async function setup(p, T) {
  await openDay(p, '2026-07-20', T)
  // one all-day input for Anvil, 20-22 Jul
  await press(T, p.locator('#icPopAdd')); await p.locator(WIN).waitFor()
  await p.selectOption('#inpEditType', 'Duty'); await p.selectOption('#inpEditPerson', await csId(p, 'Anvil'))
  const ad = p.locator('#inpEditAllday'); if (!(await ad.isChecked())) await ad.check()
  await pickDates(p, T, '2026-07-20', '2026-07-22')
  const line = await p.locator(`${WIN} .rc-read`).innerText().catch(() => '')
  await saveWin(p, T, 'no')
  // a timed one over the same dates for Basher
  if (!(await p.locator(DAYWIN).count())) await openDay(p, '2026-07-20', T)
  await press(T, p.locator('#icPopAdd')); await p.locator(WIN).waitFor()
  await p.selectOption('#inpEditType', 'Duty'); await p.selectOption('#inpEditPerson', await csId(p, 'Basher'))
  await p.fill('#inpEditStart', '09:00'); await p.fill('#inpEditEnd', '10:30')
  await pickDates(p, T, '2026-07-20', '2026-07-22')
  await saveWin(p, T, 'no')
  const a = await rec(p, { type: 'Duty', person: await csId(p, 'Anvil') }), b = await rec(p, { type: 'Duty', person: await csId(p, 'Basher') })
  return { a, b, line }
}
async function days(p, T, a, b, label) {
  const out = {}; const probs = []; const pics = []
  for (const d of ['2026-07-20', '2026-07-21', '2026-07-22']) {
    await openDay(p, d, T); await p.waitForTimeout(400)
    const cards = await cardFacts(p, DAYWIN, 'idy')
    const ca = cards.find(c => c.iid === a.iid), cb = cards.find(c => c.iid === b.iid)
    pics.push(await shot(p, `12-${label}-day-${d.slice(8)}`))
    out[d] = { a: ca && ca.when, b: cb && cb.when }
    if (!ca) probs.push(`${d}: no card for the all-day input`); if (!cb) probs.push(`${d}: no card for the timed input`)
    if (d === '2026-07-22') {
      if (ca && !/^all day$/i.test(ca.when)) probs.push(`22 Jul all-day card says "${ca.when}"`)
      if (cb && !/^09:00–10:30$/.test(cb.when)) probs.push(`22 Jul timed card says "${cb.when}"`)
      for (const c of [ca, cb]) if (c && /till|→|2[3-9] Jul/i.test(c.when)) probs.push('final day shows a future end date: ' + c.when)
    }
  }
  return { out, probs, pics }
}
/* ===== DESKTOP */
{
  const { ctx, page: p } = await open(browser, { width: 1440, height: 900 }, 'ad', 'a', false)
  const { a, b, line } = await setup(p, false)
  console.log('records', JSON.stringify(a), JSON.stringify(b), 'line', line)
  const probs = []
  if (!a || a.date !== 'Jul 20' || a.endDate !== 'Jul 22') probs.push('all-day record dates ' + (a && a.date + '→' + a.endDate))
  if (!b || b.date !== 'Jul 20' || b.endDate !== 'Jul 22') probs.push('timed record dates ' + (b && b.date + '→' + b.endDate))
  const r = await days(p, false, a, b, 'desk')
  probs.push(...r.probs)
  // the table: one row each, start 20 Jul
  await toList(p, false)
  const trs = await p.evaluate(ids => ids.map(i => { const tr = document.querySelector(`#inBody tr[data-iid="${i}"]`); return tr ? tr.innerText.replace(/\s+/g, ' ') : null }), [a.iid, b.iid])
  console.log('table rows', JSON.stringify(trs))
  const rows = await p.evaluate(ids => ids.map(i => document.querySelectorAll(`#inBody tr[data-iid="${i}"]`).length), [a.iid, b.iid])
  if (rows.some(n => n !== 1)) probs.push('table rows per input ' + rows)
  const tpic = await shot(p, '12-desk-table')
  await p.locator('#undoBtn').click(); await p.waitForTimeout(400)
  const u = await recAll(p, { type: 'Duty', title: '' })
  await p.locator('#redoBtn').click(); await p.waitForTimeout(400)
  judge(12, 'desktop 1440', 'admin', probs.length ? 'FAIL' : 'PASS', probs.join(' | ') || `20/21/22 Jul each show both cards; ${JSON.stringify(r.out)}; table rows ${JSON.stringify(trs).slice(0, 220)}`, [...r.pics, tpic])
  await ctx.close()
}
/* ===== PHONE LIST (the list card of a several-day input is a phone-only thing) */
{
  const T = true
  const { ctx, page: p } = await open(browser, { width: 390, height: 844 }, 'ad', 'a', T)
  const { a, b } = await setup(p, T)
  await toList(p, T)
  const heads = await dayHeads(p)
  const cards = await cardFacts(p, '#inList', 'inl')
  const ca = cards.filter(c => c.iid === a.iid), cb = cards.filter(c => c.iid === b.iid)
  const under = await p.evaluate(ids => ids.map(i => { let e = document.querySelector(`#inList [data-testid="inl-row-${i}"]`); while (e && !e.matches('[data-testid="inl-day"]')) e = e.previousElementSibling; return e ? e.textContent.replace(/\s+/g, ' ') : null }), [a.iid, b.iid])
  const probs = []
  if (ca.length !== 1 || cb.length !== 1) probs.push(`cards in list: all-day ${ca.length}, timed ${cb.length}`)
  if (!/Mon 20 Jul/i.test(under[0] || '') || !/Mon 20 Jul/i.test(under[1] || '')) probs.push('headings ' + under.join(' / '))
  console.log('list corner all-day', ca[0] && ca[0].when, '| timed', cb[0] && cb[0].when, '| under', under)
  if (!ca[0] || !/till 22 Jul/.test(ca[0].when)) probs.push('all-day corner says "' + (ca[0] && ca[0].when) + '"')
  if (!cb[0] || !/till 22 Jul/.test(cb[0].when) || !/09:00–10:30/.test(cb[0].when)) probs.push('timed corner says "' + (cb[0] && cb[0].when) + '" (hours retained?)')
  await p.locator(`#inList [data-testid="inl-row-${a.iid}"]`).scrollIntoViewIfNeeded()
  const pic = await shot(p, '12-phone-list')
  const r = await days(p, T, a, b, 'phone')
  probs.push(...r.probs)
  judge('12 (extra: phone list + days)', 'phone 390', 'admin', probs.length ? 'FAIL' : 'PASS', probs.join(' | ') || `list: one card each under MON 20 JUL; corners "${ca[0].when}" / "${cb[0].when}"; days ${JSON.stringify(r.out)}`, [pic, ...r.pics])
  await ctx.close()
}
await browser.close()
saveRows('s12')
console.log('ERRS', JSON.stringify(errs))
