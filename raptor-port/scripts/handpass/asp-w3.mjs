// Walker w3 — round 4: ALL AVAIL and the post-in date (his D2328), 22 Nov 26, chat 141. Brief:
// docs/superpowers/briefs/2026-11-22-allavail-sans-posted-walk-d2328-brief.md. Uses the first walk's w2 helpers
// (W2_URL / W2_OUT point them at this round's server and picture folder). R4-6 is w2's own s13, run unchanged.
// Run from raptor-port/:  W2_URL=http://localhost:4392/ W2_OUT=docs/img/handpass/2026-11-22-allavail-sans-posted/w3 ONLY=r41d,r41p,r44d,r45d node scripts/handpass/asp-w3.mjs
import * as L from './asp-w2-lib.mjs'
const { sleep, J, HEX, brief, agree } = L
const VERSION = 'asp-w3 v1'
const ONLY = (process.env.ONLY || 'r41d,r41p,r44d,r45d').split(',')
console.log(VERSION, L.URL_, L.OUT, ONLY.join(','))
const TUE = 1, THU = 3, SAT = 5

async function run(name, szKey, fn) {
  const sz = L.SIZES[szKey], W = L.mk(name, sz)
  const { b, p } = await L.world(sz, W)
  try {
    await L.signIn(p, 'ad', 'a')
    W.rec('today', "the app's today", null, await L.today(p))
    await fn(p, W)
  } catch (e) {
    W.rec('ERR', 'script stopped', false, String(e && e.message || e).slice(0, 400), await W.pic(p, 'ERR').catch(() => ''))
  }
  W.rec('errors', 'console / page errors / failed requests', W.errs.length === 0, W.errs.slice(0, 8).join(' || '))
  await b.close()
}
const who = (rs) => rs.map(r => r.win && r.win.has).join('/')
const counts = (rs) => rs.map(r => r.chip + '/' + (r.win && r.win.n)).join(' ; ')
function rec3(W, id, what, rs, want, pid) {
  rs.forEach((r, i) => W.rec(`${id}.${['off', 'on', 'off2'][i]}`, what + ` — "+ SANS" ${['off', 'on', 'off again'][i]}`,
    !!(r.win && typeof r.win === 'object' && r.win.has === want),
    (brief(r) || '').replace(/Hex/g, pid), r.pic))
  W.rec(`${id}.agree`, 'the three readings agree (membership, the people, the count)', agree(rs, want) && rs.every(r => r.chip === rs[0].chip && r.win.n === rs[0].win.n), `in: ${who(rs)} · chip/window: ${counts(rs)}`)
  W.rec(`${id}.count`, 'the count, each way (RECORD)', 'REC', counts(rs))
}

/* a new person through Admin → Users, read back */
async function addPerson(p, W, cs, ini, tag) {
  const taken = await p.evaluate(c => Object.values(window.PEOPLE).some(q => (q.cs || '').toLowerCase() === c.toLowerCase()), cs)
  if (taken) { W.rec(tag, `callsign ${cs} already on the roster`, 'NW', ''); return null }
  const np = await L.newPerson(p, W, cs, ini, 'RCP', 'C', '2026-07-17', tag)
  const post = np.id ? await p.evaluate(id => { const q = window.PEOPLE[id]; return { postIn: q.postIn || q.postedIn || q.joined || q.from || null, keys: Object.keys(q).filter(k => /post|join|from|in$/i.test(k)) } }, np.id) : null
  const ok = !!np.id && np.rec && np.rec.seat === 'RCP' && /17 Jul/.test(np.piVal)
  W.rec(tag, `Admin → Users: New person ${cs}, WSO, CAT C, Post in Fri 17 Jul, Add person (read back)`, ok, `id ${np.id} ${J(np.rec)} · post-in box "${np.piVal}" · note "${np.said}" · record ${J(post)}`, np.pic)
  return ok ? np.id : null
}

/* ---------- R4-1, R4-2 (and R4-3 on the desktop): Quokka, post-in Fri 17 Jul, ticked SANS ---------- */
async function r41(p, W) {
  const id = await addPerson(p, W, 'Quokka', 'QK', 'r41-01')
  if (!id) return
  const q = await L.qualsTick(p, W, id, 'r41-02')
  W.rec('r41-02', 'Quals: WSOs → ✎ Edit → his SANS cell (read back)', q.st && q.st.san === true, J(q.st), q.pic)
  if (!(q.st && q.st.san)) return
  /* R4-1: Thu 16 Jul, before his post-in date */
  await L.openBoard(p, W, THU)
  const offT = await p.locator(`#schedBoard .rpuck[data-person="${id}"]:visible`).count()
  W.rec('r41-03', `Thu 16 Jul board: Quokka offered in the crew list (${offT} copies)`, null, '', await W.pic(p, '03-thu-crew'))
  const gT = await L.groundRow(p, W, THU, 'BRIEF', '08:00', '09:00', offT ? id : null)
  const aT = await L.progRow(p, W, THU, 'SQN EVENT', '10:00', '17:00')
  const okT = !!(gT.row && J(gT.row.who || '').includes(id) && aT.row && J(aT.row.who || '').includes('allavail'))
  W.rec('r41-04', 'Thu 16 Jul: BRIEF 08:00–09:00 naming Quokka, SQN EVENT 10:00–17:00 for ALL AVAIL (read back)', offT ? okT : 'NW', J({ g: gT.row, a: aT.row }), await W.pic(p, '04-thu-fixture'))
  await L.closeBoard(p, W)
  if (okT) {
    const rs = await L.bothWays(p, W, THU, aT.row.rid, 'r41-05', id)
    rec3(W, 'R4-1', 'Thu 16 Jul SQN EVENT window: Quokka NOT in', rs, false, 'Quokka')
  }
  /* R4-2: Sat 18 Jul, after his post-in date */
  await L.openBoard(p, W, SAT)
  const offS = await p.locator(`#schedBoard .rpuck[data-person="${id}"]:visible`).count()
  W.rec('r42-01', `Sat 18 Jul board: Quokka offered in the crew list (${offS} copies)`, null, '', await W.pic(p, 'r42-01-sat-crew'))
  const gS = await L.groundRow(p, W, SAT, 'BRIEF', '08:00', '09:00', offS ? id : null)
  const aS = await L.progRow(p, W, SAT, 'SQN EVENT', '10:00', '17:00')
  const okS = !!(gS.row && J(gS.row.who || '').includes(id) && aS.row && J(aS.row.who || '').includes('allavail'))
  W.rec('r42-02', 'Sat 18 Jul: BRIEF 08:00–09:00 naming Quokka, SQN EVENT 10:00–17:00 for ALL AVAIL (read back)', offS ? okS : 'NW', J({ g: gS.row, a: aS.row }), await W.pic(p, 'r42-02-sat-fixture'))
  await L.closeBoard(p, W)
  if (okS) {
    const rs = await L.bothWays(p, W, SAT, aS.row.rid, 'r42-03', id)
    rec3(W, 'R4-2', 'Sat 18 Jul SQN EVENT window: Quokka IN', rs, true, 'Quokka')
  }
  /* R4-3 (desktop): Tue 14 Jul, an event only, Quokka not named */
  if (W.isPhone) return
  await L.openBoard(p, W, TUE)
  const aU = await L.progRow(p, W, TUE, 'SQN EVENT', '10:00', '17:00')
  const okU = !!(aU.row && J(aU.row.who || '').includes('allavail'))
  W.rec('r43-01', 'Tue 14 Jul: SQN EVENT 10:00–17:00 for ALL AVAIL, Quokka not named (read back)', okU, J(aU.row), await W.pic(p, 'r43-01-tue-fixture'))
  await L.closeBoard(p, W)
  if (okU) {
    const rs = await L.bothWays(p, W, TUE, aU.row.rid, 'r43-02', id)
    rec3(W, 'R4-3', 'Tue 14 Jul SQN EVENT window: Quokka NOT in', rs, false, 'Quokka')
  }
}

/* ---------- R4-4: Kiwi, post-in Fri 17 Jul, NOT SANS ---------- */
async function r44(p, W) {
  let cs = 'Kiwi', id = await addPerson(p, W, cs, 'KW', 'r44-01')
  if (!id) { cs = 'Wombat'; id = await addPerson(p, W, cs, 'WB', 'r44-01b') }
  if (!id) return
  const san = await p.evaluate(i => !!window.PEOPLE[i].san, id)
  W.rec('r44-01c', `${cs} is not SANS (read)`, san === false, '')
  for (const [di, nm, want, tag] of [[THU, 'Thu 16 Jul', false, 'r44-thu'], [SAT, 'Sat 18 Jul', true, 'r44-sat']]) {
    await L.openBoard(p, W, di)
    const a = await L.progRow(p, W, di, 'SQN EVENT', '10:00', '17:00')
    const ok = !!(a.row && J(a.row.who || '').includes('allavail'))
    W.rec(tag + '-01', `${nm}: SQN EVENT 10:00–17:00 for ALL AVAIL (read back)`, ok, J(a.row), await W.pic(p, tag + '-01-fixture'))
    await L.closeBoard(p, W)
    if (!ok) continue
    const rs = await L.bothWays(p, W, di, a.row.rid, tag + '-02', id)
    rec3(W, tag === 'r44-thu' ? 'R4-4thu' : 'R4-4sat', `${nm} SQN EVENT window: ${cs} ${want ? 'IN' : 'NOT in'}`, rs, want, cs)
  }
}

/* ---------- R4-5: the first walk's S1 again ---------- */
async function satState(p, W, tag) {
  await L.openBoard(p, W, SAT)
  const pe = await L.pendingOf(p, SAT)
  const pic = await W.pic(p, tag + '-board')
  await L.closeBoard(p, W)
  const lw = await L.lwCell(p, W, HEX, '2026-07-18')
  const pic2 = await W.pic(p, tag + '-lw-cell')
  return { pe, lw: lw.text, pic: pic + ', ' + pic2 }
}
async function r45(p, W) {
  const po = await L.postOut(p, W, HEX, '2026-07-15', 'r45-01')
  W.rec('r45-01', 'Hex posted out as SANS from Wed 15 Jul (his cell → ⋯ → Post out → SANS → Post out; read back)', po.after.san === true, `line "${po.line}" · ${J(po.after)}`, po.pic)
  if (!po.after.san) return
  const f = await L.mainFixture(p, W, SAT)
  W.rec('r45-02', 'Sat 18 Jul: BRIEF 08:00–09:00 naming Hex, SQN EVENT 10:00–17:00 for ALL AVAIL (read back)', f.ok, J({ g: f.g.row, a: f.a.row }), await W.pic(p, 'r45-02-fixture'))
  if (!f.ok) return
  const r0 = await L.readCount(p, W, f.a.row.rid)
  const pic3 = await W.pic(p, 'r45-03-win')
  W.rec('r45-03', 'the count before Publish: 45, Hex in the window (purple SANS line)', r0.win && r0.win.has === true && r0.chip === '45' && r0.win.n === 45, `chip "${r0.chip}" ${J(r0.win)}`, pic3)
  await L.closeWin(p, W)
  const lab = await L.publish(p, W, SAT)
  const pe = await L.pendingOf(p, SAT)
  W.rec('r45-04', `four sign-offs and Publish (${lab})`, pe.pend === 0 && !pe.notSigned && /SIGNED ORIG/i.test(pe.signed), J(pe), await W.pic(p, 'r45-04-published'))
  await L.closeBoard(p, W)
  const lw = await L.lwCell(p, W, HEX, '2026-07-18')
  W.rec('r45-05', "Leave War: Hex's Sat 18 Jul cell after Publish reads FO*", lw.text === 'FO*', `"${lw.text}"`, await W.pic(p, 'r45-05-lw-cell'))
  const base = pe.signed
  let k = 6
  for (const on of [true, false, true, false]) {
    const sg = await L.sansGroup(p, W, on, `r45-${k}`)
    const s = await satState(p, W, `r45-${k}`)
    W.rec(`r45-${k}`, `"+ SANS" ${on ? 'on' : 'off'} (group shown: ${sg.group}): Saturday 0 pending, the "SIGNED ORIG" line unchanged, cell FO*`, sg.group === on && s.pe.pend === 0 && !s.pe.notSigned && s.pe.signed === base && s.lw === 'FO*', `pending ${s.pe.pend} · not yet signed ${s.pe.notSigned} · signed "${s.pe.signed}" · cell "${s.lw}"`, sg.pic + ', ' + s.pic)
    k++
  }
  /* the count once more, after the switches */
  await L.openBoard(p, W, SAT)
  const r1 = await L.readCount(p, W, f.a.row.rid)
  W.rec('r45-10', 'the count after the switches: the same, Hex in', r1.win && r1.win.has === true && r1.chip === r0.chip && r1.win.n === r0.win.n, `chip "${r1.chip}" ${J(r1.win)}`, await W.pic(p, 'r45-10-win'))
  await L.closeWin(p, W)
}

const FN = { r41, r44, r45 }
for (const k of ONLY) { const name = k.slice(0, -1), sz = k.slice(-1); if (FN[name]) await run(name, sz, FN[name]) }
L.saveResults('w3-' + ONLY.join('_'))
console.log('done')
