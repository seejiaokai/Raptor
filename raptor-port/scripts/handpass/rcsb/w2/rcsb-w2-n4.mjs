/* rcsb-w2-n4 v1 — W2 N4/N5: the crew-rest sentence with the landing blank / TBD / typed / same as take-off / Debrief 1h30.
   usage: node scripts/handpass/rcsb/w2/rcsb-w2-n4.mjs <pc|phone> <case>   case: blank | tbd | l1300 | same1200 | deb130
   Monday 13 Jul: a flying line, take-off 12:00, landing per case, Vandal in the front seat.
   Tuesday 14 Jul: a flying line, take-off 05:00 (04:00 if no warning), Vandal. */
const KIND = process.argv[2] || 'pc'
const CASE = process.argv[3] || 'blank'
const C = await import('./rcsb-w2-common.mjs')
C.setShots(`N4-${CASE}-${KIND}`)
console.log('rcsb-w2-n4 v1', KIND, CASE, process.env.HP_SHOTS)
const Q = await C.load()
const { R, X, L, W, sleep } = Q
const j = C.j
const LD = { blank: '', tbd: 'TBD', l1300: '13:00', same1200: '12:00', deb130: '' }[CASE]
const w = await R.world(KIND)
const { page } = w
const P = KIND === 'phone' ? 'p-' : 'd-'
const id = w.ID('Vandal'), MON = 0, TUE = 1
const out = { case: CASE, kind: KIND }
if (CASE === 'deb130') { out.logic = await R.setLogic(w, 'debrief', '1h30', P + '00-logic-debrief'); console.log('logic', j(out.logic)) }
// Monday
await L.board(page, MON)
const gm = await X.addWave(w, MON, '')
await X.typeIn(w, `[data-bfld="ff:${MON}.${gm}.0.to"]`, '12:00')
if (LD !== '') await X.typeIn(w, `[data-bfld="ff:${MON}.${gm}.0.ld"]`, LD)
out.seatMon = await X.seatPhoneAware(w, `[data-slot="${MON}.${gm}.0.0.p"]`, id)
out.monFormation = await page.evaluate(([d, g]) => { const f = window.DAYS[d].waves[g].formations[0]; return { to: f.to, ld: f.ld, p: f.aircraft[0].p } }, [MON, gm])
console.log('Monday line', j(out.monFormation), out.seatMon)
await R.shot(page, P + '01-monday-board')
await L.closeBoard(page)
// Tuesday
await L.board(page, TUE)
const gt = await X.addWave(w, TUE, '')
let tueTo = '05:00'
await X.typeIn(w, `[data-bfld="ff:${TUE}.${gt}.0.to"]`, tueTo)
out.seatTue = await X.seatPhoneAware(w, `[data-slot="${TUE}.${gt}.0.0.p"]`, id)
const restLines = async () => (await X.boardWarn(page, w)).items.filter(t => t.includes('Vandal'))
let bl = await restLines()
console.log('Tuesday 05:00 Vandal lines', j(bl))
if (!bl.some(t => /rest/i.test(t))) {
  tueTo = '04:00'
  await X.typeIn(w, `[data-bfld="ff:${TUE}.${gt}.0.to"]`, tueTo)
  bl = await restLines()
  console.log('Tuesday 04:00 Vandal lines', j(bl))
}
out.tueTo = tueTo
out.tueFormation = await page.evaluate(([d, g]) => { const f = window.DAYS[d].waves[g].formations[0]; return { to: f.to, ld: f.ld, br: f.br, rl: f.rl } }, [TUE, gt])
out.board = bl
// the board's issues list picture
const sel = KIND === 'phone' ? '#schedBoard #sbWarn' : '#schedBoard .sb-warn'
await R.shot(page, P + '02-tuesday-board-whole')
if (await page.locator(sel + ':visible').count()) await X.pic(page, P + '02-tuesday-board-issues', sel, { pad: 6 })
await L.closeBoard(page)
// Edit Schedule: Tuesday's strip
await L.go(page, 'editsched'); await sleep(700)
const s = await X.stripItems(page, '#eWeek', TUE)
out.edit = s.items.filter(t => t.includes('Vandal'))
await X.pic(page, P + '03-tuesday-edit-strip', `#eWeek [data-dwbox="${TUE}"]`, { pad: 8 })
console.log('Edit strip Vandal', j(out.edit))
// tap the crew-rest warning: the day-before mark
const rest = page.locator(`#eWeek [data-dwbox="${TUE}"] .witem`).filter({ hasText: 'Vandal' }).filter({ hasText: /rest/i }).first()
out.restCount = await rest.count()
if (out.restCount) {
  const tb = await rest.locator('.wtx').first().boundingBox()
  await rest.locator('.wtx').first().evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(200)
  await C.hit(w, rest.locator('.wtx').first()); await sleep(900)
  await R.shot(page, P + '04-after-tap-warning')
  out.marks = await page.evaluate(() => [...document.querySelectorAll('#eWeek *')].filter(e => e.offsetWidth && /crest|dayb|tomorrow|rest/i.test(String(e.className) + (e.title || ''))).map(e => e.tagName + '.' + String(e.className).replace(/\s+/g, '.') + ' title=' + (e.title || '') + ' | ' + (e.innerText || '').replace(/\s+/g, ' ').slice(0, 60)).slice(0, 15))
  console.log('marks', j(out.marks))
  // bring Monday's line into view
  await page.evaluate(([d, g]) => { const e = document.querySelector(`#eWeek .day[data-day="${d}"]`); if (e) e.scrollIntoView({ block: 'center' }) }, [MON, gm])
  await sleep(500)
  await R.shot(page, P + '04-monday-mark')
  out.mondayPucks = await page.evaluate(([i]) => [...document.querySelectorAll(`#eWeek .day[data-day="0"] .puck[data-person="${i}"]`)].filter(e => e.offsetWidth).map(e => e.className.replace(/\s+/g, ' ') + ' | ' + e.title), [id])
  console.log('Monday pucks', j(out.mondayPucks))
  await page.evaluate(([i]) => { const e = document.querySelector(`#eWeek .day[data-day="0"] .puck[data-person="${i}"]`); if (e) e.scrollIntoView({ block: 'center' }) }, [id])
  await sleep(400)
  await X.pic(page, P + '04-monday-mark-puck', `#eWeek .day[data-day="0"] .puck[data-person="${id}"]`, { pad: 80 })
}
// ⓘ of Tuesday
await L.go(page, 'editsched'); await sleep(400)
const bi = page.locator(`#eWeek .dinfobtn[data-dayinfo="${TUE}"]:visible`).first()
if (await bi.count()) {
  await bi.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(150)
  await C.hit(w, bi); await sleep(700)
  out.info = await page.evaluate(() => { const m = document.querySelector('#dayPop'); return m && m.offsetWidth ? m.innerText.replace(/[\s ]+/g, ' ').trim() : 'NO PANEL' })
  await R.shot(page, P + '05-tuesday-info')
  await page.keyboard.press('Escape'); await sleep(400)
  if (await page.locator('#dayPop:visible').count()) await page.mouse.click(4, 300)
  console.log('info (rest part)', (out.info.match(/Warning · [^A]*rest[^]{0,300}/i) || [out.info.slice(-400)])[0])
}
// publish both days, View-only Sched
if (KIND === 'pc') {
  const pm = await X.signAndPublish(w, MON); await L.closeBoard(page)
  const pt = await X.signAndPublish(w, TUE); await L.closeBoard(page)
  out.publish = { mon: pm.p, tue: pt.p, monHead: pm.h.tag + '/' + pm.h.unpub?.text, tueHead: pt.h.tag + '/' + pt.h.unpub?.text }
  console.log('publish', j(out.publish))
  await L.go(page, 'viewsched'); await sleep(900)
  const v = await X.stripItems(page, '#vWeek', TUE)
  out.view = v.items.filter(t => t.includes('Vandal'))
  await X.pic(page, P + '06-tuesday-view-strip', `#vWeek [data-dwbox="${TUE}"]`, { pad: 8 })
  console.log('View Vandal', j(out.view))
  // published face, Edit Schedule too
  await L.go(page, 'editsched'); await sleep(700)
  const s2 = await X.stripItems(page, '#eWeek', TUE)
  out.editAfterPublish = s2.items.filter(t => t.includes('Vandal'))
  console.log('Edit strip after publish', j(out.editAfterPublish))
}
out.errors = w.errors
console.log('errors', j(w.errors))
const { writeFileSync } = await import('node:fs')
writeFileSync(process.env.HP_SHOTS + '/out.json', JSON.stringify(out, null, 1))
await w.browser.close()
