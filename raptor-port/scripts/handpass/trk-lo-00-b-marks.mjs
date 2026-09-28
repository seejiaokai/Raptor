/* [TRK-LEFTOVERS] baseline — marks: B (N.A. with failures: does the Failures
   card still count them? w2 N1), C (a back-dated second failure: the chips'
   order and labels, and which one − takes back — w2 N2), F (a press on the
   other student's red failure tick — w2 N5), H (a "Done on" day in the
   future — w2 N7). Desktop 1440x900, admin, a fresh browser. Adapted from
   trk-w2-01-failures.mjs, trk-w2-05-rings.mjs and trk-w2-02-dates.mjs. */
import { open, shot, save, log, reveal, DESK } from './trk-lib.mjs'
import { sleep, tapBall, popOpen, popTitle, popFails, failCard, ticks, typeDate, pickFrom, currency } from './trk-w2-lib.mjs'

const L = log()
const { browser, page, errors } = await open({ size: DESK, who: 'a' })
const crew = () => page.locator('#activeSel option:checked').innerText()
const grade = async label => { await page.locator('#pop button', { hasText: new RegExp('^\\s*' + label + '\\s*$') }).first().click(); await sleep(500) }
L.note('crew roster', (await page.evaluate(() => [...document.querySelectorAll('#activeSel option')].map(o => o.textContent))).join(', ') + ' · picked ' + await crew())

/* ---- C. a failure today, then a second one back-dated ---- */
await tapBall(page, 'ST-02')
let pf = await popFails(page)
const today = pf.failOn
L.note('C.0 the pop-up for ST-02: "Failed on" opens on', today)
await page.click('#popFailPlus'); await sleep(400)
pf = await popFails(page)
L.note('C.1 after the first + (today)', JSON.stringify(pf.list) + ' count ' + pf.count)
const boxv = await typeDate(page, '#popFailDate', '2026-09-10')
await page.click('#popFailPlus'); await sleep(400)
pf = await popFails(page)
L.note('C.2 after typing 10/09/2026 in "Failed on" and + again: the pop-up list', JSON.stringify(pf.list) + ' count ' + pf.count + ' (box ' + boxv + ')')
await shot(page, 'lo-C-1-pop-two-fails')
let fc = await failCard(page)
L.note('C.3 the Failures card chips (text / tooltip)', JSON.stringify(fc.chips.map(c => [c.t, c.title])) + ' · ' + fc.total)
await page.keyboard.press('Escape'); await sleep(250)
await page.locator('#failsCard').scrollIntoViewIfNeeded()
await shot(page, 'lo-C-2-failcard-two', { el: '#failsCard' })
await tapBall(page, 'ST-02')
await page.click('#popFailMinus'); await sleep(400)
pf = await popFails(page)
L.note('C.4 − pressed once: the pop-up list left', JSON.stringify(pf.list) + ' count ' + pf.count)
await shot(page, 'lo-C-3-after-minus')
await page.keyboard.press('Escape'); await sleep(250)
fc = await failCard(page)
L.note('C.5 the Failures card after −', JSON.stringify(fc.chips.map(c => [c.t, c.title])) + ' · ' + fc.total)
await page.locator('#failsCard').scrollIntoViewIfNeeded()
await shot(page, 'lo-C-4-failcard-after-minus', { el: '#failsCard' })

/* ---- B. an event with failures marked N.A. ---- */
await tapBall(page, 'ACG-01')
await page.click('#popFailPlus'); await sleep(350); await page.click('#popFailPlus'); await sleep(350)
L.note('B.0 ACG-01: two failures recorded', JSON.stringify((await popFails(page)).list))
await page.keyboard.press('Escape'); await sleep(250)
const fcBefore = await failCard(page)
L.note('B.1 the Failures card before N.A.', JSON.stringify(fcBefore.chips.map(c => c.t)) + ' · ' + fcBefore.total)
await tapBall(page, 'ACG-01')
await page.locator('#pop button', { hasText: /^\s*N\.A\.\s*$/ }).first().click(); await sleep(500)
await page.keyboard.press('Escape').catch(() => {}); await sleep(250)
const tk = await ticks(page, 'ACG-01')
fc = await failCard(page)
await shot(page, 'lo-B-1-na-chart')
await page.locator('#failsCard').scrollIntoViewIfNeeded()
await shot(page, 'lo-B-2-na-failcard', { el: '#failsCard' })
L.note('B.2 ACG-01 marked N.A.: red ticks on the ball / the Failures card', `ticks ${tk} · chips ${JSON.stringify(fc.chips.map(c => c.t))} · ${fc.total}`)
L.ok('B.3 the Failures card no longer counts or lists ACG-01\'s failures once it is N.A.', !fc.chips.some(c => /^ACG-01/.test(c.t)), JSON.stringify(fc.chips.map(c => c.t)) + ' · ' + fc.total)
await page.locator('#failTitle').click(); await sleep(400)
const logRows = await page.evaluate(() => [...document.querySelectorAll('#failLog .frow')].map(r => r.innerText.replace(/\s+/g, ' ').trim()))
L.note('B.4 the full failures list (the card\'s title)', JSON.stringify(logRows))
await shot(page, 'lo-B-3-na-faillog')
await page.keyboard.press('Escape'); await sleep(250)

/* ---- F. a press on the OTHER student's red tick ---- */
await pickFrom(page, '#activeSel', /STUDENT B/)
await tapBall(page, 'BFM-3'); await page.click('#popFailPlus'); await sleep(400); await page.keyboard.press('Escape'); await sleep(250)
L.note('F.0 STUDENT B: one failure on BFM-3', 'ticks ' + await ticks(page, 'BFM-3'))
await pickFrom(page, '#activeSel', /STUDENT A/)
await reveal(page, 'BFM-3'); await sleep(250)
const tick = await page.evaluate(() => {
  const g = [...document.querySelectorAll('#flowSvg .ball')].find(x => x.dataset.id === 'BFM-3'); const l = g && g.querySelector('line.ftick'); if (!l) return null
  const r = l.getBoundingClientRect(); const x = r.left + r.width / 2, y = r.top + r.height / 2; const hit = document.elementFromPoint(x, y)
  return { x: Math.round(x), y: Math.round(y), hit: hit ? hit.tagName + (hit.getAttribute('class') ? '.' + hit.getAttribute('class') : '') + (hit.dataset && hit.dataset.wi != null ? '[wi=' + hit.dataset.wi + ']' : '') : null }
})
await page.locator('#flowSvg .ball[data-id="BFM-3"]').first().screenshot({ path: (await import('node:path')).resolve(process.env.HP_SHOTS, 'lo-F-0-bfm3-zoom.png') })
if (tick) {
  await page.mouse.click(tick.x, tick.y); await sleep(450)
  const opened = await popOpen(page)
  const said = opened ? 'opened grading: "' + await popTitle(page) + '"; crew box still ' + await crew() : 'no pop-up; crew box now ' + await crew()
  L.note('F.1 STUDENT A picked, a press on B\'s red tick on BFM-3 (hits ' + tick.hit + ' at ' + tick.x + ',' + tick.y + ')', said)
  L.ok('F.2 the press picks STUDENT B (does not open grading for A)', !opened && /STUDENT B/.test(await crew()), said)
  await shot(page, 'lo-F-1-press-on-tick')
  await page.keyboard.press('Escape'); await sleep(250)
} else L.note('F.1 no tick drawn on BFM-3', String(await ticks(page, 'BFM-3')))

/* ---- H. a "Done on" day in the future ---- */
await pickFrom(page, '#activeSel', /STUDENT A/)
const tmr = await page.evaluate(t => { const d = new Date(t + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + 1); return d.toISOString().slice(0, 10) }, today)
const cur0 = await currency(page)
L.note('H.0 the Currency card before (today ' + today + ')', JSON.stringify(cur0))
await tapBall(page, 'TR-2')
L.note('H.1 TR-2 pop-up opened', await popTitle(page) + ' · Done on box ' + (await popFails(page)).doneOn)
const dv = await typeDate(page, '#popDoneDate', tmr)
L.note('H.2 typed tomorrow (' + tmr + ') into "Done on"', 'box reads ' + dv)
await shot(page, 'lo-H-1-done-on-tomorrow')
await grade('DCO')
await page.keyboard.press('Escape').catch(() => {}); await sleep(300)
await tapBall(page, 'TR-2')
const pf2 = await popFails(page)
L.note('H.3 TR-2 reopened after DCO', 'Done on ' + pf2.doneOn + ' · caption "' + pf2.caption + '" · title ' + await popTitle(page))
await page.keyboard.press('Escape'); await sleep(250)
const cur1 = await currency(page)
L.note('H.4 the Currency card after', JSON.stringify(cur1))
L.ok('H.5 a future "Done on" is refused (the flight is not dated tomorrow)', pf2.doneOn !== tmr, 'Done on ' + pf2.doneOn + ' · Last Flown ' + cur1.lastSyll + ' / ' + cur1.lastCurr + ' · ' + cur1.kv.join(' | '))
await page.locator('.c-curr').scrollIntoViewIfNeeded()
await shot(page, 'lo-H-2-currency-card', { el: '.c-curr' })
await shot(page, 'lo-H-3-page')

save('lo-B-marks', { rows: L.rows, errors })
console.log('errors', JSON.stringify(errors))
await browser.close()
