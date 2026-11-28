/* Picture set 2 — the OIL list's foot line (D2800: Later = "not my call"; each next sign-off asks again until someone
   answers). The real list, opened by a real sign-off pick; only the foot's quiet words are replaced, for the picture.

   The day: Fri 17 Jul. The demo week has no weekend day with an unanswered OIL question, and a Duty filed on a
   weekend must answer the question before Add — so, by the app's own controls: the admin (Saber) files a Duty for
   himself on Fri 17 Jul (a working day, so nothing is asked), then declares Fri 17 Jul a public holiday on the Inputs
   page's settings. That day then has two unanswered OIL questions: the demo's own Nomad OD, and Saber's Duty.
   (A member's own Duty was tried first: the demo's member, Ranger, moves to 149 on 16 Jul, so his Duty stands on 149's
   list, not 142's.) */
import { open, go, sleep, L, press, sign, signVals, shot, mark, unmark } from './draw-lib.mjs'
import { toInputs, openNew, setTimes, switchUser, T } from 'file:///C:/Users/User/projects/Raptor-endtime/raptor-port/scripts/handpass/aa-A-lib.mjs'
const dev = process.argv[2] || 'D'
const ISO = '2026-07-17', DI = 4
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']

async function holiday(page, iso, name) {
  const [y, m] = iso.split('-').map(Number)
  await page.locator('#inGear').click(); await sleep(500)
  await page.locator(T('iset-days')).click(); await sleep(800)
  if (!(await page.locator(T('hol-add')).isVisible().catch(() => false))) { await page.locator(T('days-tab-holidays')).click(); await sleep(500) }
  await page.locator(T('hol-add')).click(); await sleep(600)
  await page.locator(T('hol-kind-ph')).click()
  await page.locator(T('hol-name')).fill(name)
  for (let i = 0; i < 24; i++) {
    const [mn, yy] = (await page.locator(T('holcal-title')).innerText()).trim().toLowerCase().split(/\s+/)
    const d = y * 12 + (m - 1) - (+yy * 12 + MONTHS.findIndex(x => x.startsWith(mn)))
    if (!d) break
    await page.locator(T(d > 0 ? 'holcal-next' : 'holcal-prev')).click(); await sleep(150)
  }
  const day = page.locator(T('holcal-day-' + iso))
  await day.click(); await sleep(200)
  let sel = await page.locator(T('holcal-selection')).innerText().catch(() => '')
  if (!/17/.test(sel)) { await day.click(); await sleep(200); sel = await page.locator(T('holcal-selection')).innerText().catch(() => '') }
  await page.locator(T('hol-save')).click(); await sleep(900)
  const oilWin = page.locator(T('win-oilday'))
  const atSave = await oilWin.isVisible().catch(() => false) ? (await oilWin.innerText()).replace(/\s+/g, ' ').slice(0, 300) : null
  if (atSave) { await oilWin.locator('.win-x').first().click(); await sleep(400) }
  for (const x of ['win-holiday-x', 'win-days-x']) { const b = page.locator(T(x)); if (await b.isVisible().catch(() => false)) { await b.click(); await sleep(300) } }
  const c = page.locator(T('iset-cancel')); if (await c.isVisible().catch(() => false)) { await c.click(); await sleep(300) }
  return { sel, atSave }
}

const { browser, page, errors } = await open(dev, 'a')
// leave the fresh-demo address at once: while it stands, a sign-out and in seeds the demo world afresh
await page.evaluate(() => history.replaceState(null, '', '/'))
// …and the first sign-out after a fresh demo still seeds it afresh (seen in a trial run): spend it before the world is made
await switchUser(page, 'ad')
await toInputs(page)
await openNew(page, ISO)
await page.selectOption('#inpEditType', 'Duty')
const ad = page.locator('#inpEditAllday')
if (await ad.count() && await ad.isChecked()) await ad.uncheck()
await setTimes(page, '09:00', '12:00')
await page.fill('#inpEditRmk', 'Range duty')
await page.locator('#inpEditSave').click(); await sleep(900)
L('duty filed; OIL asked?', await page.locator(T('oilconf')).isVisible().catch(() => false))
// the day's window stays open (on the phone it covers the gear): closed with its ✕
{ const dx = page.locator(`${T('win-inputsday')} .win-x`).first(); if (await dx.isVisible().catch(() => false)) { await dx.click(); await sleep(400) } }
await toInputs(page)
L('holiday', await holiday(page, ISO, 'Founders Day'))
await go(page, 'editsched')

const WIN = T('win-oilday'), FOOT = `${WIN} ${T('odl-left')}`
const oil = () => page.evaluate((W) => { const w = document.querySelector(W); if (!w || !w.getBoundingClientRect().height) return null; return w.innerText.replace(/\s+/g, ' ').slice(0, 300) }, WIN)
const footLook = () => page.evaluate((F) => {
  const e = document.querySelector(F); if (!e) return null
  const cs = getComputedStyle(e), r = e.getBoundingClientRect()
  return { text: e.textContent, font: cs.fontSize + ' ' + cs.fontWeight + ' ' + cs.fontFamily, color: cs.color, r: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)], scrollW: e.scrollWidth, clientW: e.clientWidth }
}, FOOT)
const held = () => page.evaluate((W) => document.querySelector(`${W} [data-testid="odl-held"] .v`)?.textContent.trim(), WIN)
/** Friday's own column brought to the left of the screen, the page at its top, so the day behind the list is the list's */
async function frameDay() {
  await page.evaluate((DI) => {
    const d = document.querySelector(`#eWeek .day[data-day="${DI}"]`)
    if (d) d.scrollIntoView({ inline: 'start', block: 'nearest' })
    scrollTo(0, 0)
    if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur()
  }, DI)
  /* the pointer off every control, so no box behind the list wears a hover edge in the picture */
  await page.mouse.move(2, 300)
  await sleep(400)
}
/** the foot's words replaced — for the picture only — then the marked picture */
async function drawFoot(name, words) {
  await frameDay()
  await page.evaluate(({ F, words }) => { document.querySelector(F).textContent = words }, { F: FOOT, words })
  await sleep(150)
  L(name, await footLook())
  await mark(page, FOOT, 5, true)
  await shot(page, name)
  await unmark(page)
}

// A, B and today: CUR CK picked, the list opens holding the name
await sign(page, DI, 'cur', 'dj'); await sleep(500)
L('list on CUR CK', await oil(), await signVals(page, DI))
const cs1 = await held()
await frameDay()
L('today foot', await footLook())
await shot(page, `oil-today-${dev}`)
await drawFoot(`oil-A-${dev}`, `Later: ${cs1} signs, and the next sign-off asks again`)
// B: one row picked (Yes), one left
const firstYes = page.locator(`${WIN} button[data-testid^="odl-yes-"]`).first()
await press(page, firstYes); await sleep(400)
L('one picked; today foot', await footLook(), await oil())
await drawFoot(`oil-B-${dev}`, 'Save: the next sign-off asks the rest')
// close with ✕ (nothing signed), then CUR CK again and Later: Ace signs
await press(page, page.locator(`${WIN} .win-x`).first()); await sleep(500)
await sign(page, DI, 'cur', 'dj'); await sleep(500)
await press(page, page.locator(`${WIN} button:visible`, { hasText: /^Later$/ }).first()); await sleep(600)
// SKED CK and PLANNED BY: today they sign at once after Later
await sign(page, DI, 'sked', 'shaft'); await sleep(300)
L('after SKED', await oil(), await signVals(page, DI))
await sign(page, DI, 'plan', 'glass'); await sleep(300)
L('after PLAN', await oil(), await signVals(page, DI))
// today Later is remembered only while he stays signed in: a sign-out and in makes the fourth box ask, as D2800 will
await switchUser(page, 'ad')
await go(page, 'editsched')
L('back in', await signVals(page, DI))
await sign(page, DI, 'appr', 'yeti'); await sleep(500)
L('list on APPROVED BY', await oil(), await signVals(page, DI))
const cs4 = await held()
await drawFoot(`oil-C1-${dev}`, `Later: ${cs4} signs, and OIL stays unanswered for now`)
await drawFoot(`oil-C2-${dev}`, `Later: ${cs4} signs, and the bell asks after publishing`)
L('errors', errors)
await browser.close()
