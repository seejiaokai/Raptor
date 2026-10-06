/* walker A — the ordered pairs {Lr, Ld, Lt} x {S, P, A}, both orders, from an UNPUBLISHED and from a PUBLISHED day.
   node ows-A-pairs.mjs U|PB X Y [X Y ...]   (X Y are the two actions in the order done; one world per pair)
   Fixture: Saturday flying line 12:00–13:00, no In-time / Rally, Ranger (bane). U = drafted, unsigned. PB = signed and published (ORIG).
   Each run: observe -> action 1 -> observe -> action 2 -> observe -> Undo -> observe -> Redo -> observe -> reload -> observe. */
import * as A from './ows-A-lib.mjs'
const { W, frame, flyLine, sleep, judge, row, logicSet, pic } = A
const SAT = 5, ID = 'bane'
const START = process.argv[2]
const PH = !!process.env.HP_PHONE
const pairs = []
for (let i = 3; i + 1 < process.argv.length; i += 2) pairs.push([process.argv[i], process.argv[i + 1]])

const REC = { none: { L: 'HO', span: '09:00–15:00', amt: 0.5 }, Lr: { L: 'HO', span: '09:30–15:00', amt: 0.5 }, Ld: { L: 'FO', span: '09:00–15:30', amt: 1 }, Lt: { L: 'FO', span: '09:00–15:00', amt: 1 } }
const LOGIC = { Lr: ['reportLead', '2h30'], Ld: ['debrief', '2h30'], Lt: ['oilFullMin', '6h'] }

async function observe(p, tag, run) {
  const lw = await A.oilOf(p, ID, A.SAT, run + tag, { shots: false })
  const d = await A.dayState(p, SAT, run + tag)
  const sw = await A.selWords(p, SAT)
  const nBlank = (sw.match(/name/gi) || []).length
  const published = /ORIG|AL\d/.test(d.head.tag)
  const signed = published ? (/Not yet signed/i.test(d.head.nys) ? 'blank' : /Not yet published/i.test(d.head.nys) ? 'signed' : (nBlank === 4 ? 'standing' : 'standing+names')) : (nBlank === 4 ? 'blank' : nBlank === 0 ? 'signed' : 'partial')
  const paid = lw.letters === 'FO' || lw.letters === 'HO' ? { L: lw.letters, span: A.spansOf(lw.row)[0] || '', amt: lw.bal } : null
  const oilLine = (/OIL on this day[^]*/.exec(d.list) || [''])[0].slice(0, 170)
  return { lw, d, sw, signed, paid, published, tag: d.head.tag, pend: d.pend, nys: d.head.nys, beak: d.head.beak, alpub: d.head.alpub, oilLine,
    compact: `${paid ? paid.L + ' ' + paid.span + ' bal ' + paid.amt : 'no credit (cell "' + lw.cell.text + '", bal ' + lw.bal + ')'} | tag ${d.head.tag} | pend ${d.pend} | marker "${d.head.nys}" | selects ${nBlank === 4 ? 'all blank' : nBlank === 0 ? 'all named (' + sw + ')' : 'partly (' + sw + ')'} | buttons beak=${d.head.beak} al="${d.head.alpub}"${oilLine ? ' | list: ' + oilLine : ''}` }
}
async function act(p, a) {
  if (LOGIC[a]) { const [k, v] = LOGIC[a]; const shown = await logicSet(p, k, v); return { did: `${a}: ${k} → ${shown}` } }
  await A.toBoard(p, SAT)
  if (a === 'S') { const s = await W.signDay(p, SAT); await A.closeBoard(p); return { did: 'S: signed four selects ' + JSON.stringify(s) } }
  if (a === 'P') { const r = await W.publishDay(p, SAT); await sleep(500); await A.closeBoard(p); return { did: 'P: ' + JSON.stringify(r), res: r } }
  if (a === 'A') { const r = await W.publishAL(p, SAT); await sleep(500); await A.closeBoard(p); return { did: 'A: ' + JSON.stringify(r), res: r } }
  throw new Error('unknown action ' + a)
}
/* the model of what each action should do */
function model(st, a) {
  const s = { ...st }; delete s.refused
  if (LOGIC[a]) { s.cand = REC[a]; s.coded = a
    if (!st.pub) { if (s.signed !== 'blank') s.signed = 'blank' }
    else { s.pend = (s.cand.L !== st.paid.L || s.cand.span !== st.paid.span) ? 1 : 0; if (s.pend) s.signed = 'blank' } ; return s }
  if (a === 'S') { s.signed = (st.pub && !st.pend) ? 'standing+names' : 'signed'; return s }
  if (a === 'P') { if (!st.pub && st.signed === 'signed') { s.pub = true; s.paid = st.cand; s.pend = 0; s.signed = 'standing'; s.tag = 'ORIG' } else s.refused = true; return s }
  if (a === 'A') { if (st.pub && st.signed === 'signed' && st.pend) { s.paid = st.cand; s.pend = 0; s.signed = 'standing'; s.tag = 'AL1' } else s.refused = true; return s }
}
function matches(model_, obs) {
  const bad = []
  if (model_.paid) { if (!obs.paid || obs.paid.L !== model_.paid.L || obs.paid.span !== model_.paid.span || obs.paid.amt !== model_.paid.amt) bad.push(`paid expected ${model_.paid.L} ${model_.paid.span} bal ${model_.paid.amt}, saw ${obs.compact.split(' | ')[0]}`) }
  else if (obs.paid) bad.push('a credit appeared where none should be: ' + obs.compact.split(' | ')[0])
  if (String(model_.pend || 0) !== String(obs.pend)) bad.push(`pending expected ${model_.pend || 0}, saw ${obs.pend}`)
  if (model_.signed && model_.signed !== obs.signed && !(model_.signed === 'standing' && /standing/.test(obs.signed))) bad.push(`sign-offs expected ${model_.signed}, saw ${obs.signed}`)
  if (model_.tag && model_.tag !== obs.tag) bad.push(`tag expected ${model_.tag}, saw ${obs.tag}`)
  return bad
}

for (const [x, y] of pairs) {
  const run = `${START}-${x}${y}${PH ? 'ph' : ''}`
  await frame('PR-' + run, async ({ p }) => {
    await flyLine(p, { to: '12:00', ld: '13:00', report: null })
    if (START === 'PB') { await A.publishNew(p, SAT); await A.closeBoard(p) }
    const o0 = await observe(p, '-0', run)
    let st = START === 'PB' ? { pub: true, paid: REC.none, cand: REC.none, pend: 0, signed: 'standing', tag: 'ORIG' } : { pub: false, paid: null, cand: REC.none, pend: 0, signed: 'blank', tag: 'DRAFT' }
    const bad0 = matches(st, o0)
    const a1 = await act(p, x); st = model(st, x); const o1 = await observe(p, '-1', run); const bad1 = matches(st, o1)
    const a2 = await act(p, y); st = model(st, y); const o2 = await observe(p, '-2', run); const bad2 = matches(st, o2)
    /* Undo / Redo of the second action through the top bar */
    const u = await A.undo(p); await sleep(500); const oU = await observe(p, '-U', run)
    const r = await A.redo(p); await sleep(500); const oR = await observe(p, '-R', run)
    await A.reloadAs(p, 'a'); await sleep(600); const oL = await observe(p, '-L', run)
    const undoBack = oU.compact === o1.compact, redoBack = oR.compact === o2.compact, reloadSame = oL.compact === oR.compact
    judge(run, `${START === 'PB' ? 'a PUBLISHED day (ORIG, signed)' : 'an UNPUBLISHED unsigned draft'}: ${x} then ${y}`, [
      ['start as expected', !bad0.length, bad0],
      [`after ${x} (${a1.did}): as the rules say`, !bad1.length, bad1.length ? bad1 : o1.compact],
      [`after ${y} (${a2.did}${st.refused ? ' — expected refused/unavailable' : ''}): as the rules say`, !bad2.length && (!st.refused || (a2.res && !a2.res.pressed) || /locked|absent/.test(JSON.stringify(a2.res || ''))), bad2.length ? bad2 : o2.compact + (a2.res ? ' | ' + JSON.stringify(a2.res) : '')],
      ['reload gives back the same state', reloadSame, reloadSame ? '' : [oR.compact, oL.compact]],
    ], [])
    console.log(`REC ${run} :: start: ${o0.compact}\n  [${x}] ${a1.did}\n     -> ${o1.compact}\n  [${y}] ${a2.did}\n     -> ${o2.compact}\n  Undo(${JSON.stringify(u && { present: u.present, pressed: u.pressed, title: u.title })}) restored the state after ${x}: ${undoBack}\n     -> ${oU.compact}\n  Redo(${JSON.stringify(r && { pressed: r.pressed })}) restored the state after ${y}: ${redoBack}\n     -> ${oR.compact}\n  reload -> ${oL.compact}`)
  })
}
