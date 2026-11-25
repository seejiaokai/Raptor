// sud-w5-a12 — A1 (the owner's example), A2 (the boundary day and the three note states) and A4 (the Available panel),
// each at both sizes, in fresh contexts. D2338 walk, 23 Nov 26, chat 147.
// Run from raptor-port/:  RUN=<folder> ONLY=a1d,a1p,a2d,a2p node scripts/handpass/sud-w5-a12.mjs
import { L, S, run, NOTE17, TODAYW, crewLine, firstShown, boardCrew, boardDrawer, weekCrew, bell, bellClose, bellLine, as, moveClock, commit } from './sud-w5-lib.mjs'
const { J, HEX } = L
const VERSION = 'sud-w5-a12 v4'
const ONLY = (process.env.ONLY || 'a1d,a1p,a2d,a2p').split(',')
console.log(VERSION, L.URL_, L.OUT, ONLY.join(','))
const THU = 3, FRI = 4, SAT = 5

const isNote = (c, words) => { const x = firstShown(c); return !!x && x.title === 'Hex — ' + words && x.why === words }
const noSans = c => { const x = firstShown(c); return !!x && !/SANS/.test(x.title + x.why + x.printed) }

async function posting(p, W, id) {
  const po = await L.postOut(p, W, HEX, '2026-07-17', id)
  const ok = /17 Jul: becomes SANS/.test(po.line)
  W.rec(id, 'Wed 15 Jul: Leave War → Hex 17 Jul cell → ⋯ → Post out, SANS, Post out (read back)', !!ok, `line "${po.line}" · chips ${po.chips1} · record ${J(po.after)}`, po.pic)
  return !!ok
}
/* the Available crew panel of a day on Edit Schedule: its heading folded (the count line) and the words of the whole
   section in both states — never a man's own words */
async function avail(p, W, di, tag) {
  await L.closeBoard(p, W); await L.go(p, 'editsched')
  const txt = () => p.evaluate(i => { const s = document.querySelector(`#eWeek section.day[data-day="${i}"] .sec-avail`); return s ? (s.innerText || '').replace(/\s+/g, ' ').trim() : 'no panel' }, di)
  const t0 = await txt()
  const a = await S.availCount(p, W, di, tag + '-')
  const t1 = await txt()
  return { line: a.line, before: t0.slice(0, 300), after: t1.slice(0, 300), full: t0 + ' ' + t1, pic: a.pic }
}

/* ---------- A1 ---------- */
async function a1(p, W) {
  if (!(await posting(p, W, 'a1-01'))) return
  for (const [di, nm, id] of [[SAT, 'Sat 18 Jul', 'a1-02'], [FRI, 'Fri 17 Jul', 'a1-03']]) {
    const r = await boardCrew(p, W, di, id + '-board')
    const x = firstShown(r.c)
    W.rec(id, `Board ${nm} (today Wed 15): Hex under SANS Avail, struck, his title / reason the look-ahead words`, isNote(r.c, NOTE17) && x.where === 'SANS Avail', crewLine(r.c), r.pic)
    if (W.isPhone) {
      W.rec(id + 'ph', `phone, ${nm}, nothing armed: words PRINTED for Hex without a hover (RECORD)`, 'REC', x ? `printed "${x.printed}" · shown ${x.shown}` : 'no puck')
      /* a look-only tap on his struck puck, nothing armed: what the phone shows him (a tap that reads must not write) */
      const h0 = await p.evaluate(() => (window.HIST || []).length)
      const dr = await boardDrawer(p, W, true)
      const pk = p.locator(`#schedBoard .rpuck[data-person="${HEX}"]:visible`).first()
      await pk.evaluate(e => e.scrollIntoView({ block: 'center' })); await L.sleep(250)
      await pk.tap(); const now = await W.pic(p, id + 'tap-now'); await L.sleep(900)
      const after = await p.evaluate(() => ({ arm: window.ARM && window.ARM.key, sel: window.SELP || null, toast: ((document.getElementById('toastEl') || {}).textContent || '').replace(/\s+/g, ' ').trim(), hist: (window.HIST || []).length }))
      W.rec(id + 'tap', `phone, ${nm}: the AIRCREW drawer opened by its tab (${dr}), a tap on Hex's struck crew puck, nothing armed — what shows (RECORD); nothing written`, after.hist === h0 ? 'REC' : false, `history ${h0} → ${after.hist} · armed ${after.arm} · note "${after.toast}"`, now + ', ' + await W.pic(p, id + 'tap-settled'))
      await p.keyboard.press('Escape').catch(() => {}); await L.sleep(300)
      await boardDrawer(p, W, false)
    }
  }
  const t = await boardCrew(p, W, THU, 'a1-04-board')
  W.rec('a1-04', 'Board Thu 16 Jul: Hex an ordinary WSO, no SANS words', noSans(t.c) && /WSO/i.test(firstShown(t.c).where), crewLine(t.c), t.pic)
  await L.closeBoard(p, W)
  for (const [dow, nm, id, want] of [['sat', 'Sat 18 Jul', 'a1-05', NOTE17], ['fri', 'Fri 17 Jul', 'a1-06', NOTE17], ['thu', 'Thu 16 Jul', 'a1-07', null]]) {
    const r = await weekCrew(p, W, dow, id + '-week')
    const ok = want ? isNote(r.c, want) && firstShown(r.c).where === 'SANS Avail' : noSans(r.c)
    W.rec(id, `Edit Schedule crew panel (${r.day}) ${nm}: ${want ? 'look-ahead words' : 'ordinary WSO, no SANS words'}`, ok, crewLine(r.c), r.pic)
  }
  /* A4: the Available panel, folded and open, Thu 16 and Sat 18 */
  for (const [di, nm, id] of [[THU, 'Thu 16 Jul', 'a4-01'], [SAT, 'Sat 18 Jul', 'a4-02']]) {
    const a = await avail(p, W, di, id)
    const ok = !/SANS from|no availability filed/.test(a.full + ' ' + a.line)
    W.rec(id, `A4 Edit Schedule ${nm}: Available crew panel shows a count only, never Hex's words (folded line, then open)`, ok, `folded "${a.line}" · panel words before "${a.before}" · after "${a.after}"`, a.pic)
  }
  /* Hex's own bell, today Wed 15 */
  const me = await as(p, W, 'hex', 'x')
  const b = await bell(p, W, 'a1-08-hex-bell')
  W.rec('a1-08', `Hex signed in (${me}), bell opened on Wed 15 Jul: no SANS availability line yet`, b.sans.length === 0, bellLine(b) + ' · all: ' + J(b.lines.map(l => l.name + ' ' + l.day)), b.pic)
  await bellClose(p)
}

/* ---------- A2 ---------- */
async function a2(p, W) {
  if (!(await posting(p, W, 'a2-01'))) return
  for (const [di, nm, id] of [[FRI, 'Fri 17 Jul', 'a2-02'], [SAT, 'Sat 18 Jul', 'a2-03']]) {
    const r = await boardCrew(p, W, di, id + '-board')
    W.rec(id, `Wed 15: board ${nm}: the look-ahead words`, isNote(r.c, NOTE17), crewLine(r.c), r.pic)
  }
  await L.closeBoard(p, W)
  const t = await moveClock(p, W, '2026-07-17T09:00:00')
  const rec = await p.evaluate(id => { const q = window.PEOPLE[id]; return { san: !!q.san, sanFrom: q.sanFrom || null } }, HEX)
  W.rec('a2-04', "clock set to Fri 17 Jul 09:00 (setSystemTime), page reloaded, Saber signed in again: the app's today; Hex's record", /Fri Jul 17 2026/.test(t), `${t} · ${J(rec)}`)
  for (const [di, nm, id] of [[FRI, 'Fri 17 Jul', 'a2-05'], [SAT, 'Sat 18 Jul', 'a2-06']]) {
    const r = await boardCrew(p, W, di, id + '-board')
    W.rec(id, `Fri 17: board ${nm}: the usual words "${TODAYW}"`, isNote(r.c, TODAYW), crewLine(r.c), r.pic)
  }
  for (const [dow, nm, id] of [['fri', 'Fri 17 Jul', 'a2-07'], ['sat', 'Sat 18 Jul', 'a2-08']]) {
    const r = await weekCrew(p, W, dow, id + '-week')
    W.rec(id, `Fri 17: Edit Schedule crew panel (${r.day}) ${nm}: the usual words`, isNote(r.c, TODAYW), crewLine(r.c), r.pic)
  }
  const a0 = await avail(p, W, SAT, 'a2-09')
  W.rec('a2-09', 'A4 Fri 17: Sat 18 Available crew panel before Hex files (RECORD the count; no man\'s words)', !/SANS from|no availability filed/.test(a0.full + a0.line) ? 'REC' : false, `folded "${a0.line}" · open "${a0.after}"`, a0.pic)
  /* Hex files Sat 18: OFT, all day */
  const me = await as(p, W, 'hex', 'x')
  const c = await commit(p, W, '2026-07-18', null, ['oft'], 'all', 'a2-10')
  W.rec('a2-10', `Hex (${me}) Inputs → SANS → Sat 18 Jul → + Commitment, OFT, All day, Add (read back)`, !!(c.rec && c.rec.person === HEX && c.rec.sans && c.rec.sans.o), `fixed person "${c.fixed}" · record ${J(c.rec)}${c.disabled ? ' · ADD OFF: ' + c.addWhy : ''}`, c.pic)
  await as(p, W, 'ad', 'a')
  const r18 = await boardCrew(p, W, SAT, 'a2-11-board')
  const r17 = await boardCrew(p, W, FRI, 'a2-12-board')
  W.rec('a2-11', 'Saber, board Sat 18 after the filing: no "no availability filed" words for Hex', noSans(r18.c) || !/no availability filed/.test(firstShown(r18.c).title), crewLine(r18.c), r18.pic)
  W.rec('a2-12', 'Saber, board Fri 17 (nothing filed): the usual words stay', isNote(r17.c, TODAYW), crewLine(r17.c), r17.pic)
  await L.closeBoard(p, W)
  for (const [dow, nm, id, want] of [['sat', 'Sat 18 Jul', 'a2-13', null], ['fri', 'Fri 17 Jul', 'a2-14', TODAYW]]) {
    const r = await weekCrew(p, W, dow, id + '-week')
    const ok = want ? isNote(r.c, want) : !/no availability filed/.test((firstShown(r.c) || {}).title || 'x no availability filed')
    W.rec(id, `Edit Schedule crew panel (${r.day}) ${nm} after the filing: ${want ? 'the usual words stay' : 'no "nothing filed" words'}`, ok, crewLine(r.c), r.pic)
  }
  const a1_ = await avail(p, W, SAT, 'a2-15')
  W.rec('a2-15', 'A4 Sat 18 Available crew panel after the filing: the SANS offering count moved (RECORD before / after)', 'REC', `before "${a0.line}" · after "${a1_.line}" · open "${a1_.after}"`, a1_.pic)
}

const FN = { a1, a2 }
for (const k of ONLY) { const name = k.slice(0, -1), sz = k.slice(-1); if (FN[name]) await run(name, sz, FN[name]) }
L.saveResults('a12-' + ONLY.join('_'))
console.log('done')
