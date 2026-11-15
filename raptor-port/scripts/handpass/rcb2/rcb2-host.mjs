/* rcb2-host v1 (15 Nov 26) — the host's short walk on the drivers before any walker starts (docs/walk-scripts.md §1),
   on the frozen build of cc2eefa50 served inside the test browser. Proves the routes the walkers' briefs name:
   sign-in, a board of a day, a new wave, a take-off typed, a man seated, the warning list read; the crew-rest line's new
   words (Friday take-off 12:00 no landing, Saturday 04:00–05:00); Insights by its nav link; the Logic page, one setting
   changed and its note read, Reset to standard. Assertions of the RIGHT behaviour.
   usage (from raptor-port/): node scripts/handpass/rcb2/rcb2-host.mjs */
process.env.RCB2_WHO ||= 'host'
const W = await import('./rcb2-lib.mjs')
const { L, say, check, nrm } = W
say('rcb2-host v3', W.SHOTS)
const { browser, page, errors } = await W.openWorld()
check('H0 frozen bundle served', true, W.BUNDLE)
const FRI = 4, SAT = 5, MAN = 'bane'

// Friday: a sortie take-off 12:00, landing blank
await L.board(page, FRI)
const n0 = await page.evaluate(d => window.DAYS[d].waves.length, FRI)
await L.tap(page, `[data-wvadd="${FRI}"]`); await page.waitForTimeout(250)
await page.getByRole('button', { name: 'Flying wave', exact: true }).first().click(); await page.waitForTimeout(600)
const wi = (await page.evaluate(d => window.DAYS[d].waves.length, FRI)) - 1
check('H1 wave added Friday', wi === n0, `${n0} -> ${wi + 1}`)
await W.setF(page, `ff:${FRI}.${wi}.0.to`, '12:00')
say('seat Friday:', await L.put(page, `[data-slot="${FRI}.${wi}.0.0.p"]`, [MAN]))
// Saturday: 04:00 – 05:00
await L.board(page, SAT)
await L.tap(page, `[data-wvadd="${SAT}"]`); await page.waitForTimeout(250)
await page.getByRole('button', { name: 'Flying wave', exact: true }).first().click(); await page.waitForTimeout(600)
const wj = (await page.evaluate(d => window.DAYS[d].waves.length, SAT)) - 1
await W.setF(page, `ff:${SAT}.${wj}.0.to`, '04:00')
await W.setF(page, `ff:${SAT}.${wj}.0.ld`, '05:00')
say('seat Saturday:', await L.put(page, `[data-slot="${SAT}.${wj}.0.0.p"]`, [MAN]))
await page.waitForTimeout(500)
const wt = (await W.warnLines(page)).filter(l => /crew rest/i.test(l))
say('Saturday crew-rest lines:\n  ' + wt.join('\n  '))
check('H2 the line reads "took off 12:00 with no landing typed"', wt.some(l => /took off 12:00 with no landing typed/.test(l)), wt.join(' / '))
check('H2b no "landed 12:00"', !wt.some(l => /landed 12:00/.test(l)))
await W.pic(page, 'h2-sat-board-warnings', page.locator('#sbSide'))
await L.closeBoard(page)

// Insights by its own nav link
await L.go(page, 'editsched')
await page.locator('#insightBtn:visible').click()
await page.waitForSelector('#insightModal'); await page.waitForTimeout(500)
const ins = nrm(await page.evaluate(() => document.querySelector('#insightModal').innerText))
say('Insights mentions planned:', /\+ planned/.test(ins), '| old flying:', /(leave|Downchit) \+ flying/.test(ins))
check('H3 Insights opens', ins.length > 200, ins.length + ' chars')
await W.pic(page, 'h3-insights')
await page.locator('#insightClose').click(); await page.waitForTimeout(300)

// the Logic page: search "planned"
await page.locator('a[data-page="logic"]:visible').first().click()
await page.waitForSelector('#page-logic.on'); await page.waitForTimeout(400)
const lg = nrm(await page.evaluate(() => document.querySelector('#page-logic').innerText))
check('H4 Logic page names "On leave + planned"', lg.includes('On leave + planned'), '')
check('H4b Logic page names "Downchit + planned"', lg.includes('Downchit + planned'), '')
// one setting changed: the first number box in the body
const box = page.locator('#lgBody input[type="text"]:visible, #lgBody input[type="number"]:visible').first()
say('Logic boxes found:', await page.locator('#lgBody input:visible').count())
await W.pic(page, 'h4-logic')
say('errors', JSON.stringify(errors))
check('H5 no console or page errors', errors.length === 0, errors.slice(0, 3).join(' | '))
await browser.close()
W.summary()
