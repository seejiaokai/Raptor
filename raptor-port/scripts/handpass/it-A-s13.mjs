// Scenario 13 — shared dates and title together (admin, desktop): a shared Event 30-31 Jul "July session"; its window: range 31 Jul-1 Aug,
// "Summer session", plus a person.
import { launch, open, table, errs, people, shot, sleep, press, allRecs, closeAnyWin, win, norm, toCal, month, tapAt, gotoInputs } from './it-A-lib.mjs'
import { listDoor, sharedPen, setSeveral, pickDate, showAll, mateIds } from './it-A-doors.mjs'

const browser = await launch()
const T = table('s13')
const { ctx, page } = await open(browser, 'desk')
const say = []; let ok = true; const pics = []
const need = (c, m) => { if (!c) ok = false; say.push((c ? '' : 'MISSED: ') + m) }
const P = await people(page)
const nameOf = Object.fromEntries(Object.entries(P).map(([k, v]) => [v, k]))
try {
  // create through the List's Add form (the Calendar's "+ Input" window is one day; the List takes a range)
  const before = new Set((await allRecs(page)).map(r => r.iid))
  const L = listDoor()
  await L.openNew(page, { iso: '2026-07-30', person: P.Ranger, type: 'Event', st: '14:00', en: '15:00' })
  await pickDate(page, '2026-07-31')             // the second tap closes the range 30-31 Jul
  await setSeveral(page, [P.Ranger, P.Saber])
  await page.fill('#inTitle', 'July session')
  const rem0 = await page.inputValue('#inRemarks')
  await L.submit(page)
  const fx = (await allRecs(page)).filter(r => !before.has(r.iid))
  const grp = fx[0] && fx[0].grp
  need(fx.length === 2 && grp && fx.every(r => r.grp === grp && r.title === 'July session' && r.date === 'Jul 30' && r.endDate === 'Jul 31'), `created: ${fx.map(r => nameOf[r.person] + ' ' + r.date + '→' + r.endDate + ' "' + r.title + '" remark "' + r.remarks + '"').join(' | ')} (the form wrote "${rem0}" into Remarks)`)
  // open its window, change the dates, retitle, add a person
  await sharedPen.openSaved(page, fx[0])
  pics.push(await shot(page, 's13-1-window-before'))
  const cal = page.locator('#inpEdCal')
  need(await cal.count() > 0, 'the saved shared window has its own range calendar')
  // the first tap is the new start, the next the new end; the window's calendar shows July
  await press(page, cal.locator('[data-cal="2026-07-31"]'))
  if (!(await cal.locator('[data-cal="2026-08-01"]').count())) await press(page, cal.locator('button[aria-label="Next month"]'))
  await press(page, cal.locator('[data-cal="2026-08-01"]'))
  await page.fill('#inpEditTitle', 'Summer session')
  await setSeveral(page, [P.Ranger, P.Saber, P.Vapor])
  const read = norm(await page.locator('#inpEdCal').locator('xpath=..').locator('.rc-read').innerText().catch(() => ''))
  say.push(`the window's date line reads "${read}"`)
  pics.push(await shot(page, 's13-2-window-edited'))
  await press(page, page.locator('#inpEditSave')); await sleep(page, 700)
  const sv = page.locator('[data-testid="oilconf"]'); if (await sv.count()) { await press(page, sv.locator('[data-testid="oil-no"]')); await press(page, sv.locator('[data-testid="oilconf-save"]')); await sleep(page, 500) }
  const after = (await allRecs(page)).filter(r => r.grp === grp)
  need(after.length === 3 && after.every(r => r.title === 'Summer session' && r.date === 'Jul 31' && r.endDate === 'Aug 1'), `after the save: ${after.map(r => nameOf[r.person] + ' ' + r.date + '→' + r.endDate + ' "' + r.title + '"').join(' | ')}`)
  need(after.every(r => /till 1 Aug/.test(r.remarks || '') && !/session/i.test(r.remarks || '')), `remarks ${JSON.stringify(after.map(r => r.remarks))}: the generated till names the new last date and carries no title`)
  await closeAnyWin(page)
  // every covered day, in the month
  await gotoInputs(page); await toCal(page); await month(page, 2026, 7)
  const ids = (await mateIds(page, fx[0]))
  const barsOver = async days => page.evaluate(({ ids, days }) => {
    const bars = [...document.querySelectorAll('#inpCal .ib-bar')].filter(b => ids.includes(b.getAttribute('data-iid')))
    return Object.fromEntries(days.map(d => { const c = document.querySelector(`#inpCal [data-icday="${d}"]`); if (!c) return [d, null]; const r = c.getBoundingClientRect(); return [d, bars.filter(b => { const q = b.getBoundingClientRect(); return q.left < r.right - 2 && q.right > r.left + 2 && q.top < r.bottom && q.bottom > r.top }).map(b => b.textContent.replace(/\s+/g, ' ').trim())] }))
  }, { ids, days })
  const b1 = await barsOver(['2026-07-30', '2026-07-31'])
  say.push(`month bars over 30 Jul ${JSON.stringify(b1['2026-07-30'])}, over 31 Jul ${JSON.stringify(b1['2026-07-31'])}`)
  need(b1['2026-07-30'].length === 0 && b1['2026-07-31'].length === 1 && /Summer session/.test(b1['2026-07-31'][0]), 'the 30th no longer carries the entry and the 31st shows it under the new name')
  pics.push(await shot(page, 's13-3-month'))
  // the 1 Aug is in August
  await press(page, page.locator('#icNext')); await sleep(page, 300)
  const b2 = await barsOver(['2026-08-01'])
  need(b2['2026-08-01'] && b2['2026-08-01'].length === 1 && /Summer session/.test(b2['2026-08-01'][0]), `1 Aug carries ${JSON.stringify(b2['2026-08-01'])}`)
  await tapAt(page, page.locator('#inpCal [data-icday="2026-08-01"]'), { x: 8, y: 8 }); await sleep(page, 400)
  pics.push(await shot(page, 's13-4-1-aug-day'))
  // people through the List filter
  await closeAnyWin(page); await press(page, page.locator('#inListBtn')); await showAll(page)
  const rows = await page.evaluate(() => [...document.querySelectorAll('#inBody tr[data-iid]')].map(t => ({ n: t.children[0].textContent.trim(), d: t.querySelector('[data-label="Start"]').textContent.replace(/\s+/g, ' ').trim(), t: (t.querySelector('[data-testid="in-title"]') || {}).textContent })).filter(r => r.t === 'Summer session'))
  say.push(`List: ${JSON.stringify(rows)}`)
  need(rows.length === 1, `the List holds ONE entry "Summer session" (${rows.length})`)
  pics.push(await shot(page, 's13-5-list'))
} catch (e) { ok = false; say.push('SCRIPT ERROR ' + String(e.message).split('\n').slice(0, 5).join(' | ')); await shot(page, 's13-err').catch(() => {}) }
T.add({ n: 13, size: page.sizeName, role: 'admin', verdict: ok ? 'PASS' : 'FAIL', say: say.join(' · '), pics })
T.save()
await ctx.close(); await browser.close()
console.log('errors', JSON.stringify([...new Set(errs)].slice(0, 8)))
