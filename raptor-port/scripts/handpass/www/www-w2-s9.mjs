/* www W2 scenario 9: conflict shapes; Step/Dekit changed on Logic and put back; two flights; a non-flying SC SPARE control.
   usage (from raptor-port/): [PHONE=1] node scripts/handpass/www/www-w2-s9.mjs */
const PHONE = process.env.PHONE === '1'
process.env.WWW_RUN ||= 's9-' + (PHONE ? 'p' : 'd')
const H = await import('./www-w2-lib2.mjs')
const { X, say, sleep, L } = H
const P = PHONE ? 'p' : 'd', size = PHONE ? '402' : '1536'
const R = (did, exp, saw, v, pic) => X.row('9 conflict shapes', size, did, exp, saw, v, pic)
say('www-w2-s9 v1', size)
const w = await X.open({ phone: PHONE })
const { page } = w
const FRI = X.FRI, SAT = X.SAT
const isConf = l => /Conflict:/.test(l)
await X.board(w, FRI)
const wi = await H.frFlight(w, FRI, '12:00', '', 'bane', 'VL BFM')
const g0 = await H.gRow(w, FRI, 'BRIEFING', '11:20', '11:40', 'bane')
const shapes = [
  ['step only 11:20-11:40', '11:20', '11:40', /step 11:00, T\/O 12:00/],
  ['airborne 12:20-12:40', '12:20', '12:40', /T\/O 12:00, landing assumed 13:00/],
  ['dekit only 13:10-13:20', '13:10', '13:20', /landing assumed 13:00, dekit to 13:30/],
  ['step + airborne 11:30-12:30', '11:30', '12:30', null],
  ['across the whole flight 10:30-14:00', '10:30', '14:00', null],
  ['ends at the step start 10:50-11:00', '10:50', '11:00', null],
  ['starts at the dekit end 13:30-13:40', '13:30', '13:40', null]]
let n = 0
for (const [nm, s, e, rx] of shapes) {
  n++
  await H.setF(w, `gr:${FRI}.${g0}.str`, s); await H.setF(w, `gr:${FRI}.${g0}.end`, e)
  // set end first when start would pass old end: retype both again
  await H.setF(w, `gr:${FRI}.${g0}.str`, s); await H.setF(w, `gr:${FRI}.${g0}.end`, e)
  const ws = await H.bwf(w, /Ranger/)
  const pn = `9-${n}-${nm.split(' ')[0]}-${P}`
  await X.pic(w, pn)
  const cl = ws.filter(isConf)
  R(`shape: ${nm}`, rx ? `Conflict line naming ${rx}` : 'RECORD the words', JSON.stringify(ws), rx ? (cl.some(l => rx.test(l)) ? 'PASS' : 'FAIL') : 'RECORDED', pn + '.png')
}
// Logic: Step 90 min, Dekit 45 min, then put back; item at 11:20-11:40 read, then 13:10-13:20
await X.closeBoard(w)
await L.go(page, 'logic'); await sleep(500)
if (await page.locator('#lgEdit:visible').count()) { await X.press(w, '#lgEdit'); await sleep(300) }
async function setLg(key, v) {
  const inp = page.locator(`[data-lgset="${key}"]:visible`).first()
  await inp.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(150)
  if (PHONE) await inp.tap(); else await inp.click()
  await inp.fill(String(v)); await page.keyboard.press('Tab'); await sleep(500)
  return inp.inputValue()
}
const v1 = await setLg('step', '90'), v2 = await setLg('dekit', '45')
say('logic step/dekit', v1, v2)
await X.pic(w, `9-8-logic-set-${P}`)
await L.go(page, 'editsched')
await X.board(w, FRI)
await H.setF(w, `gr:${FRI}.${g0}.end`, '11:40'); await H.setF(w, `gr:${FRI}.${g0}.str`, '10:40'); await H.setF(w, `gr:${FRI}.${g0}.end`, '10:50')
let ws = await H.bwf(w, /Ranger/)
await X.pic(w, `9-9-step90-${P}`)
R(`Logic Step ${v1}, Dekit ${v2}: item 10:40-10:50 (inside the longer step only)`, 'Conflict shows step 10:30', JSON.stringify(ws), ws.some(l => isConf(l) && /step 10:30, T\/O 12:00/.test(l)) ? 'PASS' : 'FAIL', `9-9-step90-${P}.png`)
await H.setF(w, `gr:${FRI}.${g0}.str`, '13:35'); await H.setF(w, `gr:${FRI}.${g0}.end`, '13:50'); await H.setF(w, `gr:${FRI}.${g0}.str`, '13:35')
ws = await H.bwf(w, /Ranger/)
await X.pic(w, `9-10-dekit45-${P}`)
R(`Logic Dekit ${v2}: item 13:35-13:50 (inside the longer dekit only)`, 'Conflict shows dekit to 13:45', JSON.stringify(ws), ws.some(l => isConf(l) && /dekit to 13:45/.test(l)) ? 'PASS' : 'FAIL', `9-10-dekit45-${P}.png`)
await X.closeBoard(w)
await L.go(page, 'logic'); await sleep(500)
if (await page.locator('#lgEdit:visible').count()) { await X.press(w, '#lgEdit'); await sleep(300) }
for (const k of ['step', 'dekit']) { const b = page.locator(`[data-lgreset="${k}"]:visible`).first(); if (await b.count()) { if (PHONE) await b.tap(); else await b.click(); await sleep(400) } }
const back = [await page.locator('[data-lgset="step"]:visible').first().inputValue(), await page.locator('[data-lgset="dekit"]:visible').first().inputValue()]
R('Logic Step and Dekit put back by their Reset', 'step 1h, dekit 30 min', JSON.stringify(back), back[0] === '1h' && /30/.test(back[1]) ? 'PASS' : 'FAIL', '')
await L.go(page, 'editsched')
await X.board(w, FRI)
await H.setF(w, `gr:${FRI}.${g0}.str`, '13:10'); await H.setF(w, `gr:${FRI}.${g0}.end`, '13:20')
ws = await H.bwf(w, /Ranger/)
R('after Step/Dekit put back: item 13:10-13:20', 'dekit to 13:30 again', JSON.stringify(ws), ws.some(l => /dekit to 13:30/.test(l)) ? 'PASS' : 'FAIL', '')
await X.closeBoard(w)
// two flights on Saturday for Ranger
await X.board(w, SAT)
const a = await H.frFlight(w, SAT, '12:00', '12:30', 'bane', 'VL BFM')
const b = await H.frFlight(w, SAT, '13:00', '13:30', 'bane', 'RU')
ws = await H.bwf(w, /Ranger/)
await X.pic(w, `9-11-twoflights-sep-${P}`)
R('two flights, airborne separate (12:00-12:30, 13:00-13:30), step/dekit overlap', 'amber Tight turn, no Conflict', JSON.stringify(ws), ws.some(isConf) ? 'FAIL' : (ws.some(l => /Tight turn:/.test(l)) ? 'PASS' : 'FAIL'), `9-11-twoflights-sep-${P}.png`)
await H.setF(w, `ff:${SAT}.${b}.0.ld`, '14:00'); await H.setF(w, `ff:${SAT}.${b}.0.to`, '12:20')
ws = await H.bwf(w, /Ranger/)
await X.pic(w, `9-12-twoflights-overlap-${P}`)
R('second flight moved to T/O 12:20 (airborne overlaps the first)', 'RECORD: a conflict between two flights', JSON.stringify(ws), 'RECORDED', `9-12-twoflights-overlap-${P}.png`)
await X.closeBoard(w)
// SC SPARE (non-flying) on Friday: Torch, an item inside
await X.board(w, FRI)
const torch = await page.evaluate(() => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === 'Torch'))
const swi = await X.addWave(w, FRI, 'sc')
const lines = await page.evaluate(([i, g]) => window.DAYS[i].waves[g].formations.map((f, k) => ({ k, shift: f.shift, cs: f.cs, msn: f.msn })), [FRI, swi])
say('SC lines', JSON.stringify(lines))
const spare = lines.find(l => /spare/i.test(l.cs + l.msn + l.shift + '')) || lines[1]
await H.setF(w, `ff:${FRI}.${swi}.${spare.k}.to`, '08:00'); await H.setF(w, `ff:${FRI}.${swi}.${spare.k}.ld`, '16:00')
say('seat torch', await X.seat(w, `[data-slot="${FRI}.${swi}.${spare.k}.0.p"]`, torch))
const gT = await H.gRow(w, FRI, 'TORCH ITEM', '07:30', '08:30', torch)
ws = await H.bwf(w, /Torch/)
await X.pic(w, `9-13-sc-spare-${P}`)
R('SC SPARE line (08:00-16:00, not flying) with Torch, a ground item 07:30-08:30 overlapping its START', 'no step/dekit conflict from the standby line; RECORD what the screen says', JSON.stringify(ws), 'RECORDED', `9-13-sc-spare-${P}.png`)
// flip the PM line's MAIN badge to SPARE
const badges = await page.evaluate(() => [...document.querySelectorAll('#schedBoard *')].filter(e => e.getBoundingClientRect().width > 0 && /^(MAIN|SPARE)$/.test((e.innerText || '').trim()) && e.children.length === 0).map(e => e.tagName + '.' + e.className + ':' + e.innerText.trim()))
say('BADGES', JSON.stringify(badges))
const cobra = await page.evaluate(() => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === 'Cobra'))
const flipped = await X.seat(w, `[data-slot="${FRI}.${swi}.1.1.p"]`, cobra)
await H.gRow(w, FRI, 'COBRA ITEM', '07:30', '08:30', cobra)
ws = await H.bwf(w, /Cobra/)
await X.pic(w, `9-14-sc-spare-row-${P}`)
R(`Cobra on the SC PM line's second (SPARE) row, seat result ${flipped}; ground item 07:30-08:30`, 'RECORD', JSON.stringify(ws) + ' | badges ' + JSON.stringify(badges).slice(0, 120), 'RECORDED', `9-14-sc-spare-row-${P}.png`)
await X.fin(w)
