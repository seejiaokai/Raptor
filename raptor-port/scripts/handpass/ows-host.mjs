/* [OIL-WORK-START] (D591, D592) — the HOST's own walk: the finding itself (W1 of the Codex stack check), before and
   after. Written as assertions of the RIGHT behaviour, so the same script FAILS on the build as it stood (`main`) and
   PASSES on the fixed one — running it on both is the before / after, and re-running it later is the re-walk
   (bug-check order §5). Every fixture goes through the app's own controls; window.* is only read (§7.7).
   Env: HP_URL (the served build), HP_SHOTS (pictures), HP_OUT (the JSON part file).
     H1  Ranger on a Saturday flying line 10:00–11:15, published: a full day, worked 07:00–13:15
     H2  Logic → "Nominal report before T/O" 3h → 2h30: the Leave War cell and the tracker do NOT move;
         the day reads 1 pending, the four sign-offs fall, the To go out list names the value and the man
     H3  the published face (View-only Sched) still wears the full-day green edge
     H4  the amendment goes out: now a half day, worked 07:30–13:15; nothing pending
     H5  Logic back to 3h: the AL keeps its half day; the day reads pending again
     H6  a reload: the same
     H7  Sunday: a line 12:00–13:00, no in-time → half day (09:00–15:00); "+ In-time / Rally" typed 08:30 on the working
         copy → pending, the half day holds; the amendment goes out → a full day, worked 08:30–15:00 */
import * as S from './stk-A-lib.mjs'
const { world, L, W, pic, judge, savePart, sleep } = S
const { browser, p, errors } = await world()
const SAT = 5, SUN = 6
const letters = c => (/\b(HO|FO)\b/.exec((c && c.text) || '') || [])[1] || (c && c.text) || String(c)

async function oilOf(id, iso, name) {
  await S.lwOpenMonth(p, 'JUL')
  const cell = await S.lwCellOf(p, id, iso)
  await p.evaluate(([i, d]) => { const c = document.querySelector(`[data-testid="cell-${i}-${d}"]`); if (c) c.scrollIntoView({ block: 'center', inline: 'center' }) }, [id, iso]); await sleep(300)
  const picCell = await pic(p, name + '-cell')
  const row = await S.oilRow(p, id)
  const picRow = await pic(p, name + '-tracker')
  await S.closeOil(p)
  /* the record itself: the credit's worked times, as the war holds them (read only) */
  const rec = await p.evaluate(([i, d]) => { try { const st = window.lwState ? window.lwState() : null; const w = st && st.wars && st.wars[0]; const l = w && w.recs && w.recs[i] && w.recs[i][d]; return l ? l.filter(r => r.oil === 'auto').map(r => `${r.code} ${(r.spans || []).map(s => s.join('-')).join(',')}`).join(' | ') : '' } catch (e) { return 'n/a' } }, [id, iso])
  return { cell, letters: letters(cell), row, rec, pics: [picCell, picRow] }
}
async function dayState(di, name) {
  await S.toWeek(p); await W.showDay(p, di)
  const head = await S.dayHead(p, di)
  /* the WAITING-TO-GO-OUT chip only: the same class also carries the changes window's "N changes" chip (D168) */
  head.pending = await p.evaluate(i => { const c = document.querySelector(`#eWeek .day[data-day="${i}"] .dpend:not(.dnew):not(.dchg)`); return c && c.offsetParent !== null ? c.innerText.replace(/\s+/g, ' ').trim() : '' }, di)
  const picHead = await pic(p, name + '-day')
  /* the To go out list: the day's own "N pending" chip is its door */
  let list = ''
  const chip = p.locator(`#eWeek .day[data-day="${di}"] .dpend:not(.dnew):not(.dchg)`).first()
  if (await chip.count() && await chip.isVisible()) {
    await chip.click(); await sleep(600)
    list = await p.evaluate(() => { const e = document.querySelector('.pl-list'); return e ? e.innerText.replace(/\s+/g, ' ').trim() : '(no list drawn)' })
    const picList = await pic(p, name + '-togoout')
    const x = p.locator('[data-chgclose]:visible, .chgwin [aria-label="Close"]:visible, .chgwin .win-x:visible').first()
    if (await x.count()) { await x.click().catch(() => {}); await sleep(300) } else { await p.keyboard.press('Escape'); await sleep(300) }
    return { head, list, pics: [picHead, picList] }
  }
  return { head, list, pics: [picHead] }
}
const pend = h => (/\d+/.exec((h && h.pending) || '') || ['0'])[0]

/* ---------- H1 ---------- */
await L.go(p, 'editsched'); await sleep(400)
const w = await S.addFlyingWave(p, SAT, { cs: 'VIPER', to: '10:00', ld: '11:15', p1: 'bane' })
const pub = await S.publishNew(p, SAT); await S.closeBoard(p)
const o1 = await oilOf('bane', S.SAT, 'H1')
judge('H1', 'Ranger on a new Saturday flying line VIPER, take-off 10:00, landing 11:15, no in-time; the four signed, published', [
  ['he was seated through the crew list', w.got[0] === 'bane', w.got],
  ['published as ORIG', pub.head && pub.head.tag === 'ORIG', pub.head && pub.head.tag],
  ['Leave War: a full day (FO)', o1.letters === 'FO', o1.cell.text],
  ['the OIL tracker shows the day, worked 07:00–13:15', /07:00.13:15/.test(o1.row), o1.row.slice(0, 200)],
], o1.pics)

/* ---------- H2 ---------- */
const set = await S.logicSet(p, 'reportLead', '2h30')
const lg = await S.logicGet(p)
const picLg = await pic(p, 'H2-logic')
const d2 = await dayState(SAT, 'H2')
const o2 = await oilOf('bane', S.SAT, 'H2')
judge('H2', 'Logic → Edit rules → "Nominal report before T/O" 3h → 2h30; back to the Saturday and the Leave War', [
  ['the value really changed', lg.reportLead === 150, { set, lead: lg.reportLead }],
  ['Leave War: STILL a full day', o2.letters === 'FO', o2.cell.text],
  ['the tracker still says worked 07:00–13:15', /07:00.13:15/.test(o2.row), o2.row.slice(0, 200)],
  ['the Saturday reads 1 pending', pend(d2.head) === '1', d2.head && d2.head.pending],
  ['the four sign-offs fell', W.signsEmpty(d2.head), d2.head && d2.head.signs],
  ['the To go out list names the Logic value, old and new', /Nominal report before T\/O/.test(d2.list) && /3h/.test(d2.list) && /2h30/.test(d2.list), d2.list.slice(0, 260)],
  ['…and the man, full day → half day', /Ranger/.test(d2.list) && /full day/.test(d2.list) && /half day/.test(d2.list), d2.list.slice(0, 260)],
], [picLg, ...d2.pics, ...o2.pics])

/* ---------- H3 — the published face ---------- */
await S.toWeek(p); await L.go(p, 'viewsched'); await sleep(500); await W.showDay(p, SAT, '#vWeek')
const face = await p.evaluate(i => { const d = document.querySelector(`#vWeek .day[data-day="${i}"]`); if (!d) return null
  const pk = [...d.querySelectorAll('[data-person="bane"]')].find(e => e.offsetParent !== null)
  return { tag: (d.querySelector('.verchip') || {}).innerText || '', puck: pk ? pk.className : '(no puck)', title: pk ? pk.getAttribute('title') || '' : '' } }, SAT)
const picFace = await pic(p, 'H3-viewonly')
judge('H3', 'View-only Sched, the published Saturday, with the Logic value still changed', [
  ['Ranger\'s puck is drawn', !!face && face.puck !== '(no puck)', face],
  ['it wears the FULL-day green edge it went out with', !!face && /oilbar-fo/.test(face.puck), face && face.puck],
], [picFace])

/* ---------- H4 — the amendment ---------- */
const am = await S.publishAm(p, SAT); await S.closeBoard(p)
const d4 = await dayState(SAT, 'H4')
const o4 = await oilOf('bane', S.SAT, 'H4')
judge('H4', 'the four sign again and the amendment is published', [
  ['it went out as AL1', am.head && /AL\s*1/.test(am.head.tag), am.head && am.head.tag],
  ['Leave War: now a half day (HO)', o4.letters === 'HO', o4.cell.text],
  ['the tracker says worked 07:30–13:15', /07:30.13:15/.test(o4.row), o4.row.slice(0, 200)],
  ['nothing pending', pend(d4.head) === '0', d4.head && d4.head.pending],
], [...d4.pics, ...o4.pics])

/* ---------- H5 — the value put back ---------- */
await S.logicSet(p, 'reportLead', '3h')
const d5 = await dayState(SAT, 'H5')
const o5 = await oilOf('bane', S.SAT, 'H5')
judge('H5', 'Logic back to 3h', [
  ['Leave War: the amendment keeps its half day', o5.letters === 'HO', o5.cell.text],
  ['the day reads 1 pending again (it would be a full day)', pend(d5.head) === '1', d5.head && d5.head.pending],
  ['the list says half day → full day', /half day/.test(d5.list) && /full day/.test(d5.list), d5.list.slice(0, 260)],
], [...d5.pics, ...o5.pics])

/* ---------- H6 — a reload ---------- */
await S.reloadAs(p, 'a'); await sleep(600)
const d6 = await dayState(SAT, 'H6')
const o6 = await oilOf('bane', S.SAT, 'H6')
judge('H6', 'the page reloaded, signed in again', [
  ['Leave War: still the half day', o6.letters === 'HO', o6.cell.text],
  ['still 1 pending', pend(d6.head) === '1', d6.head && d6.head.pending],
], [...d6.pics, ...o6.pics])

/* ---------- H7 — an entered in-time, Sunday ---------- */
await S.toWeek(p)
const w7 = await S.addFlyingWave(p, SUN, { cs: 'COBRA', to: '12:00', ld: '13:00', p1: 'stiff' })
const pub7 = await S.publishNew(p, SUN); await S.closeBoard(p)
const o7a = await oilOf('stiff', S.SUN, 'H7a')
await S.toBoard(p, SUN)
await S.addItBtn(p, SUN, w7.wi)
await S.setItLine(p, SUN, w7.wi, 0, 'IN TIME 0830')
const lines = await S.intimes(p, SUN, w7.wi)
await S.closeBoard(p)
const d7 = await dayState(SUN, 'H7b')
const o7b = await oilOf('stiff', S.SUN, 'H7b')
const am7 = await S.publishAm(p, SUN); await S.closeBoard(p)
const o7c = await oilOf('stiff', S.SUN, 'H7c')
judge('H7', 'Sunday: a new line COBRA 12:00–13:00 for the second man, published; then "+ In-time / Rally" typed IN TIME 0830; then the amendment', [
  ['seated and published', w7.got[0] === 'stiff' && pub7.head && pub7.head.tag === 'ORIG', { got: w7.got, tag: pub7.head && pub7.head.tag }],
  ['with no in-time: a half day, worked 09:00–15:00', o7a.letters === 'HO' && /09:00.15:00/.test(o7a.row), { cell: o7a.cell.text, row: o7a.row.slice(0, 160) }],
  ['the line reads IN TIME 0830 (as the box folds it)', lines.length === 1 && /08:?30/.test(lines[0]), lines],
  ['typed on the working copy: the day reads pending', pend(d7.head) !== '0', d7.head && d7.head.pending],
  ['…and the published half day has not moved', o7b.letters === 'HO' && /09:00.15:00/.test(o7b.row), { cell: o7b.cell.text, row: o7b.row.slice(0, 160) }],
  ['the amendment goes out', am7.head && /AL\s*1/.test(am7.head.tag), am7.head && am7.head.tag],
  ['now a FULL day, worked 08:30–15:00', o7c.letters === 'FO' && /08:30.15:00/.test(o7c.row), { cell: o7c.cell.text, row: o7c.row.slice(0, 160) }],
], [...o7a.pics, ...d7.pics, ...o7b.pics, ...o7c.pics])

console.log('ERRORS', JSON.stringify(errors))
savePart('ows-host', { errors })
await browser.close()
