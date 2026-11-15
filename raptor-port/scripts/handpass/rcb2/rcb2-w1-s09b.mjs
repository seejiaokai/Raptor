/* rcb2-w1 S09 part 2 — every kind of row a man on whole-day leave can be put on (desktop; one phone look is S09 part 1's BRIEFING).
   Friday, index 4. Each man gets his own whole-day LL through the Inputs page (admin picks the person). */
process.env.RCB2_RUN = 's09b-desktop' + (process.env.RCB2_TAG || '')
const X = await import('./rcb2-w1-lib.mjs')
const { L, say, check, nrm, sleep, FRI } = X
const w = await X.world('desktop', 'a')
const page = w.page
const OLD = /(leave|downchit) \+ flying/i
const MEN = { flying: 'pump', scmain: 'slash', scspare: 'harpoon', sim: 'snap', duty: 'taipan', prog: 'mamba', input: 'chaps' }
const CS = {}
for (const [k, id] of Object.entries(MEN)) CS[k] = await page.evaluate(i => window.PEOPLE[i].cs, id)
for (const [k, id] of Object.entries(MEN)) {
  const r = await X.fileInput(w, { iso: '2026-07-17', type: 'LL', person: id, remarks: 'rcb2 w1 ' + k })
  say('leave filed for', k, CS[k], r.added, !!r.rec)
}
// the accepted-duty-input man also has a timed Duty input to accept
const rin = await X.fileInput(w, { iso: '2026-07-17', type: 'Duty', person: MEN.input, remarks: 'rcb2 w1 duty input' })
say('Duty input for', CS.input, rin.added, rin.rec)

await X.board(w, FRI)
const line = async (cs) => (await X.boardWarn(w)).lines.filter(l => l.text.includes(cs)).map(l => l.text)
const report = async (key, label) => {
  const ls = await line(CS[key])
  await X.crop(w, '#schedBoard .sb-warn', `s09b-${key}-board-list`)
  await X.pic(w, `s09b-${key}-board`)
  say(`${label}: board lines for ${CS[key]}:`, JSON.stringify(ls))
  return ls
}
// 1. a flying seat
const s = await X.sortie(w, FRI, { to: '12:00', ld: '13:00', who: MEN.flying })
say('flying seat', JSON.stringify(s))
let ls = await report('flying', 'flying seat')
check('S09b.1 flying seat on leave: warning present, board prints its own message', ls.some(t => /On leave but planned to fly/.test(t)), ls.join(' / ') || 'none')
// 2. SC MAIN and SPARE
const sc = await X.addWave(w, FRI, 'sc')
say('SC wave', sc, 'main', await X.seat(w, `[data-slot="${FRI}.${sc}.0.0.p"]`, MEN.scmain), 'spare', await X.seat(w, `[data-slot="${FRI}.${sc}.0.2.p"]`, MEN.scspare))
ls = await report('scmain', 'SC MAIN')
check('S09b.2a SC MAIN on leave: a warning for him', ls.some(t => /leave|LL/i.test(t)), ls.join(' / ') || 'none')
ls = await report('scspare', 'SC SPARE')
say('SC SPARE with LL only: RECORD — the validator exempts a SPARE from leave (canSpare), so none is expected:', JSON.stringify(ls))
check('S09b.2b SC SPARE on plain LL: no warning (a spare may be on leave — negative control)', ls.length === 0, ls.join(' / ') || 'none')
// 2c. SC SPARE with a downchit that bars a spare (ATT C, medically down): filed now, the board re-reads
{ await X.closeBoard(w)
  const r = await X.fileInput(w, { iso: '2026-07-17', type: 'ATT C', person: MEN.scspare, remarks: 'rcb2 w1 spare downchit' })
  say('ATT C for the SPARE man', r.added, !!r.rec)
  await X.board(w, FRI)
  ls = await report('scspare', 'SC SPARE with ATT C')
  check('S09b.2c SC SPARE with ATT C: a "Downchit" warning for him', ls.some(t => /ATT C|Downchit|medically down/i.test(t)), ls.join(' / ') || 'none') }
// 3. a sim seat
say('sim seat', await (async () => { await X.ensureRoster(w); await X.press(w, `[data-fill="s:${FRI}.oft.0.+"]`); const p = page.locator(`#sbRoster .rpuck[data-person="${MEN.sim}"]:visible`).first(); if (await p.count()) { await p.click(); await sleep(400); return 'ok' } return 'FAILED not offered' })())
await page.evaluate(() => document.querySelector('#schedBoard [data-disarm]')?.click())
ls = await report('sim', 'sim seat')
check('S09b.3 sim seat on leave: a warning for him', ls.some(t => /leave/i.test(t)), ls.join(' / ') || 'none')
// 4. a duty desk
say('duty desk', await (async () => { await X.ensureRoster(w); await X.press(w, `[data-fill="d:${FRI}.0.0.+"]`); const p = page.locator(`#sbRoster .rpuck[data-person="${MEN.duty}"]:visible`).first(); if (await p.count()) { await p.click(); await sleep(400); return 'ok' } return 'FAILED not offered' })())
await page.evaluate(() => document.querySelector('#schedBoard [data-disarm]')?.click())
ls = await report('duty', 'duty desk')
check('S09b.4 duty desk on leave: a warning for him', ls.some(t => /leave/i.test(t)), ls.join(' / ') || 'none')
// 5. Common Programme
say('programme', await (async () => { await X.ensureRoster(w); await X.press(w, `[data-fill="a:${FRI}.0.+"]`); const p = page.locator(`#sbRoster .rpuck[data-person="${MEN.prog}"]:visible`).first(); if (await p.count()) { await p.click(); await sleep(400); return 'ok' } return 'FAILED not offered' })())
await page.evaluate(() => document.querySelector('#schedBoard [data-disarm]')?.click())
ls = await report('prog', 'Common Programme')
check('S09b.5 Common Programme person on leave: a warning for him', ls.some(t => /leave/i.test(t)), ls.join(' / ') || 'none')
// 6. an accepted duty input
await X.press(w, `[data-inpadd="${FRI}.g"]`); await sleep(500)
await page.waitForSelector('#inpEditPop'); await sleep(300)
await page.selectOption('#inpEditPerson', MEN.input)
await page.selectOption('#inpEditType', 'Duty')
await page.locator('#inpEditRmk').fill('rcb2 w1 accepted duty')
await X.pic(w, 's09b-input-form')
await page.getByRole('button', { name: 'Add', exact: true }).click(); await sleep(900)
for (let k = 0; k < 3; k++) {
  const nd = page.locator('[data-testid="docconf-nodoc"]'); if (await nd.count() && await nd.first().isVisible()) { await nd.first().click(); await sleep(600); continue }
  const conf = page.locator('[data-testid="oilconf"]'); if (await conf.count() && await conf.isVisible()) { await conf.locator('button').filter({ hasText: /^No/ }).first().click().catch(() => {}); await conf.getByRole('button', { name: 'Save', exact: true }).click().catch(() => {}); await sleep(600); continue }
  break
}
say('ground rows now', JSON.stringify(await page.evaluate(() => window.DAYS[4].ground.map(g => g.prog + '|' + g.str + '-' + g.end + '|' + JSON.stringify(g.who)))))
ls = await report('input', 'accepted duty input')
check('S09b.6 accepted duty input for a man on leave: a warning for him', ls.some(t => /leave/i.test(t)), ls.join(' / ') || 'none')
say('errors', JSON.stringify(w.errors))
// week strip + day details + Insights
await X.closeBoard(w)
await L.go(page, 'editsched'); await sleep(400)
const ew = await X.weekWarn(w, '#eWeek', FRI)
say('EDIT WEEK strip:\n  ' + ew.items.map(i => i.text).join('\n  '))
await X.crop(w, '#eWeek [data-dwbox="4"]', 's09b-week-strip')
check('S09b.7 week strip: every row kind names its check "planned", none "flying"', ew.items.filter(i => /leave|Downchit/i.test(i.text)).every(i => !OLD.test(i.text)) && ew.items.some(i => /On leave \+ planned/.test(i.text)), `${ew.items.length} items`)
check('S09b no console/page errors', w.errors.length === 0, w.errors.slice(0, 3).join(' | '))
await X.finishWorld(w)
X.W.summary()
