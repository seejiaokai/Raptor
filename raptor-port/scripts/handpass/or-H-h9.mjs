import { launch, open, fileInput, openFromList, describeWin, shot, WIN, toastMark, toastsSince, save, errs, as, badgeText, drag } from './or-H-lib.mjs'
const out = {}
const log = (k, v) => { out[k] = v; console.log('## ' + k + ' ' + JSON.stringify(v)) }
const browser = await launch()
/* world opened with the clock three weeks before the week so the first Meeting is filed ON TIME; then the clock is moved to the PC's own date */
const { ctx, page } = await open(browser)
const who = iid => page.evaluate(i => { const r = window.INPUTS.find(x => x.iid === i); return r ? { people: r.people.map(e => (window.PEOPLE[e.p]?.cs || e.p) + (e.late ? '(late)' : '')), late: r.late || null, lateKeys: Object.keys(r).filter(k => /late/i.test(k)), peopleKeys: Object.keys(r.people[0]) } : null }, iid)
const lateRead = (title) => page.evaluate(t => {
  const lateEls = root => [...root.querySelectorAll('*')].filter(e => e.getClientRects().length && (/late/i.test(String(e.className)) || /^late$/i.test((e.textContent || '').trim()))).map(e => String(e.className).slice(0, 40) + '|' + (e.textContent || '').trim().slice(0, 30) + '|in:' + ((e.closest('[data-person]') || {}).getAttribute?.('data-person') || '-'))
  const out = {}
  const listRow = [...document.querySelectorAll('[data-iid], [data-listiid]')].find(e => e.innerText.includes(t))
  out.listRow = listRow ? { text: listRow.innerText.replace(/\s+/g, ' ').slice(0, 160), late: lateEls(listRow) } : null
  const rows = [...document.querySelectorAll('#eWeek .pl-row')].filter(r => (r.querySelector('.nm .ntx')?.textContent || '').trim().toLowerCase() === t.toLowerCase())
  out.weekRows = rows.map(r => ({ text: r.innerText.replace(/\s+/g, ' ').slice(0, 160), late: lateEls(r) }))
  const card = document.querySelector('[data-testid="win-inputsday"]')
  out.card = card ? { late: lateEls(card), text: [...card.querySelectorAll('.icard')].filter(c => c.innerText.includes(t)).map(c => c.innerText.replace(/\s+/g, ' ').slice(0, 160)) } : null
  return out
}, title)
const MON = ['january','february','march','april','may','june','july','august','september','october','november','december']
async function readAll(tag, title, iso, di) {
  const res = {}
  await page.evaluate(() => window.go('inputs')); await page.waitForTimeout(300)
  if (await page.locator('#inListBtn[aria-pressed="false"]').count()) { await page.locator('#inListBtn').click(); await page.waitForTimeout(300) }
  await page.locator('#inRangeBtn').click().catch(() => {}); await page.locator('#inRangeAll').click().catch(() => {}); await page.waitForTimeout(400)
  res.list = (await lateRead(title)).listRow
  await shot(page, 'H9-' + tag + '-list')
  await page.locator('#inCalBtn').click(); await page.waitForTimeout(300)
  for (let i = 0; i < 12 && !(await page.locator(`[data-icday="${iso}"]`).count()); i++) {
    const [mn, yr] = (await page.locator('#inpCal .ic-mon').textContent()).trim().toLowerCase().split(/\s+/)
    const at = +yr * 12 + MON.findIndex(x => x.startsWith(mn))
    await page.locator(at < +iso.slice(0, 4) * 12 + (+iso.slice(5, 7) - 1) ? '#icNext' : '#icPrev').click(); await page.waitForTimeout(200)
  }
  await page.locator(`[data-icday="${iso}"]`).focus(); await page.keyboard.press('Enter'); await page.waitForSelector('[data-testid="win-inputsday"]'); await page.waitForTimeout(300)
  res.card = (await lateRead(title)).card
  await shot(page, 'H9-' + tag + '-card')
  await page.locator('[data-testid="win-inputsday-x"]').click().catch(() => {})
  await page.evaluate(() => window.go('editsched')); await page.locator('#eWeek .day').first().waitFor()
  const day = page.locator('#eWeek .day:not(.peek)').nth(di); await day.scrollIntoViewIfNeeded()
  await day.locator('.sec-grnd .pl-row', { hasText: title }).first().scrollIntoViewIfNeeded()
  res.week = (await lateRead(title)).weekRows
  await shot(page, 'H9-' + tag + '-week')
  log('read-' + tag, res)
  return res
}
await as(page, 'Saber')
const r1 = await fileInput(page, { type: 'Meeting', people: ['Ranger', 'Hex'], from: '2026-07-15', to: '2026-07-15', timed: ['14:00', '15:00'], title: 'Ontime meet' })
const iid = r1[0].iid
log('filed-on-time', await who(iid))
const r0 = await fileInput(page, { type: 'Meeting', people: ['Ranger', 'Hex'], from: '2026-07-17', to: '2026-07-17', timed: ['14:00', '15:00'], title: 'Sched meet' })
await readAll('1-ontime-before', 'Ontime meet', '2026-07-15', 2)
await page.clock.setFixedTime(new Date('2026-10-12T09:00:00')); await page.waitForTimeout(300)
await openFromList(page, iid)
await page.locator(`${WIN} [data-pp]`, { hasText: 'Tally' }).first().click(); await page.waitForTimeout(250)
await page.locator('#inpEditSave').click(); await page.waitForTimeout(800)
log('after-add-in-window', await who(iid))
await readAll('2-after-window-add', 'Ontime meet', '2026-07-15', 2)
const day = page.locator('#eWeek .day:not(.peek)').nth(2)
const row = day.locator('.sec-grnd .pl-row', { hasText: 'Ontime meet' }).first()
const anvilId = await page.evaluate(() => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === 'Anvil'))
const anvil = page.locator('#eRoster .rpuck[data-person="' + anvilId + '"]:visible').first()
const m = await toastMark(page)
await anvil.scrollIntoViewIfNeeded().catch(() => {})
await drag(page, anvil, row.getByText('+ add').first())
log('after-schedule-add', { toast: await toastsSince(page, m), inputs: await who(iid) })
await readAll('3-after-schedule-add', 'Ontime meet', '2026-07-15', 2)
/* an on-time input that gets a man from the SCHEDULE only, at the PC's date */
{
  await page.evaluate(() => window.go('editsched')); await page.locator('#eWeek .day').first().waitFor()
  const d4 = page.locator('#eWeek .day:not(.peek)').nth(4); await d4.scrollIntoViewIfNeeded()
  const row4 = d4.locator('.sec-grnd .pl-row', { hasText: 'Sched meet' }).first(); await row4.scrollIntoViewIfNeeded()
  log('sched-only-before', (await lateRead('Sched meet')).weekRows)
  const id2 = await page.evaluate(() => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === 'Blade'))
  const bl = page.locator('#eRoster .rpuck[data-person="' + id2 + '"]:visible').first()
  const m2 = await toastMark(page); await bl.scrollIntoViewIfNeeded().catch(() => {})
  await drag(page, bl, row4.getByText('+ add').first())
  log('sched-only-after', { toast: await toastsSince(page, m2), week: (await lateRead('Sched meet')).weekRows })
  await shot(page, 'H9-3b-schedule-only-add')
}
const r2 = await fileInput(page, { type: 'Meeting', people: ['Ranger', 'Hex'], from: '2026-07-16', to: '2026-07-16', timed: ['14:00', '15:00'], title: 'Late meet' })
log('filed-late', await who(r2[0].iid))
await readAll('4-filed-late', 'Late meet', '2026-07-16', 3)
log('errors', errs)
save('H9', out)
await browser.close()
