/* The five "orders" rows of Astra's table, each in BOTH orders, on days not yet published. Walker A.
   O1 create blank line <-> assign person; O2 assign person <-> type/clear Brief, take-off, landing or reporting instruction;
   O3 create the late source <-> create the early target; O4 add blank assignment <-> reorder wave/line/Auto sort; O5 add blank assignment <-> cancel/restore.
   Each order is its own fresh world; the final screens of the two orders are compared. Usage: node rbl-A-ord.mjs [o1,o2,...] */
import * as K from './rbl-A-lib.mjs'
const { B, W, R, X, MON, TUE, chk, whole, clean, see } = K
const want = (process.argv[2] || 'o1,o2,o3,o4,o5').split(',')
const okB = s => whole(s) && /05:00/.test(K.restText(s) || '') && /4h30/.test(K.restText(s) || '') && clean(s)
const sigOf = s => `${K.restText(s)} | Tue ${K.pk(s.tuePk)} | Mon ${K.pk(s.monPk)} | Tue list "${s.listBar}"`
async function run(id, fn) {
  const { browser, p, errors } = await K.fresh()
  try { await fn(p) } catch (e) { R(`${id}.script`, 'script', String(e.stack || e).slice(0, 700), 'FAIL', [await B.pic(p, `${id}-X`)]) }
  R(`${id}.err`, 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
  await browser.close()
}
const sigs = {}
const finalOf = async (p, id, did, expect = okB, opts = { monPic: true }) => { const s = await chk(p, id, did, expect, opts); sigs[id] = sigOf(s); return s }
const cmp = (a, b, id, what) => R(id, `the final screens of the two orders compared (${what})`, `A: ${sigs[a]}  ||  B: ${sigs[b]}`, (!sigs[a] || !sigs[b]) ? 'NOT WALKED (one order did not reach its final screen)' : sigs[a] === sigs[b] ? 'PASS' : 'FAIL')

/* ---------------- O1: create the blank line <-> assign the person ---------------- */
if (want.includes('o1')) {
  await run('O1.A', async p => {
    const { t } = await K.baseB(p)                       // ZT is built and X seated BEFORE the blank line exists
    await K.addLine(p, TUE, t.gi); const fi = (await K.nLines(p, TUE, t.gi)) - 1
    await chk(p, 'O1.A.1', 'ORDER A: B built, then "+ Line" (blank, nobody)', okB)
    const sd = await K.seat(p, TUE, t.gi, fi, 0, 'w', X)
    await finalOf(p, 'O1.A.2', `ORDER A: …then the man seated on the blank line (took ${sd.took})`)
  })
  await run('O1.B', async p => {
    await K.wave(p, MON, 'ZM', 'BFM', '20:00', '22:30', X)
    const t = await K.wave(p, TUE, 'ZT', 'BFM', '07:00', '08:00', null, '05:00')   // ZT built, nobody on it yet
    await K.addLine(p, TUE, t.gi); const fi = (await K.nLines(p, TUE, t.gi)) - 1
    const sd = await K.seat(p, TUE, t.gi, fi, 0, 'w', X)      // the man goes onto the BLANK line first
    await chk(p, 'O1.B.1', `ORDER B: Tuesday ZT with nobody on it, "+ Line" blank, the man seated on the blank line first (took ${sd.took}) — no early flight for him yet`, s => !s.breach && clean(s))
    const st = await K.seat(p, TUE, t.gi, 0, 0, 'w', X)       // …and only then on the real early flight
    await finalOf(p, 'O1.B.2', `ORDER B: …then seated on ZT (took ${st.took})`)
  })
  cmp('O1.A.2', 'O1.B.2', 'O1.cmp', 'create blank line vs assign person')
}

/* ---------------- O2: assign the person <-> type / clear the times and the reporting instruction ---------------- */
if (want.includes('o2')) {
  await run('O2.A', async p => {
    await K.wave(p, MON, 'ZM', 'BFM', '20:00', '22:30', X)
    const t = await K.wave(p, TUE, 'ZT', 'BFM', '07:00', '08:00', X, '05:00')    // times first, the man last
    await finalOf(p, 'O2.A.1', 'ORDER A: Brief 05:00, take-off 07:00, landing 08:00 typed, the man seated LAST')
    await K.ff(p, TUE, t.gi, 0, 'br', '')
    await chk(p, 'O2.A.2', 'ORDER A: Brief cleared', s => s.breach && /report|07:00|05:00/.test(K.restText(s) || '') && clean(s), { monPic: false })
    await K.ff(p, TUE, t.gi, 0, 'br', '05:00')
    await finalOf(p, 'O2.A.3', 'ORDER A: Brief typed again')
  })
  await run('O2.B', async p => {
    await K.wave(p, MON, 'ZM', 'BFM', '20:00', '22:30', X)
    const t = await K.wave(p, TUE, 'ZT', 'BFM', null, null, X, null)             // the man seated FIRST on a line that has no times at all
    await chk(p, 'O2.B.1', 'ORDER B: the man seated first on Tuesday ZT with no times at all', s => !s.breach && clean(s))
    await K.ff(p, TUE, t.gi, 0, 'ld', '08:00')
    await chk(p, 'O2.B.2', 'ORDER B: a landing 08:00 typed (no take-off)', s => clean(s), { verdict: 'RECORDED', monPic: false })
    await K.ff(p, TUE, t.gi, 0, 'to', '07:00')
    await chk(p, 'O2.B.3', 'ORDER B: take-off 07:00 typed', s => s.breach && /07:00|report/.test(K.restText(s) || '') && clean(s), { monPic: false })
    await K.ff(p, TUE, t.gi, 0, 'br', '05:00')
    await finalOf(p, 'O2.B.4', 'ORDER B: Brief 05:00 typed LAST — the same final schedule as order A')
  })
  cmp('O2.A.1', 'O2.B.4', 'O2.cmp', 'seat first and type after vs type first and seat after — times')
  await run('O2.C', async p => {            // the reporting instruction, instruction first then the man
    await K.wave(p, MON, 'ZM', 'BFM', '20:00', '22:30', X)
    const t = await K.wave(p, TUE, 'ZT', 'BFM', null, null, null)
    await K.itAdd(p, 'board', TUE, t.gi); await K.itSet(p, 'board', TUE, t.gi, 0, '05:00 IN TIME')
    await chk(p, 'O2.C.1', 'ORDER A (reporting): "05:00 IN TIME" typed on a line nobody is on', s => !s.breach && clean(s), { monPic: false })
    const sd = await K.seat(p, TUE, t.gi, 0, 0, 'w', X)
    await finalOf(p, 'O2.C.2', `ORDER A (reporting): …then the man seated (took ${sd.took})`, s => whole(s) && /05:00/.test(K.restText(s) || '') && clean(s))
  })
  await run('O2.D', async p => {            // the man first, then the instruction
    await K.wave(p, MON, 'ZM', 'BFM', '20:00', '22:30', X)
    const t = await K.wave(p, TUE, 'ZT', 'BFM', null, null, X)
    await K.itAdd(p, 'board', TUE, t.gi); await K.itSet(p, 'board', TUE, t.gi, 0, '05:00 IN TIME')
    await finalOf(p, 'O2.D.1', 'ORDER B (reporting): the man seated first, THEN "05:00 IN TIME" typed', s => whole(s) && /05:00/.test(K.restText(s) || '') && clean(s))
    await K.itDel(p, 'board', TUE, t.gi, 0)
    await chk(p, 'O2.D.2', 'ORDER B (reporting): the instruction deleted again', s => !s.breach && clean(s), { monPic: false })
  })
  cmp('O2.C.2', 'O2.D.1', 'O2.cmp2', 'reporting instruction before vs after the man')
}

/* ---------------- O3: create the late source <-> create the early target ---------------- */
if (want.includes('o3')) {
  await run('O3.A', async p => {
    await K.wave(p, MON, 'ZM', 'BFM', '20:00', '22:30', X)                 // source first
    const t = await K.wave(p, TUE, 'ZT', 'BFM', '07:00', '08:00', X, '05:00')
    await K.addLine(p, TUE, t.gi); const fi = (await K.nLines(p, TUE, t.gi)) - 1
    await K.seat(p, TUE, t.gi, fi, 0, 'w', X)                                         // and a blank crewed Tuesday line
    await finalOf(p, 'O3.A.1', 'ORDER A: Monday late source built first, then Tuesday target, then a blank crewed Tuesday line')
  })
  await run('O3.B', async p => {
    const t = await K.wave(p, TUE, 'ZT', 'BFM', '07:00', '08:00', X, '05:00')        // target first
    await K.addLine(p, TUE, t.gi); const fi = (await K.nLines(p, TUE, t.gi)) - 1
    await K.seat(p, TUE, t.gi, fi, 0, 'w', X)
    await chk(p, 'O3.B.1', 'ORDER B: Tuesday target and its blank crewed line built first (no Monday source yet)', s => !s.breach && clean(s), { monPic: false })
    await K.wave(p, MON, 'ZM', 'BFM', '20:00', '22:30', X)                 // source last
    await finalOf(p, 'O3.B.2', 'ORDER B: …then the Monday late source built last')
  })
  cmp('O3.A.1', 'O3.B.2', 'O3.cmp', 'source first vs target first')
}

/* ---------------- O4: add the blank assignment <-> reorder wave / line / Auto sort ---------------- */
if (want.includes('o4')) {
  await run('O4.A', async p => {            // reorder first, blank crewed line after
    const { t } = await K.baseB(p)
    const first = await K.orderOf(p, TUE)
    await K.dragWave(p, TUE, t.gi, 1)
    const tg = (await K.orderOf(p, TUE)).split('  ').findIndex(x => /ZT/.test(x))
    await K.sortWave(p, TUE, tg)
    await chk(p, 'O4.A.1', `ORDER A: Tuesday's ZT wave dragged up one place by its grip, then its Auto sort pressed: ${first} → ${await K.orderOf(p, TUE)}`, okB, { monPic: false })
    await K.addLine(p, TUE, tg); const fi = (await K.nLines(p, TUE, tg)) - 1
    const sd = await K.seat(p, TUE, tg, fi, 0, 'w', X)
    await finalOf(p, 'O4.A.2', `ORDER A: …then a blank crewed line added (took ${sd.took}); order ${await K.orderOf(p, TUE)}`)
    await K.dragLine(p, TUE, `${TUE}.${tg}.${fi}.0`, `${TUE}.${tg}.0.0`)
    await finalOf(p, 'O4.A.3', `ORDER A: …then the blank line dragged above ZT by its grip: ${await K.waveOrder(p, TUE, tg)}`)
  })
  await run('O4.B', async p => {            // blank crewed line first, reorder after
    const { t } = await K.baseB(p)
    await K.addLine(p, TUE, t.gi); const fi = (await K.nLines(p, TUE, t.gi)) - 1
    const sd = await K.seat(p, TUE, t.gi, fi, 0, 'w', X)
    await chk(p, 'O4.B.1', `ORDER B: blank crewed line added first (took ${sd.took}); order ${await K.orderOf(p, TUE)}`, okB, { monPic: false })
    const first = await K.orderOf(p, TUE)
    await K.dragWave(p, TUE, t.gi, 1)
    const tg = (await K.orderOf(p, TUE)).split('  ').findIndex(x => /ZT/.test(x))
    await K.sortWave(p, TUE, tg)
    await finalOf(p, 'O4.B.2', `ORDER B: …then the ZT wave dragged up one place and its Auto sort pressed: ${first} → ${await K.orderOf(p, TUE)}`)
    await K.dragLine(p, TUE, `${TUE}.${tg}.${fi}.0`, `${TUE}.${tg}.0.0`)
    await finalOf(p, 'O4.B.3', `ORDER B: …then the blank line dragged above ZT by its grip: ${await K.waveOrder(p, TUE, tg)}`)
  })
  cmp('O4.A.2', 'O4.B.2', 'O4.cmp', 'blank line then reorder vs reorder then blank line (wave order + Auto sort)')
  cmp('O4.A.3', 'O4.B.3', 'O4.cmp2', 'the line drag')
}

/* ---------------- O5: add the blank assignment <-> cancel / restore ---------------- */
if (want.includes('o5')) {
  await run('O5.A', async p => {            // cancel the source, then add the blank crewed line, then restore
    const { m } = await K.baseB(p)
    await K.cx(p, MON, `${MON}.${m.gi}.0.0`, 'walk O5.A')
    await chk(p, 'O5.A.1', 'ORDER A: the real Monday source cancelled (CX)', s => !s.breach && !s.dotMon && clean(s), { monPic: false })
    const b = await K.addFlyWave(p, MON); const sd = await K.seat(p, MON, b.gi, 0, 0, 'w', X)
    await chk(p, 'O5.A.2', `ORDER A: …then a blank crewed Monday wave added while the source is cancelled (took ${sd.took})`, s => !s.breach && !s.dotMon && clean(s), { monPic: false })
    await K.uncx(p, MON, `${MON}.${m.gi}.0.0`)
    await finalOf(p, 'O5.A.3', 'ORDER A: …then the source restored')
  })
  await run('O5.B', async p => {            // add the blank crewed line first, then cancel and restore the source
    const { m } = await K.baseB(p)
    const b = await K.addFlyWave(p, MON); const sd = await K.seat(p, MON, b.gi, 0, 0, 'w', X)
    await chk(p, 'O5.B.1', `ORDER B: a blank crewed Monday wave added first (took ${sd.took})`, okB, { monPic: false })
    await K.cx(p, MON, `${MON}.${m.gi}.0.0`, 'walk O5.B')
    await chk(p, 'O5.B.2', 'ORDER B: …then the real Monday source cancelled (CX)', s => !s.breach && !s.dotMon && clean(s), { monPic: false })
    await K.uncx(p, MON, `${MON}.${m.gi}.0.0`)
    await finalOf(p, 'O5.B.3', 'ORDER B: …then the source restored')
  })
  cmp('O5.A.3', 'O5.B.3', 'O5.cmp', 'blank assignment vs cancel/restore')
}
B.savePart('rbl-A-ord')
for (const r of B.TABLE) console.log(`${r.verdict}  ${r.id}  ${r.did}\n      → ${r.saw}`)
