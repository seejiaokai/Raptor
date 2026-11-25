// sud-w5-a1013 — A10 (the posting moved later before it runs: the note's dates only) and A13 (moved earlier: the note
// only), each at both sizes. D2338 walk, 23 Nov 26, chat 147.
// Run from raptor-port/:  RUN=<folder> ONLY=a10d,a10p,a13d,a13p node scripts/handpass/sud-w5-a1013.mjs
import { L, S, run, NOTE17, TODAYW, noteFrom, crewOf, crewLine, firstShown, clip, boardCrew, weekCrew, moveClock, movePosting } from './sud-w5-lib.mjs'
const { J, HEX, sleep } = L
const VERSION = 'sud-w5-a1013 v1'
const ONLY = (process.env.ONLY || 'a10d,a10p,a13d,a13p').split(',')
console.log(VERSION, L.URL_, L.OUT, ONLY.join(','))
const WED = 2, THU = 3, FRI = 4, SAT = 5
const isNote = (c, words) => { const x = firstShown(c); return !!x && x.title === 'Hex — ' + words && x.why === words }
const noSans = c => { const x = firstShown(c); return !!x && !/SANS/.test(x.title + x.why + x.printed) && x.where !== 'SANS Avail' }

async function posting(p, W, id) {
  const po = await L.postOut(p, W, HEX, '2026-07-17', id)
  W.rec(id, 'Wed 15: Hex posted out as SANS from Fri 17 Jul (read back)', /17 Jul: becomes SANS/.test(po.line), `line "${po.line}"`, po.pic)
  return /17 Jul: becomes SANS/.test(po.line)
}
/* the board stepped forward by its own day arrows (desktop: the day chips and the week arrow), Hex's crew puck read */
async function stepRead(p, W, steps, id) {
  let st = null
  for (let i = 0; i < steps; i++) st = await S.boardStep(p, W, 1)
  const c = await crewOf(p, '#schedBoard')
  const pc = await clip(p, W, `#schedBoard .rpuck[data-person="${HEX}"]:visible`, id)
  return { st, c, pic: [pc, await W.pic(p, id)].filter(Boolean).join(', ') }
}

async function a10(p, W) {
  if (!(await posting(p, W, 'a10-01'))) return
  const r0 = await boardCrew(p, W, SAT, 'a10-02-board')
  W.rec('a10-02', 'Wed 15, board Sat 18 before the move: the look-ahead words from Fri 17', isNote(r0.c, NOTE17), crewLine(r0.c), r0.pic)
  await L.closeBoard(p, W)
  const mv = await movePosting(p, W, '2026-07-17', '2026-07-20', 'a10-03')
  W.rec('a10-03', `Hex's posted-out sheet (${mv.route}): PO from moved 17 → Mon 20 Jul, SANS kept (read back)`, !!(mv.ok && /20 Jul/.test(mv.lineAfter) && /SANS/.test(mv.lineAfter)), `line before "${mv.lineBefore}" · after "${mv.lineAfter}"${mv.err ? ' · err "' + mv.err + '"' : ''} · record ${J(mv.rec)}`, mv.pic)
  for (const [di, nm, id] of [[FRI, 'Fri 17 Jul', 'a10-04'], [SAT, 'Sat 18 Jul', 'a10-05']]) {
    const r = await boardCrew(p, W, di, id + '-board')
    W.rec(id, `board ${nm} after the move: Hex an ordinary WSO again, no SANS words`, noSans(r.c), crewLine(r.c), r.pic)
  }
  /* on to Mon 20 and Tue 21 by the board's own arrows (from Sat 18: Sun, Mon, Tue) */
  const m = await stepRead(p, W, 2, 'a10-06-board')
  W.rec('a10-06', `board stepped to ${m.st && m.st.title} (week ${m.st && m.st.week.slice(0, 6)}): Mon 20 — the look-ahead words name Mon 20 Jul`, isNote(m.c, noteFrom('Mon 20 Jul')), `sbday ${m.st && m.st.sbday} · ${crewLine(m.c)}`, m.pic)
  const t = await stepRead(p, W, 1, 'a10-07-board')
  W.rec('a10-07', `board stepped to ${t.st && t.st.title}: Tue 21 — the look-ahead words name Mon 20 Jul`, isNote(t.c, noteFrom('Mon 20 Jul')), `sbday ${t.st && t.st.sbday} · ${crewLine(t.c)}`, t.pic)
  await L.closeBoard(p, W)
  const w = await weekCrew(p, W, 'tue', 'a10-08-week')
  W.rec('a10-08', `Edit Schedule crew panel (${w.day}) on the week now open: the words for Tue 21 if it is the 20 Jul week (RECORD which week)`, 'REC', `week ${await L.weekOf(p)} · ${crewLine(w.c)}`, w.pic)
}

async function a13(p, W) {
  if (!(await posting(p, W, 'a13-01'))) return
  const mv = await movePosting(p, W, '2026-07-17', '2026-07-16', 'a13-02')
  W.rec('a13-02', `Hex's posted-out sheet (${mv.route}): PO from moved 17 → Thu 16 Jul, SANS kept (read back)`, !!(mv.ok && /16 Jul/.test(mv.lineAfter) && /SANS/.test(mv.lineAfter)), `line before "${mv.lineBefore}" · after "${mv.lineAfter}"${mv.err ? ' · err "' + mv.err + '"' : ''} · record ${J(mv.rec)}`, mv.pic)
  const N16 = noteFrom('Thu 16 Jul')
  for (const [di, nm, id, want] of [[WED, 'Wed 15 Jul (today)', 'a13-03', null], [THU, 'Thu 16 Jul', 'a13-04', N16], [FRI, 'Fri 17 Jul', 'a13-05', N16], [SAT, 'Sat 18 Jul', 'a13-06', N16]]) {
    const r = await boardCrew(p, W, di, id + '-board')
    W.rec(id, `Wed 15, board ${nm}: ${want ? 'the look-ahead words name Thu 16 Jul' : 'Hex ordinary, no SANS words'}`, want ? isNote(r.c, want) : noSans(r.c), crewLine(r.c), r.pic)
  }
  await L.closeBoard(p, W)
  const wk = await weekCrew(p, W, 'thu', 'a13-07-week')
  W.rec('a13-07', `Edit Schedule crew panel (${wk.day}) Thu 16: the look-ahead words name Thu 16 Jul`, isNote(wk.c, N16), crewLine(wk.c), wk.pic)
  /* Thursday arrives: the usual words from the posting's date */
  const t = await moveClock(p, W, '2026-07-16T09:00:00')
  const rec = await p.evaluate(id => { const q = window.PEOPLE[id]; return { san: !!q.san, sanFrom: q.sanFrom || null } }, HEX)
  W.rec('a13-08', "clock set to Thu 16 Jul 09:00 (setSystemTime), reloaded, Saber signed in: the app's today; Hex's record", /Thu Jul 16 2026/.test(t), `${t} · ${J(rec)}`)
  for (const [di, nm, id] of [[THU, 'Thu 16 Jul', 'a13-09'], [SAT, 'Sat 18 Jul', 'a13-10']]) {
    const r = await boardCrew(p, W, di, id + '-board')
    W.rec(id, `Thu 16, board ${nm}: the usual words`, isNote(r.c, TODAYW), crewLine(r.c), r.pic)
  }
  await L.closeBoard(p, W)
}

const FN = { a10, a13 }
for (const k of ONLY) { const name = k.slice(0, -1), sz = k.slice(-1); if (FN[name]) await run(name, sz, FN[name]) }
L.saveResults('a1013-' + ONLY.join('_'))
console.log('done')
