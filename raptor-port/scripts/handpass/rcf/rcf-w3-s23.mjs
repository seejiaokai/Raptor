/* rcf-w3 S23+S24 v2 — a flight with no landing typed and tomorrow's crew rest (D1990). Friday = the "Monday" of the
   scenario (Monday-Thursday carry demo conflicts), Saturday = "Tuesday". Ranger flies both.
   usage: RCF_RUN=s23-r2 node scripts/handpass/rcf/rcf-w3-s23.mjs */
const W = await import('./rcf-w3-lib.mjs')
const { L, say, check, nrm } = W
console.log('rcf-w3-s23 v2', W.SHOTS)
const { browser, page, errors } = await W.openWorld()
const FRI = 4, SAT = 5
const ranger = 'bane'

// Friday: a sortie take-off 19:30, landing blank, Ranger front seat
await L.board(page, FRI)
const wi = await W.addWave(page, FRI)
await W.setF(page, `ff:${FRI}.${wi}.0.to`, '19:30')
say('seat Ranger Friday:', await W.seat(page, `[data-slot="${FRI}.${wi}.0.0.p"]`, ranger))
say('Friday formation:', JSON.stringify(await page.evaluate(([d, w]) => { const f = window.DAYS[d].waves[w].formations[0]; return { to: f.to, ld: f.ld, p: window.PEOPLE[f.aircraft[0].p]?.cs } }, [FRI, wi])))
await L.shot(page, 'fri-sortie')

// Saturday: a sortie, B typed
await L.board(page, SAT)
const wj = await W.addWave(page, SAT)
await W.setF(page, `ff:${SAT}.${wj}.0.to`, '12:00')
await W.setF(page, `ff:${SAT}.${wj}.0.br`, '09:29')
say('seat Ranger Saturday:', await W.seat(page, `[data-slot="${SAT}.${wj}.0.0.p"]`, ranger))
await page.waitForTimeout(500)
say('Saturday formation:', JSON.stringify(await page.evaluate(([d, w]) => { const f = window.DAYS[d].waves[w].formations[0]; return { to: f.to, ld: f.ld, br: f.br, p: window.PEOPLE[f.aircraft[0].p]?.cs } }, [SAT, wj])))
let wt = await W.warnText(page)
say('Saturday warnings at B 09:29 (Friday landing blank):\n  ' + wt.join('\n  '))
check('S23 09:29 breaches crew rest', wt.some(l => /Crew rest breach/i.test(l)), wt.filter(l => /Crew rest/i.test(l)).join(' / '))
await L.shot(page, 'sat-0929-board')
const side = page.locator('#sbSide')
await L.shot(page, 'sat-0929-warning-crop', side)

// 09:30
await W.setF(page, `ff:${SAT}.${wj}.0.br`, '09:30'); await page.waitForTimeout(500)
wt = await W.warnText(page)
say('Saturday warnings at B 09:30:\n  ' + wt.join('\n  '))
check('S23 09:30 clears the crew-rest breach', !wt.some(l => /Crew rest breach/i.test(l)), wt.join(' / ').slice(0, 400))
say('RECORD at 09:30 the list also shows:', wt.filter(l => /Tight turn/i.test(l)).join(' / '))
await L.shot(page, 'sat-0930-board')
await L.shot(page, 'sat-0930-warning-crop', side)

// back to 09:29, then TBD landing on Friday
await W.setF(page, `ff:${SAT}.${wj}.0.br`, '09:29'); await page.waitForTimeout(300)
await L.board(page, FRI)
const lbox = page.locator(`#schedBoard [data-bfld="ff:${FRI}.${wi}.0.ld"]:visible`).first()
await lbox.scrollIntoViewIfNeeded(); await lbox.click(); await page.keyboard.type('TBD', { delay: 30 }); await page.keyboard.press('Enter')
await page.waitForTimeout(250)
const note = await page.evaluate(() => [...document.querySelectorAll('body *')].filter(e => e.children.length === 0 && e.offsetWidth > 0 && /is not a time/i.test(e.textContent || '')).map(e => e.textContent.trim()))
await L.shot(page, 'fri-tbd-refused')
const ldStored = await page.evaluate(([d, w]) => window.DAYS[d].waves[w].formations[0].ld, [FRI, wi])
say('RECORD typing TBD in the board landing box: the app said', JSON.stringify(note), '; box now', JSON.stringify(await lbox.inputValue()), '; stored', JSON.stringify(ldStored))
check('S23 TBD typed into the landing box', 'NOT WALKED', `the app refuses it: ${JSON.stringify(note)} — landing stays "${ldStored}"; TBD cannot be set through the board's box, so the blank landing is the case walked`)
// the edit week's box, if it has one
await L.closeBoard(page); await L.go(page, 'editsched')
const wkc = await page.locator(`#eWeek [data-txt="ff:${FRI}.${wi}.0.ld"]:visible`).count()
say('edit week landing boxes for the Friday wave:', wkc)
if (wkc) {
  const wk = page.locator(`#eWeek [data-txt="ff:${FRI}.${wi}.0.ld"]:visible`).first()
  await wk.scrollIntoViewIfNeeded(); await wk.click(); await page.keyboard.type('TBD', { delay: 30 }); await page.keyboard.press('Enter'); await page.waitForTimeout(400)
  say('RECORD week box after TBD: stored', JSON.stringify(await page.evaluate(([d, w]) => window.DAYS[d].waves[w].formations[0].ld, [FRI, wi])))
  await L.shot(page, 'week-after-tbd')
}
// Insights: Friday's hours for Ranger
await L.board(page, FRI)
const ins = page.locator('#schedBoard button:has-text("Insights"):visible').first()
await ins.click(); await page.waitForTimeout(900)
await L.shot(page, 'insights-open')
const itxt = nrm(await page.evaluate(() => document.body.innerText))
const k = itxt.indexOf('Ranger')
say('RECORD Insights text near Ranger:', k >= 0 ? itxt.slice(Math.max(0, k - 250), k + 450) : '(Ranger not named) ' + itxt.slice(0, 700))
check('S23 no console/page errors', errors.length === 0, errors.slice(0, 3).join(' | '))
await browser.close()
W.summary()
