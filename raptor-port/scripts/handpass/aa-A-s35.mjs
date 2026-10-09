// S35 — the three person filters (Everyone / ALL / ALL AVAIL) in the List, the month and the opened day. Admin then member.
import { closeWins, world, closeAll, toInputs, fileInput, pic, T, sleep, listAll, listSearch, openDay, setPerson, ensureFilters, switchUser } from './aa-A-lib.mjs'
const ISO = '2026-07-16'
const out = []
const listNames = async page => page.evaluate(() => [...document.querySelectorAll('tr[data-iid]')].filter(r => /walkS35/.test(r.innerText)).map(r => r.querySelector('td')?.innerText.trim()))
const monthBars = async page => page.evaluate(() => [...document.querySelectorAll('#inpCal .ib-bar')].filter(b => /ALL|Ace/.test(b.innerText) && /16 Jul/.test(b.title)).map(b => b.innerText.trim()))
const dayRows = async page => page.evaluate(() => [...document.querySelectorAll('[data-testid="win-inputsday"] [data-iid]')].map(r => r.innerText.replace(/\s+/g, ' ').slice(0, 60)).filter(t => /walkS35/.test(t)))
const summary = async page => page.locator('#inFilterSummary').innerText().then(t => t.replace(/\s+/g, ' ')).catch(() => null)
for (const role of ['ad', 'us']) {
  const w = await world({ who: role, size: 'd' })
  const page = w.page
  await toInputs(page)
  if (role === 'ad') {
    await fileInput(page, { iso: ISO, type: 'Duty', person: 'all', remarks: 'walkS35 ALL', start: '09:00', end: '12:00' })
    await fileInput(page, { iso: ISO, type: 'Duty', person: 'allavail', remarks: 'walkS35 ALLAVAIL', start: '09:00', end: '12:00' })
    await fileInput(page, { iso: ISO, type: 'Duty', person: 'dj', remarks: 'walkS35 ACE', start: '09:00', end: '12:00' })
  } else {
    // the member's list opens on his own inputs; the placeholder inputs are nobody's "mine"
    await fileInput(page, { iso: ISO, type: 'Duty', person: 'all', remarks: 'walkS35 ALL', start: '09:00', end: '12:00' })
    await fileInput(page, { iso: ISO, type: 'Duty', person: 'allavail', remarks: 'walkS35 ALLAVAIL', start: '09:00', end: '12:00' })
    await fileInput(page, { iso: ISO, type: 'Duty', person: 'bane', remarks: 'walkS35 OWN', start: '09:00', end: '12:00' })
  }
  await closeWins(page)
  // LIST
  await page.locator('#inListBtn').click(); await sleep(400)
  await listAll(page)
  console.log(role, 'LIST default person filter value:', await page.evaluate(() => document.querySelector('#inFPerson')?.value).catch(() => null))
  for (const v of ['all', 'ph:all', 'ph:allavail']) {
    await setPerson(page, v); await listSearch(page, 'walkS35')
    const names = await listNames(page); const sm = await summary(page)
    out.push({ role, view: 'list', filter: v, rows: names, summary: sm })
    console.log(role, 'LIST filter', v, '->', JSON.stringify(names), '| summary:', sm)
    await pic(page, `s35-${role}-list-${v.replace(':', '_')}`)
  }
  // Reset (Clear filters)
  await page.locator('#inFiltersClear').click().catch(() => {}); await sleep(400)
  console.log(role, 'after Clear filters: person =', await page.evaluate(() => document.querySelector('#inFPerson')?.value), '| summary:', await summary(page))
  // MONTH
  await page.locator('#inCalBtn').click(); await sleep(500)
  for (const v of ['all', 'ph:all', 'ph:allavail']) {
    await setPerson(page, v)
    await page.locator('#inpCal').scrollIntoViewIfNeeded()
    const bars = await monthBars(page)
    out.push({ role, view: 'month', filter: v, bars })
    console.log(role, 'MONTH filter', v, '->', JSON.stringify(bars))
    await pic(page, `s35-${role}-month-${v.replace(':', '_')}`)
  }
  // OPENED DAY
  for (const v of ['all', 'ph:all', 'ph:allavail']) {
    await setPerson(page, v)
    await openDay(page, ISO)
    const rows = await dayRows(page)
    out.push({ role, view: 'day', filter: v, rows })
    console.log(role, 'DAY filter', v, '->', JSON.stringify(rows), '| day window text:', (await page.locator('[data-testid="win-inputsday"]').innerText().then(t => t.replace(/\s+/g, ' ').slice(0, 220)).catch(() => '')))
    await pic(page, `s35-${role}-day-${v.replace(':', '_')}`)
    await closeWins(page)
  }
  // a conflicting filter then a reveal / open-input: open the day with ALL selected, then Reset inside the day if offered
  await setPerson(page, 'ph:all'); await openDay(page, ISO)
  const hint = await page.locator('[data-testid="win-inputsday"]').innerText().then(t => t.replace(/\s+/g, ' ').slice(0, 300)).catch(() => '')
  console.log(role, 'day opened under the ALL filter says:', hint)
  console.log(role, 'errs', JSON.stringify(w.errs))
  await w.ctx.close()
}
await closeAll()
