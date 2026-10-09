// S18 — switching members' filing off and back on after filing (member + admin tabs of one world, desktop).
// The unanswered placeholder Duty is reached the documented way: filed on a weekday, then declared a public holiday.
import { setPerson, closeWins, world, closeAll, toInputs, fileInput, pic, T, oilAnswer, signIn, sleep, readInputs, observe, URL_, declareHoliday, issue, lwMap, crowdCount, listAll, listSearch, listRow, membersSwitch, openDay } from './aa-A-lib.mjs'
import * as L from './lib.mjs'
const bellLit = async page => { await closeWins(page); return /(^|\s)on(\s|$)/.test(await page.locator('#notifyBell').getAttribute('class') || '') }
async function memberView(A, rm, tag) {
  const out = {}
  await toInputs(A); await listAll(A); await setPerson(A, 'all'); await listSearch(A, rm)
  const row = listRow(A, rm)
  out.rowText = (await row.innerText()).replace(/\s+/g, ' ')
  out.pencil = await row.locator('[data-edit]').count()
  out.oilBtn = await row.locator('.roil').count()
  out.deleteX = await row.locator('.rmx').count()
  await pic(A, `${tag}-list`)
  // the calendar card: open the day, click the bar
  await A.locator('#inCalBtn').click(); await sleep(400)
  await openDay(A, '2026-07-15')
  const bar = A.locator('[data-testid="win-inputsday"] [data-iid], [data-testid="win-inputsday"] .sd-row').first()
  out.dayCardRows = await A.locator('[data-testid="win-inputsday"]').innerText().then(t => t.replace(/\s+/g, ' ').slice(0, 300)).catch(() => '')
  await bar.click({ timeout: 3000 }).catch(() => {}); await sleep(600)
  out.editor = await A.evaluate(() => { const p = document.querySelector('#inpEditPop'); if (!p || p.hidden || !p.offsetParent) return null; return { save: !!p.querySelector('#inpEditSave'), del: !!p.querySelector('#inpEditDel'), text: p.innerText.replace(/\s+/g, ' ').slice(0, 300) } })
  await pic(A, `${tag}-card`)
  await closeWins(A)
  return out
}
for (const ph of ['allavail', 'all']) {
  const rm = 'walkS18 ' + ph
  const w = await world({ who: 'us', size: 'd' })
  const A = w.page
  await toInputs(A)
  await fileInput(A, { iso: '2026-07-15', type: 'Duty', person: ph, remarks: rm, start: '09:00', end: '12:00' })
  const B = await w.ctx.newPage()
  B.on('pageerror', e => w.errs.push('B PAGEERROR ' + e)); B.on('console', m => { if (m.type() === 'error') w.errs.push('B CONSOLE ' + m.text()) })
  await B.setViewportSize({ width: 1440, height: 900 })
  await B.goto(URL_); await signIn(B, 'ad'); await toInputs(B)
  await declareHoliday(B, '2026-07-15', 'ph', 'Walk PH')
  const fresh = async P => { await P.reload(); await sleep(1000); if (await P.locator('#luser').count()) await signIn(P, P === A ? 'us' : 'ad') }
  await fresh(A)
  console.log(ph, 'switch ON: bell lit =', await bellLit(A))
  const on = await memberView(A, rm, `s18-${ph}-1-on`)
  console.log(ph, 'switch ON member view:', JSON.stringify(on))
  // admin turns the switch off
  console.log(ph, 'admin switch now', await membersSwitch(B, false))
  await fresh(A)
  console.log(ph, 'switch OFF: bell lit =', await bellLit(A))
  await pic(A, `s18-${ph}-2-off-bell`)
  const off = await memberView(A, rm, `s18-${ph}-3-off`)
  console.log(ph, 'switch OFF member view:', JSON.stringify(off))
  // admin sees OIL? on the List row
  await fresh(B); await toInputs(B); await listAll(B); await listSearch(B, rm)
  const arow = (await listRow(B, rm).innerText()).replace(/\s+/g, ' ')
  console.log(ph, 'admin row while OFF:', arow, '| OIL button:', await listRow(B, rm).locator('.roil').count())
  await pic(B, `s18-${ph}-4-admin-row`)
  // admin's OIL Earn window: "not answered yet"
  try {
    await L.go(B, 'editsched'); await L.board(B, 2)
    await L.oilMode(B, true); await sleep(500)
    const cnt = B.locator('#schedBoard .oilcount').first()
    const has = await cnt.count()
    if (has) { await cnt.click(); await sleep(700) }
    const aw = await B.evaluate(() => { const w = document.querySelector('.availwin'); return w ? w.innerText.replace(/\s+/g, ' ').slice(0, 600) : null })
    console.log(ph, 'OIL Earn: count present', has, '| window text:', aw)
    await pic(B, `s18-${ph}-5-oil-earn-window`)
    await L.closeBoard(B)
  } catch (e) { console.log(ph, 'OIL Earn step failed', String(e).slice(0, 200)) }
  // switch back on
  await toInputs(B)
  console.log(ph, 'admin switch now', await membersSwitch(B, true))
  await fresh(A)
  console.log(ph, 'switch back ON: bell lit =', await bellLit(A))
  const on2 = await memberView(A, rm, `s18-${ph}-6-back-on`)
  console.log(ph, 'switch back ON member view:', JSON.stringify(on2))
  // admin answers Yes and issues
  await fresh(B); await toInputs(B); await listAll(B); await listSearch(B, rm)
  await listRow(B, rm).locator('.roil').click(); await sleep(500)
  await oilAnswer(B, 'yes')
  console.log(ph, 'admin answered Yes:', JSON.stringify((await readInputs(B, rm))[0].oil))
  console.log(ph, 'ORIG', JSON.stringify(await issue(B, 2)))
  const m = await lwMap(B, '2026-07-15'); console.log(ph, 'credits on Wed 15 Jul (baseline flying 16):', crowdCount(m))
  console.log(ph, 'errs', JSON.stringify(w.errs))
  await w.ctx.close()
}
await closeAll()
