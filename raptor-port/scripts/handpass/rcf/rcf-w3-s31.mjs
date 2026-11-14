/* rcf-w3 S31+S32 v1 — In-time lines and the R box (D1995). Friday: one wave, VL take-off 12:00, R box 10:00, Ranger front seat,
   one In-time line whose words are changed.
   usage: RCF_RUN=s31-r1 node scripts/handpass/rcf/rcf-w3-s31.mjs */
const W = await import('./rcf-w3-lib.mjs')
const { L, say, check, nrm } = W
console.log('rcf-w3-s31 v1', W.SHOTS)
const { browser, page, errors } = await W.openWorld()
const D = 4
// a Thursday late ground row for Ranger ending 21:30, so that his Friday report time decides a crew-rest breach (12h -> 09:30)
await L.board(page, 3)
{
  const rid0 = await page.evaluate(() => window.DAYS[3].ground.map(g => g.rid))
  await L.tap(page, '[data-gradd="3"]'); await page.waitForTimeout(400)
  const gi = await page.evaluate(r => window.DAYS[3].ground.findIndex(g => !r.includes(g.rid)), rid0)
  await W.setF(page, `gr:3.${gi}.prog`, 'RCFW3 LATE'); await W.setF(page, `gr:3.${gi}.str`, '20:00'); await W.setF(page, `gr:3.${gi}.end`, '21:30')
  say('Thursday late row, seat Ranger:', await W.seat(page, `[data-fill="g:3.${gi}.+"]`, 'bane'))
}
await L.board(page, D)
const wi = await W.addWave(page, D)
await W.setF(page, `ff:${D}.${wi}.0.cs`, 'VL')
await W.setF(page, `ff:${D}.${wi}.0.to`, '12:00')
await W.setF(page, `ff:${D}.${wi}.0.rl`, '10:00')
say('seat Ranger:', await W.seat(page, `[data-slot="${D}.${wi}.0.0.p"]`, 'bane'))
await L.tap(page, 'button:has-text("+ In-time")'); await page.waitForTimeout(500)
const lineSel = `#schedBoard [data-itline="${D}|${wi}|0"]:visible`
const stored = () => page.evaluate(([d, w]) => window.DAYS[d].waves[w].intimes.slice(), [D, wi])
const feedback = () => page.evaluate(() => [...document.querySelectorAll('#schedBoard [data-reporting-feedback]')].filter(e => e.offsetWidth > 0).map(e => e.textContent.replace(/ /g, ' ').trim()))
async function setLine(text) {
  const el = page.locator(lineSel).first()
  await el.scrollIntoViewIfNeeded(); await el.click(); await page.keyboard.press('Control+a'); await page.keyboard.type(text, { delay: 12 })
  await el.evaluate(e => e.blur()); await page.waitForTimeout(500)
}
say('line as minted:', JSON.stringify(await stored()), 'feedback:', JSON.stringify(await feedback()))
await L.shot(page, '0-minted')

// S31
await setLine('09:00 RALLY')
say('S31 line stored:', JSON.stringify(await stored()))
const fb1 = await feedback(); const w1 = await W.warnText(page)
say('S31 feedback:', JSON.stringify(fb1), '\nS31 warnings:\n  ' + w1.join('\n  '))
const rest1 = w1.find(l => /Crew rest breach/i.test(l) && /Ranger/.test(l))
check('S31 "09:00 RALLY" line + R 10:00: VL reports at 09:00 (rest breach says so)', !!rest1 && /report 09:00/.test(rest1), rest1 || 'no crew-rest line: ' + w1.join(' / ').slice(0, 300))
await L.shot(page, '1-0900-rally-board')
await L.shot(page, '1-0900-rally-warn', page.locator('#sbSide'))
const ranger = () => page.evaluate(() => [...document.querySelectorAll('#schedBoard [data-person="bane"]')].filter(e => e.offsetWidth > 0 && !e.closest('#sbRoster')).map(e => e.title))
say('Ranger puck title:', JSON.stringify(await ranger()))
// reads: the wave header In-time / Rally on the week
await L.closeBoard(page); await L.go(page, 'editsched')
const hdr = await page.evaluate(([d, w]) => { const e = document.querySelector(`#eWeek .day[data-day="${d}"] .intimes[data-intimes="${d}|${w}"]`) || document.querySelector(`#eWeek .intimes[data-intimes="${d}|${w}"]`); return e ? e.innerText.replace(/\s+/g, ' ') : null }, [D, wi])
say('week header In-time / Rally text:', JSON.stringify(hdr))
const fbWeek = await page.evaluate(() => [...document.querySelectorAll('#eWeek [data-reporting-feedback]')].filter(e => e.offsetWidth > 0).map(e => e.textContent.trim()))
say('week reporting feedback:', JSON.stringify(fbWeek))
// the VL's reporting time as the app resolves it: the R box suggestion / the brief the warning names
const ritual = await page.evaluate(([d, w]) => { const f = window.DAYS[d].waves[w].formations[0]; return { rl: f.rl, br: f.br, to: f.to } }, [D, wi])
say('formation:', JSON.stringify(ritual))
await L.board(page, D)

// S32: clockless line
await setLine('RALLY AFTER IN TIME')
say('S32a stored:', JSON.stringify(await stored()))
const fb2 = await feedback(); const w2 = await W.warnText(page)
say('S32a feedback:', JSON.stringify(fb2), '\nS32a warnings:\n  ' + w2.join('\n  '))
await L.shot(page, '2-clockless-board'); await L.shot(page, '2-clockless-warn', page.locator('#sbSide'))
const noClockWarn = w2.filter(l => /recogni[sz]ed clock|no clock|rally after|applicable in-time/i.test(l))
check('S32a clockless line raises nothing about its clock', noClockWarn.length === 0, noClockWarn.join(' / ') || 'no clock-related line; all lines: ' + w2.join(' / ').slice(0, 300))
const rest2 = w2.find(l => /Crew rest breach/i.test(l) && /Ranger/.test(l))
check('S32a clockless line sets no time (report falls back to the R box 10:00: no breach)', !rest2, rest2 || 'no crew-rest breach; lines: ' + w2.join(' / ').slice(0, 250))

// S32: unreadable clock
await setLine('RALLY 9h15')
say('S32b stored:', JSON.stringify(await stored()))
const fb3 = await feedback(); const w3 = await W.warnText(page)
say('S32b feedback:', JSON.stringify(fb3), '\nS32b warnings:\n  ' + w3.join('\n  '))
await L.shot(page, '3-unreadable-board'); await L.shot(page, '3-unreadable-warn', page.locator('#sbSide'))
const unr = w3.filter(l => /recogni[sz]ed clock|clock/i.test(l))
say('RECORD the warning the unreadable line raises:', JSON.stringify(unr))
const rest3 = w3.find(l => /Crew rest breach/i.test(l) && /Ranger/.test(l))
check('S32b unreadable clock sets no time (no breach)', !rest3, rest3 || 'no crew-rest breach')
check('S32b unreadable line: words', unr.some(l => /reporting line 1 has no recognised clock\. Check the time\./.test(l)) ? true : 'RECORD', unr.join(' / ') || 'no clock warning; warnings: ' + w3.join(' / ').slice(0, 300))

// another: only digits "RALLY" with a clock in a different shape
await setLine('09:00 RALLY')
const w4 = await W.warnText(page)
say('restored 09:00 RALLY; warnings:\n  ' + w4.join('\n  '), '\nfeedback:', JSON.stringify(await feedback()))
check('S31/S32 no console/page errors', errors.length === 0, errors.slice(0, 3).join(' | '))
await browser.close()
W.summary()
