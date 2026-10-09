// S55 — weekdays, Off days and a weekend with no Leave War period stay distinct (admin and member, desktop).
import { closeWins, world, closeAll, toInputs, openNew, openDay, fileInput, setTimes, pic, T, oilAnswer, sleep, readInputs, observe, declareHoliday, switchUser, toMonth } from './aa-A-lib.mjs'
const w = await world({ who: 'ad', size: 'd' })
const page = w.page
await toInputs(page)
async function tryFile(iso, ph, rm, label) {
  await openNew(page, iso)
  await page.selectOption('#inpEditType', 'Event'); await page.selectOption('#inpEditPerson', ph)
  const ad = page.locator('#inpEditAllday'); if (await ad.isChecked()) await ad.uncheck()
  await setTimes(page, '09:00', '12:00'); await page.fill('#inpEditRmk', rm)
  await page.locator('#inpEditSave').click(); await sleep(700)
  const q = await page.locator(T('oilconf')).isVisible().catch(() => false)
  const qtext = q ? (await page.locator(T('oilconf')).innerText()).replace(/\s+/g, ' ').slice(0, 500) : ''
  const ob = await observe(page)
  const rec = (await readInputs(page, rm))[0]
  console.log(label, '| OIL question:', q, '|', qtext, '| saved:', !!rec, '| oil:', JSON.stringify(rec?.oil), '| messages:', JSON.stringify(ob.msgs.filter(m => !/^⠿/.test(m)).slice(0, 3)))
  await pic(page, `s55-${label.replace(/\W+/g, '_').slice(0, 40)}`)
  return { q, qtext, rec }
}
// 1. ordinary weekday
await tryFile('2026-07-14', 'allavail', 'walkS55 weekday', 'weekday Tue 14 Jul')
await closeWins(page)
// 2. weekday marked Off day
console.log('declare Off day Thu 16 Jul:', await declareHoliday(page, '2026-07-16', 'off', 'Walk Off'))
await toMonth(page, 2026, 6)
await tryFile('2026-07-16', 'allavail', 'walkS55 offday', 'Off day Thu 16 Jul')
await closeWins(page)
// 3. weekend in a year with no Leave War period
await toMonth(page, 2027, 0)
const r3 = await tryFile('2027-01-02', 'allavail', 'walkS55 nowar', 'Sat 2 Jan 2027 (no period)')
const body = await page.evaluate(() => [...document.querySelectorAll('[data-testid="oilconf"], .airpop, [data-testid^="win-"]')].filter(e => e.offsetParent).map(e => e.innerText.replace(/\s+/g, ' ').slice(0, 500)).join(' || '))
console.log('screen after the 2027 weekend save:', body)
const createBtn = page.getByRole('button', { name: /Create the 2027 period/i })
console.log('admin sees a "Create the 2027 period" route:', await createBtn.count())
if (r3.q) { await page.locator(T('oil-yes')).click().catch(() => {}); await sleep(200); await pic(page, 's55-2027-question-yes') }
// member
await w.ctx.close()
const m = await world({ who: 'us', size: 'd' })
const mp = m.page
await toInputs(mp)
await toMonth(mp, 2027, 0)
await openNew(mp, '2027-01-09')
await mp.selectOption('#inpEditType', 'Event'); await mp.selectOption('#inpEditPerson', 'allavail')
{ const ad = mp.locator('#inpEditAllday'); if (await ad.isChecked()) await ad.uncheck() }
await setTimes(mp, '09:00', '12:00'); await mp.fill('#inpEditRmk', 'walkS55 member nowar')
await mp.locator('#inpEditSave').click(); await sleep(800)
const mq = await mp.locator(T('oilconf')).isVisible().catch(() => false)
console.log('MEMBER Sat 9 Jan 2027: OIL question', mq, '| screen:', await mp.evaluate(() => [...document.querySelectorAll('[data-testid="oilconf"], .airpop, [data-testid^="win-"]')].filter(e => e.offsetParent).map(e => e.innerText.replace(/\s+/g, ' ').slice(0, 500)).join(' || ')))
console.log('member sees a Create route:', await mp.getByRole('button', { name: /Create the 2027 period/i }).count())
await pic(mp, 's55-member-2027')
console.log('errs', JSON.stringify(m.errs), JSON.stringify(w.errs))
await closeAll()
