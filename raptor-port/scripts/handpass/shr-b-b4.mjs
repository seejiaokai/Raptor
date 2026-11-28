// Walker b — B4 (F-S9): three men (Ranger, Hex, Outlaw), an all-day leave Mon 13 – Wed 15 Jul filed on the Inputs page;
// the rows typed in turn in TUESDAY's block of the week, the caret never leaving it (F-S9's presses); then Monday's and
// Wednesday's blocks and the Leave War grid.
// EXPECTED: Ranger own 09:00–11:00 "A2" Mon–Wed; Hex own, all day, "B"; Outlaw alone on the first leave, all day, "C" —
// no fourth leave; the other days agree at once.
console.log('shr-b-b4 v1')
const SZ = process.env.SZ || 'desk', ENG = process.env.ENG || 'chromium', cfg = `${SZ} ${ENG}`
const B = await (await import('./shr-b-lib.mjs')).setup(`b4-${SZ}-${ENG}`)
const { start, go, sleep, log, weekRows, weekCell, typeIn, pic, J, judge, showDay, caret, openDay, ids, press, answerAsks, shownToast } = B
const c = 'B4', P = `b4-${SZ}-${ENG}`
const OUTLAW = 'casper'
const WHO = ['bane', 'rocky', OUTLAW]
const NM = { bane: 'Ranger', rocky: 'Hex', casper: 'Outlaw' }
const st = page => page.evaluate(who => {
  const nm = { bane: 'Ranger', rocky: 'Hex', casper: 'Outlaw' }
  const hm = m => m == null ? '' : String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0')
  return window.INPUTS.filter(r => (r.people || []).some(x => who.includes(x.p)) && r.type === 'LL' && /^Jul 1[3-5]$/.test(r.date)).map(r => `${(r.people || []).map(x => nm[x.p] || x.p).join('+')} ${r.date}${r.endDate ? '→' + r.endDate : ''} ${r.allday ? 'allday' : hm(r.s) + '-' + hm(r.e)} "${r.remarks || ''}" [${r.iid}]`)
}, WHO)
const rows3 = async (page, di) => (await weekRows(page, di)).filter(r => /^(Ranger|Hex|Outlaw) /.test(r))
let w
try {
  w = await start(SZ, ENG)
  /* ---- the fixture: + Input on Monday, LL, three people, all day, the calendar's Wednesday tapped for the end ---- */
  await openDay(w, '2026-07-13')
  const before = await ids(w.page)
  await press(w, '#icPopAdd')
  await w.page.locator('#inpEditPop #inpEditType').waitFor()
  await w.page.selectOption('#inpEditPop #inpEditType', 'LL')
  await press(w, '#inpEditPop [data-testid="pp-several"]')
  for (const id of WHO) if ((await w.page.locator(`#inpEditPop [data-pp="${id}"]`).getAttribute('aria-pressed')) !== 'true') await press(w, `#inpEditPop [data-pp="${id}"]`)
  const lit = await w.page.evaluate(() => [...document.querySelectorAll('#inpEditPop [data-pp][aria-pressed="true"]')].map(b => b.getAttribute('data-pp')))
  for (const id of lit) if (!WHO.includes(id)) await press(w, `#inpEditPop [data-pp="${id}"]`)
  if (await w.page.locator('#inpEditSpan [data-span="all"]').count()) await press(w, '#inpEditSpan [data-span="all"]')
  const wed = w.page.locator('[data-testid="inpEdCal-day-2026-07-15"]').first()
  if (await wed.count()) await press(w, wed)
  const reads = await w.page.evaluate(() => (document.querySelector('#inpEditPop .rc-read')?.textContent || '').trim())
  await press(w, '#inpEditSave')
  const asked = await answerAsks(w); const said = await shownToast(w.page)
  if (await w.page.locator('[data-testid="win-inputsday-x"]').count()) await press(w, '[data-testid="win-inputsday-x"]')
  const made = (await ids(w.page)).filter(x => !before.includes(x))
  const s0 = await st(w.page)
  log(c, `filed: dates read ${JSON.stringify(reads)}; asked ${J(asked)}; note ${J(said)}; new ${J(made)}; store ${J(s0)}`)
  if (made.length !== 1 || s0.length !== 1 || !/Ranger\+Hex\+Outlaw Jul 13→Jul 15 allday/.test(s0[0])) throw new Error('fixture not one all-day leave Mon–Wed for three: ' + J(s0))
  await go(w.page, 'editsched'); await sleep(600)
  const TUE = 1
  await showDay(w.page, TUE); await sleep(300)
  const steps = [{ step: 'filed', store: s0, screen: await rows3(w.page, TUE) }]
  log(c, 'Tuesday rows ' + J(steps[0].screen))
  const pics = [await pic(w, c, `${P}-0-tue-filed`, [`#eWeek .day[data-day="${TUE}"] .sec-unav`], steps[0].screen)]
  const cellText = sel => w.page.evaluate(s => (document.querySelector(s)?.textContent || '').trim(), sel)
  const step = async (pid, f, v, how = 'Tab') => {
    const sel = await weekCell(w.page, TUE, pid, f)
    if (!sel) throw new Error(`no ${f} cell for ${NM[pid]} on Tuesday`)
    await typeIn(w, sel, v)
    await w.page.keyboard.press('Tab'); await sleep(650)
    const car = await caret(w.page)
    const s = { step: `${NM[pid]} ${f} ${JSON.stringify(v)} Tab`, typedIn: sel.match(/data-inp="([^"]+)"/)[1], store: await st(w.page), screen: await rows3(w.page, TUE), caret: car, arrivedShows: car && car !== 'BODY' ? await cellText(`[data-inp="${car}"]`) : null }
    steps.push(s); log(c, J(s))
    return s
  }
  await step('bane', 'str', '0900')
  await step('bane', 'end', '1100')
  await step('bane', 'rmks', 'A')
  await step('rocky', 'str', '1300')
  await step('rocky', 'rmks', 'B')
  await step('bane', 'rmks', 'A2')
  await step('rocky', 'str', '')
  await step(OUTLAW, 'rmks', 'C')
  pics.push(await pic(w, c, `${P}-1-tue-held`, [`#eWeek .day[data-day="${TUE}"] .sec-unav`], steps.at(-1).screen, { noScroll: true }))
  await w.page.mouse.click(3, 120); await sleep(800)
  const left = { step: 'clicked away', store: await st(w.page), screen: await rows3(w.page, TUE) }
  steps.push(left); log(c, J(left))
  pics.push(await pic(w, c, `${P}-2-tue-left`, [`#eWeek .day[data-day="${TUE}"] .sec-unav`], left.screen))
  const other = {}
  for (const [name, di] of [['Mon', 0], ['Wed', 2]]) {
    await showDay(w.page, di); await sleep(250)
    other[name] = await rows3(w.page, di)
    pics.push(await pic(w, c, `${P}-3-${name.toLowerCase()}`, [`#eWeek .day[data-day="${di}"] .sec-unav`], other[name]))
  }
  log(c, 'Mon / Wed rows ' + J(other))
  /* the Leave War grid: the three men's cells Mon–Wed */
  await go(w.page, 'leavewar'); await sleep(1200)
  const mon = w.page.locator('[data-testid="month-Jul"]').first()
  if (await mon.count()) { await mon.click(); await sleep(1200) }
  const cells = await w.page.evaluate(who => { const out = {}; for (const p of who) for (const d of ['13', '14', '15']) { const td = document.querySelector(`[data-testid="cell-${p}-2026-07-${d}"]`); out[`${p}-${d}`] = td ? (td.innerText || '').replace(/\s+/g, ' ').trim() + ' {' + td.className + '}' : null } return out }, WHO)
  log(c, 'Leave War cells ' + J(cells))
  const cellSel = WHO.map(p => `[data-testid="cell-${p}-2026-07-14"]`)
  await w.page.evaluate(s => document.querySelector(s)?.scrollIntoView({ block: 'center', inline: 'center' }), cellSel[0]); await sleep(300)
  pics.push(await pic(w, c, `${P}-4-leavewar`, WHO.flatMap(p => ['13', '14', '15'].map(d => `[data-testid="cell-${p}-2026-07-${d}"]`)), cells, { noScroll: true }))
  /* judge */
  const L2 = left.store
  const rOwn = L2.filter(x => /^Ranger Jul 13→Jul 15 09:00-11:00 "A2"/.test(x))
  const hOwn = L2.filter(x => /^Hex Jul 13→Jul 15 allday "B"/.test(x))
  const oOwn = L2.filter(x => /^Outlaw Jul 13→Jul 15 allday "C"/.test(x))
  const want = { Ranger: '09:00-11:00 "A2"', Hex: '- "B"', Outlaw: '- "C"' }
  const dayOk = rows => ['Ranger', 'Hex', 'Outlaw'].every(n => rows.filter(r => r.startsWith(n + ' ')).length === 1 && rows.find(r => r.startsWith(n + ' ')).includes(want[n]))
  const firstStays = oOwn.length === 1 && oOwn[0].includes(`[${made[0]}]`)
  const ok = L2.length === 3 && rOwn.length === 1 && hOwn.length === 1 && oOwn.length === 1 && firstStays && dayOk(left.screen) && dayOk(other.Mon) && dayOk(other.Wed)
  judge(c, cfg, ok ? 'PASS' : 'FAIL', { storeAfter: L2, tue: left.screen, mon: other.Mon, wed: other.Wed, outlawOnFirst: firstStays, steps: steps.map(s => ({ step: s.step, store: s.store, screen: s.screen, caret: s.caret, arrivedShows: s.arrivedShows })) }, pics.join(', '))
  judge(c + ' arrival values and Leave War cells', cfg, 'RECORD', { arrival: steps.slice(1).map(s => `${s.step} → caret ${s.caret} shows ${JSON.stringify(s.arrivedShows)}`), leaveWarCells: cells }, pics.at(-1))
} catch (e) { judge(c, cfg, 'NOT WALKED', 'error: ' + String(e.message || e).split('\n')[0].slice(0, 400)) }
try { await w?.ctx.close() } catch {}
await B.done()
