/* rcf-w3 S33 v1 — the amber crew-rest reminder (D1988, D1989). Thursday ends 21:30 for Ranger (a ground row), Friday take-off 12:00,
   nothing typed; tap the faint R; clear it; type a clearing B.
   usage: RCF_RUN=s33-r1 node scripts/handpass/rcf/rcf-w3-s33.mjs */
const W = await import('./rcf-w3-lib.mjs')
const { L, say, check, nrm } = W
console.log('rcf-w3-s33 v1', W.SHOTS)
const { browser, page, errors } = await W.openWorld()
const D = 4
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
await W.setF(page, `ff:${D}.${wi}.0.to`, '12:00')
say('seat Ranger:', await W.seat(page, `[data-slot="${D}.${wi}.0.0.p"]`, 'bane'))
const F = () => page.evaluate(([d, w]) => { const f = window.DAYS[d].waves[w].formations[0]; return { rl: f.rl, br: f.br, to: f.to } }, [D, wi])
const rest = async () => (await W.warnText(page)).filter(l => /Ranger/.test(l))
const ring = () => page.evaluate(() => [...document.querySelectorAll('#schedBoard [data-person="bane"]')].filter(e => e.offsetWidth > 0 && !e.closest('#sbRoster')).map(e => e.title.split('·').slice(-1)[0].trim() + ' | ' + e.className.replace(/\s+/g, ' ')))
say('formation', JSON.stringify(await F()))
let l = await rest()
say('[1 nothing typed] Ranger lines:\n  ' + l.join('\n  '), '\n  ring:', JSON.stringify(await ring()))
check('S33 nothing typed: amber Tight turning reminder', l.some(x => /Tight turning/.test(x)) && !l.some(x => /Crew rest breach/.test(x)), l.join(' / '))
await L.shot(page, '1-nothing-typed-board'); await L.shot(page, '1-nothing-typed-warn', page.locator('#sbSide'))
// the faint R
const rbox = page.locator(`#schedBoard [data-bfld="ff:${D}.${wi}.0.rl"]:visible`).first()
const ph = await rbox.evaluate(e => ({ ph: e.dataset.ph || e.getAttribute('placeholder'), v: e.value }))
say('faint R box:', JSON.stringify(ph))
await rbox.scrollIntoViewIfNeeded(); await rbox.click(); await page.waitForTimeout(400)
say('after one press, R box reads', JSON.stringify(await rbox.inputValue()), 'stored', JSON.stringify(await F()))
await rbox.evaluate(e => e.blur()); await page.waitForTimeout(500)
l = await rest()
say('[2 faint R taken] formation', JSON.stringify(await F()), '\n  Ranger lines:\n  ' + l.join('\n  '), '\n  ring:', JSON.stringify(await ring()))
await L.shot(page, '2-r-taken-board'); await L.shot(page, '2-r-taken-warn', page.locator('#sbSide'))
check('S33 faint R tapped: crew-rest breach (red)', l.some(x => /Crew rest breach/.test(x)), `R stored "${(await F()).rl}": ` + l.join(' / '))
// clear R, type a clearing B
await rbox.click(); await page.keyboard.press('Control+a'); await page.keyboard.press('Backspace'); await rbox.evaluate(e => e.blur()); await page.waitForTimeout(400)
say('R cleared:', JSON.stringify(await F()))
await W.setF(page, `ff:${D}.${wi}.0.br`, '10:00'); await page.waitForTimeout(500)
l = await rest()
say('[3 clearing B 10:00] formation', JSON.stringify(await F()), '\n  Ranger lines:\n  ' + l.join('\n  '), '\n  ring:', JSON.stringify(await ring()))
await L.shot(page, '3-b-1000-board'); await L.shot(page, '3-b-1000-warn', page.locator('#sbSide'))
check('S33 clearing B typed: the amber reminder stays (D1989), no breach', l.some(x => /Tight turning/.test(x)) && !l.some(x => /Crew rest breach/.test(x)), l.join(' / '))
// the boundary examples with nothing typed
await W.setF(page, `ff:${D}.${wi}.0.br`, ''); await page.waitForTimeout(300)
for (const to of ['11:49', '11:50', '12:29', '12:30']) {
  await W.setF(page, `ff:${D}.${wi}.0.to`, to); await page.waitForTimeout(500)
  l = await rest()
  say(`[boundary] take-off ${to}, nothing typed: ${l.map(x => x.slice(0, 40)).join(' / ') || '(no Ranger line)'}`)
}
check('S33 no console/page errors', errors.length === 0, errors.slice(0, 3).join(' | '))
await browser.close()
W.summary()
