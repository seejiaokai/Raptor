// Scenario 20 (and the panel's look for 23): the day panel, ‹ › across a month end, into the next period, a date no period covers.
// usage: node lw-m3-walk-c1.mjs <desk|phone> <chromium|webkit>
import * as L from './lw-m3-walk-c-lib.mjs'
const size = process.argv[2] || 'desk', engine = process.argv[3] || 'chromium'
const P = `s20-${size}-${engine}-`
console.log('lw-m3-walk-c1 v1', size, engine)
L.clearPrefix(P)
const w = await L.newCtx(size, engine)
await L.signIn(w, 'admin')
const { page } = w
const panel = async () => {
  const body = page.locator(L.T('lwday-body')).first()
  if (!(await body.count())) return null
  return {
    iso: await body.getAttribute('data-iso'),
    title: await L.txt(page, L.T('win-lwday') + ' .win-ttl'),
    text: (await body.innerText()).replace(/\n+/g, ' | '),
    figs: await page.$$eval('[data-testid^="lwday-fig-"]', es => es.map(e => e.className + ' ' + e.innerText.replace(/\s+/g, ' ').trim())),
    away: await page.$$eval('[data-testid^="lwday-away-"]:not([data-testid="lwday-away-h"])', es => es.map(e => e.innerText.replace(/\s+/g, ' ').trim())),
  }
}
const heading = iso => L.T('head-' + iso)
const open = async (iso, name) => {
  if (await L.vis(page, L.T('win-lwday-x'))) { await L.press(w, L.T('win-lwday-x')); await page.waitForTimeout(300) }
  const mon = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'][+iso.slice(5, 7) - 1]
  if (!(await page.locator(heading(iso)).count()) || w.phone) await L.gotoMonth(w, mon)
  const writes0 = await page.evaluate(() => 0)
  await L.press(w, heading(iso), w.phone ? { quick: P + name + '-tap' } : {})
  await page.waitForTimeout(500)
  await L.shot(w, P + name)
  return panel()
}
const step = async (dir, name) => {
  await L.press(w, L.T(dir === 1 ? 'lwday-next' : 'lwday-prev'), w.phone ? { quick: P + name + '-tap' } : {})
  await page.waitForTimeout(450)
  await L.shot(w, P + name)
  return panel()
}
const show = (label, p) => console.log(label, JSON.stringify(p))

const n0 = await L.nodes(page)
// A: panel on 15 Jul (many away)
let p = await open('2026-07-15', '01-jul15'); show('A open Jul 15', p)
const n1 = await L.nodes(page); console.log('nodes before/after panel open', n0, n1)
// step ‹ › inside July
p = await step(1, '02-jul16'); show('A › Jul 16', p)
p = await step(-1, '03-jul15-back'); show('A ‹ back', p)
// B: month end Oct 31 → Nov 1
p = await open('2026-10-30', '04-oct30'); show('B Oct 30', p)
p = await step(1, '05-oct31'); show('B › Oct 31', p)
p = await step(1, '06-nov01'); show('B › Nov 01', p)
p = await step(-1, '07-oct31-back'); show('B ‹ Oct 31', p)
// C: into the next period (Dec 30 -> Jan 1 27)
p = await open('2026-12-30', '08-dec30'); show('C Dec 30', p)
p = await step(1, '09-dec31'); show('C › Dec 31', p)
p = await step(1, '10-jan01-27'); show('C › Jan 01 27 (next period)', p)
p = await step(-1, '11-dec31-back'); show('C ‹ Dec 31', p)
// D: a date no period covers (Jan 2 26 ‹ ‹ → Dec 31 25)
p = await open('2026-01-02', '12-jan02'); show('D Jan 02', p)
p = await step(-1, '13-jan01'); show('D ‹ Jan 01', p)
p = await step(-1, '14-dec31-25'); show('D ‹ Dec 31 25 (no period)', p)
p = await step(-1, '15-dec30-25'); show('D ‹ Dec 30 25', p)
p = await step(1, '16-dec31-25-fwd'); p = await step(1, '17-jan01-26-fwd'); show('D › back to Jan 01 26', p)
console.log('errors', JSON.stringify(w.errs))
await L.closeBrowser()
