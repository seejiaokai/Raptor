/* rcb2-w2 S08 — the latest commitment wins. Fri = "Monday", Sat = "Tuesday" (early flight 04:30-05:30, Ranger).
   (1) a flying SC line ending 14:00 on Fri; (2) it removed, an accepted duty input 12:00-14:00 filed on the Inputs page;
   (3) a blank-landing flight take-off 09:00 (ends 11:00, earlier than the duty); (4) the duty removed (flight wins), Undo (duty again).
   usage: [PHONE=1] node rcb2-w2-s08.mjs */
const PHONE = process.env.PHONE === '1'
process.env.RCB2_RUN ||= 's08-' + (PHONE ? 'p' : 'd') + '1'
const X = await import('./rcb2-w2-lib.mjs')
const { L, say, sleep, FRI, SAT } = X
const w = await X.open({ phone: PHONE }); const { page, P } = w
const size = PHONE ? '402' : '1536'
const rest = /crew rest|tight/i
const FRI_ISO = '2026-07-17'
const readSat = async (tag) => {
  await L.go(page, 'editsched'); await sleep(400)
  const st = await X.weekWarn(w, '#eWeek', SAT); await X.pic(w, `s08-${tag}-week-${P}`)
  await X.board(w, SAT); const bw = await X.boardWarn(w); await X.pic(w, `s08-${tag}-board-${P}`); await X.closeBoard(w)
  const r = { week: st.items.filter(l => rest.test(l)), board: bw.filter(l => rest.test(l)) }
  say('SAT', tag, JSON.stringify(r)); return r
}
const verdict = (sc, did, exp, r, re, notRe, pic) => {
  for (const k of ['week', 'board']) {
    const ok = r[k].length > 0 && r[k].some(l => re.test(l)) && !r[k].some(l => notRe && notRe.test(l))
    X.row(sc, size, did + ' [' + k + ']', exp, JSON.stringify(r[k]), ok ? 'PASS' : 'FAIL', pic)
  }
}
const ENDED = /Friday ended 15:00.*clear at 03:00/
const NOTFLY = /took off|landed|debrief assumed/
// Saturday's early flight
await X.board(w, SAT); await X.flight(w, SAT, '04:30', '05:30'); await X.closeBoard(w)

// (1) a flying SC line, Ranger on its first MAIN seat, 08:00 - 14:00
await X.board(w, FRI)
const wsc = await X.addWave(w, FRI, 'sc')
await X.typeIn(w, `[data-bfld="ff:${FRI}.${wsc}.0.to"]`, '08:00')
await X.typeIn(w, `[data-bfld="ff:${FRI}.${wsc}.0.ld"]`, '15:00')
say('SC seat', await X.seat(w, `[data-slot="${FRI}.${wsc}.0.0.p"]`, 'bane'))
say('SC formation', await page.evaluate(([d, g]) => { const f = window.DAYS[d].waves[g].formations[0]; return JSON.stringify({ to: f.to, ld: f.ld, shift: f.shift, p: window.PEOPLE[f.aircraft[0].p]?.cs }) }, [FRI, wsc]))
await X.closeBoard(w)
let r = await readSat('a-sc'); verdict('S08 a flying SC line ends 15:00', 'SC line last', '"ended 15:00 ... clear at 03:00", no took off / landed', r, ENDED, NOTFLY, `s08-a-sc-*-${P}.png`)

// (2) delete the SC wave, file the duty input 12:00-14:00 for Ranger on Friday through the Inputs page
await X.board(w, FRI)
await X.press(w, `[data-gdel="${FRI}.${wsc}"]`, { scope: 'board' }); await sleep(400)
const conf = page.getByRole('button', { name: /^(Delete|Yes|Confirm|Remove)/ }).first()
if (await conf.count() && await conf.isVisible().catch(() => false)) { if (PHONE) await conf.tap(); else await conf.click(); await sleep(400) }
say('waves left Fri', await page.evaluate(d => window.DAYS[d].waves.length, FRI))
await X.closeBoard(w)
const T = s => `[data-testid="${s}"]`
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
await L.go(page, 'inputs'); await page.waitForSelector('#inpCal, #inListBtn', { timeout: 8000 }); await sleep(500)
if (!(await page.locator('#inpCal:visible').count())) { const b = page.locator('#inCalBtn, button[aria-label="Calendar"]').first(); if (await b.count()) { await X.press(w, '#inCalBtn, button[aria-label="Calendar"]') } }
for (let i = 0; i < 12; i++) {
  const [name, y] = (await page.locator('#inpCal .ic-mon').innerText()).trim().toLowerCase().split(/\s+/)
  const d = 2026 * 12 + 6 - (+y * 12 + MONTHS.findIndex(x => x.startsWith(name)))
  if (!d) break
  await page.locator(d > 0 ? '#icNext' : '#icPrev').click(); await sleep(300)
}
await X.pic(w, `s08-b-inputs-cal-${P}`)
const day = page.locator(`#inpCal [data-icday="${FRI_ISO}"]`).first()
await day.scrollIntoViewIfNeeded(); if (PHONE) await day.tap({ position: { x: 8, y: 8 } }); else await day.click({ position: { x: 8, y: 8 } }); await sleep(450)
await X.press(w, '#icPopAdd')
await page.waitForSelector('[data-testid="win-inputedit"], #inpEditPop', { timeout: 5000 }); await sleep(300)
await page.selectOption('#inpEditType', 'Duty')
await page.selectOption('#inpEditPerson', 'bane').catch(async e => say('person select problem', String(e).slice(0, 120)))
const ad = page.locator('#inpEditAllday'); if (await ad.count() && await ad.isChecked()) await ad.uncheck()
await page.fill('#inpEditStart', '12:00'); await page.fill('#inpEditEnd', '15:00'); await page.fill('#inpEditRmk', 'rcb2 duty')
await X.pic(w, `s08-b-input-window-${P}`)
await page.locator('#inpEditSave').click(); await sleep(450)
// OIL question if asked (Friday is a working day: usually none)
if (await page.locator(T('oilconf')).count()) { await page.locator(T('oil-no')).click(); await page.locator(T('oilconf-save')).click(); await sleep(400) }
const filed = await page.evaluate(() => window.INPUTS.filter(i => /rcb2 duty/.test(i.remarks || '')).map(i => JSON.stringify({ type: i.type, person: i.person, s: i.s, e: i.e, acc: i.acc, cx: i.cx, date: i.date })))
say('filed input', JSON.stringify(filed))
X.row('S08 b setup', size, 'duty input 12:00-14:00 for Ranger filed through the Inputs page', 'one input stored', JSON.stringify(filed), filed.length === 1 ? 'PASS' : 'FAIL', `s08-b-input-window-${P}.png`)
await X.pic(w, `s08-b-after-save-${P}`)
for (const x of await page.locator('[data-testid="win-inputedit-x"], [data-testid="win-inputsday-x"]').all()) { if (await x.isVisible().catch(() => false)) { await x.click({ force: true }).catch(() => {}); await sleep(300) } }
r = await readSat('b-duty'); verdict('S08 b an accepted duty input ends 15:00', 'duty input last', '"ended 15:00 ... clear at 03:00", no took off / landed', r, ENDED, NOTFLY, `s08-b-duty-*-${P}.png`)

// (3) a blank-landing flight take-off 09:00 on Friday (ends 11:00, earlier than the duty)
await X.gotoWeek(w, '13/07/2026', '2026-07-13')
await X.board(w, FRI); await X.flight(w, FRI, '12:00', ''); await X.closeBoard(w)
r = await readSat('c-flight-earlier'); verdict('S08 c flight earlier than the duty', 'duty still last', 'still "ended 14:00" (duty), no took off / landed', r, ENDED, NOTFLY, `s08-c-flight-earlier-*-${P}.png`)

// (4) remove the duty -> the flight's explanation returns; Undo -> the duty explanation
await L.go(page, 'inputs'); await sleep(500)
if (!(await page.locator('#inListBtn:visible').count())) say('no list button')
await X.press(w, '#inListBtn'); await sleep(500)
if (!(await page.locator('#inRangeAll:visible').count())) { await X.press(w, '#inRangeBtn'); await sleep(250) }
await X.press(w, '#inRangeAll'); await sleep(400)
await page.mouse.click(5, 5).catch(() => {}); await sleep(250)
await X.pic(w, `s08-d-list-${P}`)
say('list rows', await page.locator('tr[data-iid]').count(), 'visible', await page.locator('tr[data-iid]:visible').count(), 'btns', await page.evaluate(() => ['#inListBtn', '#inRangeBtn', '#inRangeAll'].map(s => [s, !!document.querySelector(s), document.querySelector(s)?.offsetWidth])))
const iidD = await page.evaluate(() => (window.INPUTS.find(i => /rcb2 duty/.test(i.remarks || '')) || {}).iid)
say('duty iid', iidD)
const rowc = page.locator('[data-iid="' + iidD + '"]').first()
say('list rows for the duty', await rowc.count())
await rowc.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(300)
const bx = await rowc.boundingBox(); say('row box', JSON.stringify(bx))
if (PHONE) await page.touchscreen.tap(bx.x + bx.width / 2, bx.y + bx.height - 6); else await page.mouse.click(bx.x + bx.width / 2, bx.y + bx.height - 6)
await sleep(500); await X.pic(w, `s08-d-before-delete-${P}`)
await page.locator('#inpEditDel').click(); await sleep(600)
await X.pic(w, `s08-d-after-delete-${P}`)
const left = await page.evaluate(() => window.INPUTS.filter(i => /rcb2 duty/.test(i.remarks || '')).length)
X.row('S08 d setup', size, 'delete the duty input from its own window', 'input gone', 'inputs named rcb2 duty left: ' + left, left === 0 ? 'PASS' : 'FAIL', `s08-d-after-delete-${P}.png`)
r = await readSat('d-duty-removed')
verdict('S08 d the duty removed', 'flight last again', '"Friday took off 12:00 with no landing typed ... ended 14:00 ... clear at 02:00"', r, /Friday took off 12:00 with no landing typed.*ended 14:00.*clear at 02:00/, /ended 15:00/, `s08-d-duty-removed-*-${P}.png`)
// Undo (the top bar's Undo, on Edit Schedule)
await L.go(page, 'editsched'); await sleep(300)
const ub = page.locator('#undoBtn:visible, #sbUndo:visible, [data-undo]:visible').first()
say('undo button count', await page.locator('#undoBtn:visible, #sbUndo:visible, [data-undo]:visible').count(), 'disabled', await ub.isDisabled().catch(() => 'n/a'))
if (await ub.count() && !(await ub.isDisabled())) { if (PHONE) await ub.tap(); else await ub.click(); await sleep(800) }
const back = await page.evaluate(() => window.INPUTS.filter(i => /rcb2 duty/.test(i.remarks || '')).length)
X.row('S08 e Undo', size, 'Undo after the delete', 'input back', 'inputs named rcb2 duty: ' + back, back === 1 ? 'PASS' : (back === 0 ? 'NOT WALKED' : 'FAIL'), `s08-e-undo-${P}.png`)
await X.pic(w, `s08-e-undo-${P}`)
r = await readSat('e-undo'); verdict('S08 e after Undo', 'duty last again', '"ended 14:00"', r, ENDED, NOTFLY, `s08-e-undo-*-${P}.png`)
await X.fin(w)
