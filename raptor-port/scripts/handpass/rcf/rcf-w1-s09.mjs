/* rcf-w1 S09 — D1991: a published day keeps the B it went out with when "Brief before take-off" is raised. usage: node rcf-w1-s09.mjs [desktop|phone] */
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { writeFileSync } from 'node:fs'
const HERE = dirname(fileURLToPath(import.meta.url))
const KIND = process.argv[2] || 'desktop'
process.env.HP_URL ||= 'http://localhost:4291'
process.env.HP_SHOTS ||= resolve(HERE, '../../../docs/img/handpass/2026-11-12-rules-check-fixes/w1/s09-' + KIND + '-r1')
console.log('rcf-w1-s09 v1', KIND)
const X = await import('./rcf-w1-lib.mjs')
const { L, check, note, norm, sleep, RESULTS } = X
const w = await X.world(KIND)
const { page } = w
const P = w.phone ? 'p' : 'd'
const FRI = 4, SAT = 5
const ranger = w.ID('Ranger')

const setLogic = async (val) => {
  await L.go(page, 'logic'); await sleep(500)
  if (!(await page.locator('#lgBody input[data-lgset="briefLead"]:visible').count())) { await X.press(w, '#lgEdit'); await sleep(400) }
  const inp = page.locator('#lgBody input[data-lgset="briefLead"]').first()
  const before = await inp.inputValue()
  await inp.scrollIntoViewIfNeeded()
  if (val != null) { await inp.fill(String(val)); await inp.press('Tab'); await sleep(500) }
  const after = await inp.inputValue()
  await X.pic(page, `s09-logic-${val == null ? 'before' : 'set'}-${P}`, '#lgBody')
  return { before, after }
}
const state0 = await setLogic(null)
console.log('briefLead field before', JSON.stringify(state0))
const orig = state0.before

/* the fixture: Friday sortie landing 19:00 (debrief to 21:00), Saturday take-off 12:00, no In-time / R / B */
await L.board(page, FRI)
const gFri = await X.addWave(w, FRI, '')
await X.typeIn(w, `[data-bfld="ff:4.${gFri}.0.to"]`, '17:00'); await X.typeIn(w, `[data-bfld="ff:4.${gFri}.0.ld"]`, '19:00')
console.log('seat Fri', await X.seatPhoneAware(w, `[data-slot="4.${gFri}.0.0.p"]`, ranger))
await L.closeBoard(page)
await L.board(page, SAT)
const gSat = await X.addWave(w, SAT, '')
await X.typeIn(w, `[data-bfld="ff:5.${gSat}.0.to"]`, '12:00'); await X.typeIn(w, `[data-bfld="ff:5.${gSat}.0.ld"]`, '13:00')
console.log('seat Sat', await X.seatPhoneAware(w, `[data-slot="5.${gSat}.0.0.p"]`, ranger))
const bState = () => page.evaluate(g => { const x = window.DAYS[5].waves[g].formations[0]; return JSON.stringify({ to: x.to, br: x.br, rl: x.rl, it: x.it }) }, gSat)
const rowText = (root) => page.evaluate(([r]) => { const d = document.querySelector(r + ' .day[data-day="5"]'); return d ? [...d.querySelectorAll('.wave, .fm, tr, [class*="form"]')].filter(e => e.offsetWidth).map(e => e.innerText.replace(/\s+/g, ' ').trim()).filter(t => /12:00/.test(t)).slice(0, 3).join(' || ') : 'NO DAY' }, [root])
const restLines = async (items) => items.filter(t => /Ranger/.test(t) && /(rest|brief|turn)/i.test(t))
let bw = await X.boardWarn(page, w)
console.log('Sat data', await bState(), '\nSat warnings (default setting)', JSON.stringify(bw.items))
const restBefore = await restLines(bw.items)
await X.pic(page, `s09-0-board-before-${P}`)
const sp = await X.signAndPublish(w, SAT)
check('S09.1 Saturday published at the default setting', sp.p.pressed, JSON.stringify(sp.p) + ' tag ' + (sp.h && sp.h.tag))
await L.closeBoard(page)
const dataAfterPub = await page.evaluate(g => { const x = window.DAYS[5].waves[g].formations[0]; return JSON.stringify({ to: x.to, br: x.br }) }, gSat)
console.log('Sat B on the working copy after publish', dataAfterPub)

/* view-only before the change */
await L.go(page, 'viewsched'); await sleep(600)
const vBefore = (await X.stripItems(page, "#vWeek", SAT)).items
const vRowBefore = await rowText('#vWeek')
console.log('view-only before: warn', JSON.stringify(vBefore), '\n row', vRowBefore)
await X.pic(page, `s09-1-viewonly-before-${P}`, '#vWeek .day[data-day="5"]')

/* raise the setting */
const cur = String(orig).trim()
let target = '200'
if (/h/i.test(cur)) target = '3h20'
else if (/m/i.test(cur)) target = '200m'
const st = await setLogic(target)
note('S09.2 Logic "Brief before take-off" field', `was ${JSON.stringify(orig)} -> set ${JSON.stringify(target)}, read back ${JSON.stringify(st.after)}`)

await L.go(page, 'viewsched'); await sleep(700)
const vAfter = (await X.stripItems(page, "#vWeek", SAT)).items
const vRowAfter = await rowText('#vWeek')
console.log('view-only after: warn', JSON.stringify(vAfter), '\n row', vRowAfter)
await X.pic(page, `s09-2-viewonly-after-${P}`, '#vWeek .day[data-day="5"]')
check('S09.3 View-only Sched: no new crew-rest breach after the setting is raised (D1991)', JSON.stringify(vAfter.filter(t => /Ranger/.test(t))) === JSON.stringify(vBefore.filter(t => /Ranger/.test(t))), `before ${JSON.stringify(vBefore.filter(t => /Ranger/.test(t)))} after ${JSON.stringify(vAfter.filter(t => /Ranger/.test(t)))}`)
check('S09.4 View-only Sched: Saturday still prints the B it went out with', vRowAfter === vRowBefore && vRowAfter !== 'NO DAY', `before "${vRowBefore}" after "${vRowAfter}"`)

/* working copy */
await L.go(page, 'editsched'); await sleep(700)
const eAfter = (await X.stripItems(page, "#eWeek", SAT)).items
const eRow = await rowText('#eWeek')
console.log('working copy after: warn', JSON.stringify(eAfter), '\n row', eRow)
await X.pic(page, `s09-3-working-after-${P}`, '#eWeek .day[data-day="5"]')
note('S09.5 working copy after the raise — warnings for Ranger', JSON.stringify(eAfter.filter(t => /Ranger/.test(t))))
note('S09.5 working copy row', eRow)
check('S09.5 working copy judges by the new B (differs from the published face)', eRow !== vRowAfter || eAfter.filter(t => /Ranger/.test(t)).length !== vAfter.filter(t => /Ranger/.test(t)).length, `working "${eRow}" vs view-only "${vRowAfter}"`)

/* restore the setting */
const rs = await setLogic(orig)
check('S09.6 setting restored', String(rs.after).trim() === cur, `now ${JSON.stringify(rs.after)} want ${JSON.stringify(orig)}`)
note('console errors', JSON.stringify(w.errors.slice(0, 6)))
writeFileSync(process.env.HP_SHOTS + '/results.json', JSON.stringify(RESULTS, null, 1))
console.log('=== ' + RESULTS.filter(r => r.ok === true).length + ' PASS ' + RESULTS.filter(r => r.ok === false).length + ' FAIL')
RESULTS.filter(r => r.ok === false).forEach(r => console.log('  FAIL', r.id, r.detail))
await w.browser.close()
