// The read fixes' re-walk (13 Nov 26): new dates show the new list from its first request (the fresh code read's F2), and
// crossing the phone's width with the calendar open keeps the month browsed to (Astra's finding). Real window at 125%,
// real mouse wheel and clicks; the list placed by the wheel, never by script.
import * as C from './appr-a-common.mjs'
console.log('[appr-a-f7 v1]')
C.initLog('appr-a-f7-log.txt')
const { browser, page } = await C.launchReal125({ w: 1550, h: 917 })
const errs = []; C.watchErrors(page, errs)
await C.stageWorld(page)
const P = page, T = C.T
const setWin = await C.windowCtl(P)
const firstDates = () => P.evaluate(sel => [...document.querySelectorAll(`${sel} [data-testid^="appr-line-"] [data-testid="appr-dates"]`)].slice(0, 2).map(e => e.textContent.trim()), C.PAGE)

/* F7a — a chip: the list wheeled down, then a month chip, New, All — each shows its list from the first request */
await setWin(1550, 760)
/* each from a long list: the list it starts on is pressed first, then wheeled (v2: v1 wheeled New's three lines, which
   cannot scroll, before pressing All — a fault of the script, not the app) */
for (const [base, chip, label] of [['appr-all', 'appr-m-2026-02', 'Feb'], ['appr-all', 'appr-new', 'New'], ['appr-m-2026-02', 'appr-all', 'All']]) {
  await P.locator(T(base)).click(); await C.sleep(500)
  await C.wheelList(P, 260); const y0 = await C.listY(P)
  await C.shot(P, `f7-chip-${label}-0-wheeled`)
  await P.locator(T(chip)).click(); await C.sleep(600)
  const y1 = await C.listY(P); const room = await C.winRoom(P)
  await C.shot(P, `f7-chip-${label}-1-pressed`)
  C.check(`F7a-${label}`, y0 > 0 && y1 === 0 && room <= 0, `the list wheeled to ${y0}, then ${label} pressed: the list at ${y1} (its first request: ${(await firstDates())[0]}), window room ${room}`)
}
/* F7b — the period: the list wheeled down, then another period from View, then back — each from its first request */
await C.wheelList(P, 200); const yp = await C.listY(P)
const pick = P.locator(T('war-picker')).first()
const vals = await pick.evaluate(s => [...s.options].map(o => ({ v: o.value, t: o.textContent.trim(), sel: o.selected })))
const here = vals.find(o => o.sel), other = vals.find(o => !o.sel && !/New period/.test(o.t))
if (other) {
  await pick.selectOption(other.v); await C.sleep(900)
  const y2 = await C.listY(P); await C.shot(P, 'f7-period-1-other')
  await C.wheelList(P, 200).catch(() => {})
  await pick.selectOption(here.v); await C.sleep(900)
  const y3 = await C.listY(P); await C.shot(P, 'f7-period-2-back')
  C.check('F7b', yp > 0 && y2 === 0 && y3 === 0, `the list wheeled to ${yp}, then ${other.t} picked in View: the list at ${y2}; back to ${here.t}: the list at ${y3} (its first request: ${(await firstDates())[0]})`)
} else C.note('F7b: NOT RUN — no other period in the View list')

/* F7c — crossing 700 with the calendar open: browse two months on, narrow the window to a phone's width, widen it again */
await P.locator(T('lw-tab-approvals')).first().click(); await C.sleep(500)
await setWin(1000, 760)
if (!(await P.evaluate(() => !!document.querySelector('[data-testid="appr-range-picker"]')))) { await P.locator(T('appr-pick')).click(); await C.sleep(700) }
const title = () => P.evaluate(() => document.querySelector('[data-testid="appr-range-title"]')?.textContent?.trim() ?? null)
const t0 = await title()
for (let i = 0; i < 2; i++) { await P.locator(T('appr-range-next')).click(); await C.sleep(250) }
const t1 = await title(); await C.shot(P, 'f7-cross-0-wide-browsed')
await setWin(640, 760); await C.sleep(400)
const t2 = await title(); const ph = await P.evaluate(sel => document.querySelector(sel)?.classList.contains('ph'), C.PAGE)
await C.shot(P, 'f7-cross-1-phone-width')
await setWin(1000, 760); await C.sleep(400)
const t3 = await title(); await C.shot(P, 'f7-cross-2-wide-again')
C.check('F7c', t1 !== t0 && t2 === t1 && t3 === t1 && ph === true, `the calendar opened on ${t0}, browsed to ${t1}; at the phone's width (phone layout ${ph}) it shows ${t2}; wide again ${t3}`)
C.note('errors ' + JSON.stringify(errs)); C.check('F7-err', errs.length === 0, 'page errors: ' + (errs.join('|') || 'none'))
C.summary()
await Promise.race([browser.close(), C.sleep(8000)])
process.exit(0)
