/* rcf-w3 S25+S26 v1 — days in a row (D1993): Ace on timed work Mon-Sat, Sunday only an untimed row.
   Ace's demo Monday-Thursday work stays; Friday and Saturday get a timed ground row each.
   usage: RCF_RUN=s25-r1 node scripts/handpass/rcf/rcf-w3-s25.mjs */
const W = await import('./rcf-w3-lib.mjs')
const { L, say, check, nrm } = W
console.log('rcf-w3-s25 v1', W.SHOTS)
const { browser, page, errors } = await W.openWorld()
const ACE = 'dj'
const rids = (d, kind) => page.evaluate(([d, kind]) => (kind === 'g' ? window.DAYS[d].ground : kind === 'oft' ? window.DAYS[d].sims.oft : window.DAYS[d].dutywaves[0].rows).map(r => r.rid), [d, kind])
const runWarn = async () => (await W.warnText(page)).filter(l => /break|in a row|days in a row|run/i.test(l) && !/^✕$/.test(l))

// a baseline: Ace's Monday..Thursday
const base = await page.evaluate(id => window.DAYS.map((d, i) => ({ i, flying: d.waves.some(w => w.formations.some(f => f.aircraft.some(a => a.p === id || a.w === id))), ground: d.ground.filter(g => g.who === id || (Array.isArray(g.who) && g.who.includes(id))).map(g => g.prog + ' ' + g.str + '-' + g.end), duty: d.dutywaves.flatMap(b => b.rows.filter(r => r.id === id).map(r => r.role)) })), ACE)
say('Ace baseline:', JSON.stringify(base))

// a ground row on a day: timed or not, Ace seated
async function groundRow(d, prog, str, end) {
  await L.board(page, d)
  const before = await rids(d, 'g')
  await L.tap(page, `[data-gradd="${d}"]`); await page.waitForTimeout(400)
  const after = await rids(d, 'g')
  const idx = after.findIndex(r => !before.includes(r))
  if (idx < 0) throw new Error('no new ground row on day ' + d)
  await W.setF(page, `gr:${d}.${idx}.prog`, prog)
  if (str) await W.setF(page, `gr:${d}.${idx}.str`, str)
  if (end) await W.setF(page, `gr:${d}.${idx}.end`, end)
  const r = await W.seat(page, `[data-fill="g:${d}.${idx}.+"]`, ACE)
  say(`ground row day ${d} #${idx} "${prog}" ${str || '-'}..${end || '-'}: seat`, r)
  return idx
}
await groundRow(4, 'RCFW3 TIMED FRI', '09:00', '10:00')
await groundRow(5, 'RCFW3 TIMED SAT', '09:00', '10:00')
const sunIdx = await groundRow(6, 'RCFW3 UNTIMED SUN', '', '')
let wt = await W.warnText(page)
say('Sunday warnings (untimed ground row):\n  ' + wt.join('\n  '))
const runLine = wt.find(l => /Ace/.test(l) && /break|row|days/i.test(l))
check('S25 untimed Sunday ground row raises the days-in-a-row warning', !!runLine, runLine || wt.join(' / ').slice(0, 300))
await L.shot(page, 'sun-ground-untimed')
await L.shot(page, 'sun-ground-untimed-warn', page.locator('#sbSide'))
// dotted marks on the days before
async function aceMarks(d) {
  await L.board(page, d)
  return page.evaluate(id => [...document.querySelectorAll('#schedBoard .puck[data-person="' + id + '"]')].filter(e => e.offsetWidth > 0 && !e.closest('#sbRoster')).map(e => e.className.replace(/\s+/g, ' ')), ACE)
}
const sat = await aceMarks(5)
say('Ace pucks on Saturday, classes:', JSON.stringify(sat))
await L.shot(page, 'sat-ace-marks')
const fri = await aceMarks(4)
say('Ace pucks on Friday, classes:', JSON.stringify(fri))
await L.shot(page, 'fri-ace-marks')
// the week view, for the dotted marks
await L.closeBoard(page); await L.go(page, 'editsched')
const weekMarks = await page.evaluate(id => [...document.querySelectorAll('#eWeek [data-person="' + id + '"]')].filter(e => e.offsetWidth > 0).map(e => e.closest('.day')?.dataset.day + ':' + e.className.replace(/\s+/g, ' ')), ACE)
say('Ace pucks on the week, day:classes', JSON.stringify(weekMarks))
await L.shot(page, 'week-ace')

// remove Wednesday's work: Ace's Wed ground row MAINT CONF
await L.board(page, 6)
const sunRun = async () => { const t = await W.warnText(page); return t.find(l => /Ace/.test(l) && /break|row|days/i.test(l)) || null }
// repeat Sunday as a duty row with no times: remove the ground row first, then add a duty row
const gdel = await page.evaluate(([d, i]) => window.DAYS[d].ground[i].rid, [6, sunIdx])
await L.tap(page, `[data-grdel="6.${sunIdx}"]`); await page.waitForTimeout(500)
const afterDel = await page.evaluate(d => window.DAYS[d].ground.length, 6)
say('Sunday ground rows after delete:', afterDel)
const noWarn = await sunRun()
check('S25 deleting the Sunday row clears the warning', !noWarn, 'Sunday line for Ace: ' + noWarn)
// a duty row with no times
{
  const before = await rids(6, 'duty')
  await L.tap(page, '[data-dradd="6.0"]'); await page.waitForTimeout(400)
  const after = await rids(6, 'duty')
  const idx = after.findIndex(r => !before.includes(r))
  say('new duty row index', idx, 'row', JSON.stringify(await page.evaluate(([d, i]) => window.DAYS[d].dutywaves[0].rows[i], [6, idx])))
  if (idx >= 0) {
    await W.setF(page, `dr:6.0.${idx}.role`, 'RCFW3 DESK')
    const s = await W.seat(page, `[data-fill="d:6.0.${idx}.+"]`, ACE)
    say('seat on the duty row:', s)
    const t = await sunRun()
    check('S25 untimed Sunday duty row raises the days-in-a-row warning', !!t, t || (await W.warnText(page)).join(' / ').slice(0, 300))
    await L.shot(page, 'sun-duty-untimed'); await L.shot(page, 'sun-duty-untimed-warn', page.locator('#sbSide'))
    await L.tap(page, `[data-drdel="6.0.${idx}"]`); await page.waitForTimeout(500)
  }
}
// a sim seat with no times: OFT row
{
  const before = await rids(6, 'oft')
  await L.tap(page, '[data-sradd="6.oft"]'); await page.waitForTimeout(400)
  const after = await rids(6, 'oft')
  const idx = after.findIndex(r => !before.includes(r))
  say('new OFT row index', idx, JSON.stringify(await page.evaluate(([d, i]) => window.DAYS[d].sims.oft[i], [6, idx])))
  if (idx >= 0) {
    await W.setF(page, `sr:6.oft.${idx}.label`, 'RCFW3 OFT')
    const s = await W.seat(page, `[data-fill="s:6.oft.${idx}.+"]`, ACE)
    say('seat on the sim row:', s)
    const t = await sunRun()
    check('S25 untimed Sunday sim seat raises the days-in-a-row warning', !!t, t || (await W.warnText(page)).join(' / ').slice(0, 300))
    await L.shot(page, 'sun-sim-untimed'); await L.shot(page, 'sun-sim-untimed-warn', page.locator('#sbSide'))
    const tt = await sunRun()
    // S26: remove Wednesday's work while the warning stands
    await L.board(page, 2)
    const wedIdx = await page.evaluate(id => window.DAYS[2].ground.findIndex(g => g.who === id || (Array.isArray(g.who) && g.who.includes(id))), ACE)
    say('Wednesday Ace ground row index', wedIdx)
    if (wedIdx >= 0) { await L.tap(page, `[data-grdel="2.${wedIdx}"]`); await page.waitForTimeout(600) }
    await L.shot(page, 'wed-after-removal')
    await L.board(page, 6)
    const t2 = await sunRun()
    check('S26 removing Wednesday\'s work clears the Sunday warning', !t2, `before: ${tt ? 'raised' : 'none'}; after: ${t2}`)
    await L.shot(page, 'sun-after-wed-removed'); await L.shot(page, 'sun-after-wed-removed-warn', page.locator('#sbSide'))
  }
}
check('S25 no console/page errors', errors.length === 0, errors.slice(0, 3).join(' | '))
await browser.close()
W.summary()
