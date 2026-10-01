/* WALKER B — Astra's scenario 10, its published half: the ALL AVAIL window drops the hidden REASON, not the man — and
   on the published face only once the amendment is out. An ALL AVAIL puck is put on Tuesday's ground row "OPS BRIEFER /
   EP SUP" (the board's seat and crew list); its crowd holds Outlaw, whose one warning is the crew-rest breach. */
import * as B from './wh-b-lib.mjs'
import * as SL from './seat-lib.mjs'
import * as A from './p7-a-lib.mjs'
const { L, W, TUE, judge, row, pic, savePart, nIssues, short, K } = B
const S = '10', k = K.rest
B.prefix('s10-')
const { browser, p, errors } = await B.world()
const man = id => p.evaluate(i => { const w = [...document.querySelectorAll('.availwin')].find(x => !x.hidden && (x.offsetWidth || x.offsetHeight)); if (!w) return null
  const x = w.querySelector(`[data-awp="${i}"]`); if (!x) return { listed: false }
  const q = x.querySelector('.puck'); return { listed: true, row: x.className.replace('rpuck', '').trim(), puck: q ? q.className : '', chip: (x.querySelector('.lchip') || {}).innerText || '', why: ((x.querySelector('.rwhy') || {}).innerText || '').trim() } }, id)
const ms = m => !m ? 'window not open' : !m.listed ? 'NOT LISTED' : `listed · row "${m.row}" · puck ${/\bwarn\b/.test(m.puck) ? 'ringed' : 'plain'}${m.chip ? ' chip ' + m.chip : ''} · reason "${m.why.slice(0, 60)}"`
const flaggedMan = m => !!m && m.listed && (/clash|flagged/.test(m.row) || /\bwarn\b/.test(m.puck) || !!m.chip || !!m.why)
/* open the window from the puck's own count chip on a surface, read it, picture it, close it */
async function open(scope, name) {
  if (scope.startsWith('#eWeek')) await B.toEdit(p)
  await W.showDay(p, TUE, scope.split(' ')[0])
  const w = await A.openChip(p, scope, null, 0)
  const o = await man('casper'), s = await man('salsa')
  /* bring Outlaw's row into the window's view for the picture */
  await p.evaluate(() => { const w = [...document.querySelectorAll('.availwin')].find(x => !x.hidden); const x = w && w.querySelector('[data-awp="casper"]'); if (x) x.scrollIntoView({ block: 'center' }) }); await L.sleep(250)
  const shot = await pic(p, name)
  await A.closeWin(p)
  /* the app writes "One man is flagged." for one, "N men are flagged." for more, and nothing for none */
  const nf = /(\d+|One) m[ae]n (is|are) flagged/i.exec(w.foot || '')
  return { w, o, s, shot, nFlag: nf ? (/one/i.test(nf[1]) ? 1 : +nf[1]) : (/flagged/.test(w.foot || '') ? null : 0), line: `"${w.title}" · ${w.one} · foot "${w.foot}" · ${w.from || ''} · Outlaw: ${ms(o)}` }
}
try {
  await B.toEdit(p)
  await W.boardOn(p, TUE); await L.sleep(500)
  const put = await SL.handPut(p, 'g:1.0.+', 'allavail')
  const s0 = await pic(p, `s${S}-0-board-allavail-placed`)
  await W.boardOff(p)
  let w = await B.work(p, TUE)
  const pub = await B.pubOrig(p, TUE)
  let e = await open(`#eWeek .day[data-day="${TUE}"]`, `s${S}-1-work-window-flagged`)
  const n0 = e.w.n, f0 = e.nFlag
  judge(`${S}.0`, 'the board, Tuesday: the extras seat of the ground row "OPS BRIEFER / EP SUP" armed, ALL AVAIL picked from the crew list; then Tuesday signed and published; its count chip tapped on Edit Schedule', [
    ['the placeholder landed', put.took, put], ['Tuesday still lists its four warnings', nIssues(w.list) === 4, w.list.bar], ['published', pub.r.pressed, pub.r],
    ['the window opened', e.w.open, e.w.title], ['Outlaw is in the crowd, flagged, his reason under his puck', flaggedMan(e.o) && /Crew rest breach/.test(e.o.why), ms(e.o)],
    ['the foot counts the flagged men', f0 != null && f0 >= 1, e.w.foot]], [s0, e.shot])
  let m = await B.member(p, TUE, [], null)
  let i = await open(`#vWeek .day[data-day="${TUE}"]`, `s${S}-1-member-window-flagged`)
  judge(`${S}.1`, 'the member, View-only Sched: the same chip on Tuesday as issued', [
    ['the window opened', i.w.open, i.w.title], ['the same crowd', i.w.n === n0, [i.w.n, n0]], ['Outlaw flagged with his reason', flaggedMan(i.o) && /Crew rest breach/.test(i.o.why), ms(i.o)], ['the same count of flagged men', i.nFlag === f0, [i.nFlag, f0]]], [i.shot])

  /* the hide waits */
  await B.admin(p)
  const did = await B.hide(p, TUE, k.re)
  e = await open(`#eWeek .day[data-day="${TUE}"]`, `s${S}-2-work-window-hidden`)
  judge(`${S}.2`, 'the scheduler: ✕ on Outlaw\'s crew-rest breach (pending); the chip tapped again on the working copy', [
    ['the ✕ was pressed', did === 'pressed', did], ['Outlaw is STILL in the crowd', !!e.o && e.o.listed, ms(e.o)], ['the crowd is the same size', e.w.n === n0, [e.w.n, n0]],
    ['his puck is plain and his reason is gone', !!e.o && e.o.listed && !flaggedMan(e.o), ms(e.o)], ['"N men are flagged" went down by one', e.nFlag === f0 - 1, [e.w.foot, f0]],
    ['Saint, untouched, is still flagged', flaggedMan(e.s), ms(e.s)]], [e.shot])
  m = await B.member(p, TUE, [], null)
  i = await open(`#vWeek .day[data-day="${TUE}"]`, `s${S}-2-member-window-pending`)
  judge(`${S}.3`, 'the member while the hide waits: the published face\'s window', [
    ['Outlaw is still flagged with his reason', flaggedMan(i.o) && /Crew rest breach/.test(i.o.why), ms(i.o)], ['the count of flagged men is unchanged', i.nFlag === f0, [i.w.foot, f0]], ['the same crowd', i.w.n === n0, [i.w.n, n0]]], [i.shot])

  /* the amendment */
  await B.admin(p)
  const al = await B.pubAL(p, TUE)
  m = await B.member(p, TUE, [], null)
  i = await open(`#vWeek .day[data-day="${TUE}"]`, `s${S}-3-member-window-after-AL1`)
  judge(`${S}.4`, 'the four sign-offs, Publish AL1; the member again', [
    ['AL1 went out', al.r.pressed && /AL1/.test(m.hd.tag), [al.r, m.hd.tag]], ['Outlaw is still in the crowd', !!i.o && i.o.listed, ms(i.o)], ['his puck is plain, no reason', !!i.o && i.o.listed && !flaggedMan(i.o), ms(i.o)],
    ['"N men are flagged" is one fewer', i.nFlag === f0 - 1, [i.w.foot, f0]], ['the same crowd', i.w.n === n0, [i.w.n, n0]]], [i.shot])
} catch (e) { row(`${S}.X`, 'the script stopped', String(e && e.stack || e).slice(0, 600), 'FAIL', [await pic(p, `s${S}-X-error`)]) }
row(`${S}.err`, 'the browser\'s error list through this scenario', errors.length ? errors.join(' | ').slice(0, 800) : 'none', errors.length ? 'FAIL' : 'PASS')
savePart(`s${S}`, { errors })
await browser.close()
