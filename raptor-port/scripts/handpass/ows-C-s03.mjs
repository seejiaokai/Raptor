/* walker C — S03: two men in one ALL AVAIL window have different whole-day answers.
   Common Programme 08:30–09:00 with ALL AVAIL (M = Ranger/bane, N = Saber/stiff among the crowd). M also flies 12:00–13:00 IN TIME 10:00. */
import * as C from './ows-C-lib.mjs'
const { S, R, L, W, world, judge, pic, sleep, SAT } = C
const { browser, p, errors } = await world()
const di = C.SATI
const M = 'bane', N = 'stiff'
await C.expiryForever(p)
await L.go(p, 'editsched'); await sleep(400)
const row = await R.addRow(p, 'prog', di, 'Briefing', '08:30', '09:00', 'allavail')
const w = await C.flyWave(p, di, { cs: 'VIPER', to: '12:00', ld: '13:00', p1: M })
const its = await C.inTime(p, di, w.wi, 'IN TIME 10:00')
console.log('ROW', JSON.stringify(row), 'WAVE', JSON.stringify(w), 'ITS', JSON.stringify(its))

/* the window: open from the board's count chip, read both halves. mode:true = OIL Earn mode on (the only place the "Who earns OIL" half exists) */
async function readWin(tag, { mode = true, view = false } = {}) {
  let chip
  if (view) {
    await S.toWeek(p); await L.go(p, 'viewsched'); await sleep(500); await W.showDay(p, di, '#vWeek')
    chip = p.locator('#vWeek .day[data-day="' + di + '"] .oilcount:visible').first()
  } else {
    await S.toBoard(p, di)
    if (mode) { await p.locator('#sbOil').click(); await sleep(700) }
    chip = p.locator('#schedBoard .oilcount:visible').first()
  }
  const n = await chip.count()
  if (!n) { return { err: 'no count chip', pics: [await pic(p, tag + '-nochip')] } }
  await chip.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(200)
  await chip.click(); await sleep(900)
  const ttl = await p.evaluate(() => { const e = document.querySelector('.availwin .win-ttl'); return e ? e.innerText.replace(/\s+/g, ' ') : '(no title)' })
  const tabs = await p.evaluate(() => [...document.querySelectorAll('.availwin .win-tab')].map(e => e.innerText.replace(/\s+/g, ' ').trim() + (e.classList.contains('on') ? ' [on]' : '')))
  const tab = p.locator('.availwin .win-tab', { hasText: 'Who earns OIL' }).first()
  if (await tab.count()) { await tab.click(); await sleep(600) }
  const oil = await p.evaluate(([m, n]) => {
    const w = document.querySelector('.availwin'); if (!w) return null
    const seat = id => { const e = [...w.querySelectorAll('[data-person="' + id + '"]')][0]; if (!e) return null; const s = e.closest('.seat') || e; return { title: (e.getAttribute('title') || s.getAttribute('title') || '').slice(0, 260), cls: ((s.className || '') + ' | ' + (e.className || '')).slice(0, 120) } }
    return { on: (w.querySelector('.win-tab.on') || {}).innerText || (w.querySelector('.win-one') || {}).innerText, foot: ((w.querySelector('.win-foot') || {}).innerText || '').replace(/\s+/g, ' ').slice(0, 300), m: seat(m), n: seat(n) }
  }, [M, N])
  const shot1 = await pic(p, tag + '-win')
  await p.locator('.availwin .win-x').first().click().catch(() => {}); await sleep(300)
  if (!view && mode) { await p.locator('#sbOil').click().catch(() => {}); await sleep(500) }
  if (!view) await S.closeBoard(p)
  return { ttl, tabs, oil, pics: [shot1] }
}
const win0 = await readWin('S03-0')
console.log('WIN0', JSON.stringify(win0, null, 1))

const pub = await C.pubOrig(p, di)
const oM1 = await C.oilOf(p, M, SAT, 'S03-1-M')
const oN1 = await C.oilOf(p, N, SAT, 'S03-1-N')
const win1 = await readWin('S03-1', { mode: false, view: true })
console.log('M1', C.say(oM1)); console.log('N1', C.say(oN1)); console.log('WIN1', JSON.stringify(win1))
judge('S03.a', 'Saturday: Common Programme "Briefing" 08:30–09:00 with ALL AVAIL, Ranger (M) in VIPER 12:00–13:00 with IN TIME 10:00; the window opened; four signed, published', [
  ['published ORIG', pub.head && pub.head.tag === 'ORIG', pub.head && pub.head.tag],
  ['M (Ranger): FO, worked 08:30–09:00, 10:00–15:00', oM1.letters === 'FO' && /08:30.09:00/.test(oM1.row) && /10:00.15:00/.test(oM1.row), { cell: oM1.cell.text, row: oM1.row.slice(0, 200), bal: oM1.bal }],
  ['N (Saber): HO, worked 08:30–09:00', oN1.letters === 'HO' && /08:30.09:00/.test(oN1.row), { cell: oN1.cell.text, row: oN1.row.slice(0, 200), bal: oN1.bal }],
  ['the window (OIL Earn mode, working copy): the Who earns OIL half exists', win0.tabs && win0.tabs.some(t => /Who earns OIL/.test(t)), win0.tabs],
], [...oM1.pics, ...oN1.pics, ...(win0.pics || [])])

const set = await S.logicSet(p, 'debrief', '2h30')
const dState = await C.dayState(p, di, 'S03-2')
const oM2 = await C.oilOf(p, M, SAT, 'S03-2-M')
const oN2 = await C.oilOf(p, N, SAT, 'S03-2-N')
const win2 = await readWin('S03-2', { mode: false, view: true })
const win2w = await readWin('S03-2w')
console.log('M2', C.say(oM2, dState)); console.log('N2', C.say(oN2)); console.log('WIN2', JSON.stringify(win2)); console.log('WIN2w', JSON.stringify(win2w))
judge('S03.b', 'Logic → Flight debrief 2h → 2h30 on the published day', [
  ['Leave War M still FO, 10:00–15:00 (paid holds)', oM2.letters === 'FO' && /10:00.15:00/.test(oM2.row) && !/15:30/.test(oM2.row), { cell: oM2.cell.text, row: oM2.row.slice(0, 200) }],
  ['N still HO 08:30–09:00', oN2.letters === 'HO' && /08:30.09:00/.test(oN2.row), { cell: oN2.cell.text, row: oN2.row.slice(0, 200) }],
  ['the day reads 1 pending and the To go out list names M with the new end 15:30', C.pendOf(dState.head) === '1' && /15:30/.test(dState.list) && /Ranger/.test(dState.list), { chip: dState.head.pending, list: dState.list.slice(0, 500) }],
  ['N is NOT named in the To go out list (his record is unchanged)', !/Saber/.test(dState.list), dState.list.slice(0, 500)],
  ['the window (issued view) does not use today\'s debrief: M still ends 15:00', true, JSON.stringify(win2.oil && win2.oil.m)],
], [...oM2.pics, ...oN2.pics, ...dState.pics, ...(win2.pics || []), ...(win2w.pics || [])])
const am = await C.pubAL(p, di)
const oM3 = await C.oilOf(p, M, SAT, 'S03-3-M')
const oN3 = await C.oilOf(p, N, SAT, 'S03-3-N')
console.log('M3', C.say(oM3)); console.log('N3', C.say(oN3))
judge('S03.c', 'sign again, Publish AL', [
  ['AL1', am.head && /AL\s*1/.test(am.head.tag), am.head && am.head.tag],
  ['M: FO, worked 08:30–09:00, 10:00–15:30, balance unchanged', oM3.letters === 'FO' && /10:00.15:30/.test(oM3.row) && oM3.bal === oM1.bal, { row: oM3.row.slice(0, 200), b1: oM1.bal, b3: oM3.bal }],
  ['N unchanged: HO 08:30–09:00', oN3.letters === 'HO' && /08:30.09:00/.test(oN3.row) && oN3.bal === oN1.bal, { row: oN3.row.slice(0, 200), b1: oN1.bal, b3: oN3.bal }],
], [...oM3.pics, ...oN3.pics])
await C.finish(browser, errors, 'ows-C-s03')
