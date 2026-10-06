/* WALKER C, script 4: S36 — OL + crew-rest breach + a qualification problem on ONE man at ONE SC MAIN seat, then remove one
   cause at a time. Run with BTA_X=ignite BTA_CS=Torch BTA_SEAT=p (Torch: SC DAY current, NOT SC NIGHT current — the
   qualification problem is the shift retimed to a night window). */
import * as X from './bta-C-lib.mjs'
import * as W2 from './dbrA-W2-lib.mjs'
const { B, K, W, R, ID, CSN, MON, TUE, pic, sleep } = X

async function state(p, tag) {
  const s = await X.seeWeek(p, TUE, tag, { prev: -1 })
  const lines = (s.list.full || []).filter(x => x.text.includes(CSN)).map(x => `${x.hid ? '[hidden] ' : ''}${x.text.replace(/ ✕| ↺/g, '').slice(0, 190)}`)
  const codes = (await X.fullWarnsX(p, TUE)).map(w => w.code)
  return { s, lines, codes, say: `bar "${s.list.bar}" · lines naming him: ${JSON.stringify(lines)} · codes ${JSON.stringify(codes)} · his pucks [${X.pk2(s.pk)}]` }
}

async function s36() {
  const { browser, p, errors } = await K.fresh()
  try {
    const m = await K.addFlyWave(p, MON)
    await K.ff(p, MON, m.gi, 0, 'cs', 'ZM'); await K.ff(p, MON, m.gi, 0, 'msn', 'BFM'); await K.ff(p, MON, m.gi, 0, 'to', '21:00'); await K.ff(p, MON, m.gi, 0, 'ld', '22:30')
    const sm = await K.seat(p, MON, m.gi, 0, 0, 'p', ID)
    const sc = await X.scTuesday(p, { to: '13:00', ld: '19:00', br: '05:00' })
    const k1 = X.key(TUE, sc.gi, 0, 1, 'p')
    const a = await X.readArmed(p, k1, 's36-armed')
    const toast = await X.pressName(p)
    const took = await X.holds(p, k1)
    /* the qualification cause: the shift retimed to a night window (Gambit is not SC NIGHT current) */
    await K.ff(p, TUE, sc.gi, 0, 'to', '19:00'); await K.ff(p, TUE, sc.gi, 0, 'ld', '07:00')
    const f = await X.fileInput(p, { type: 'OL', di: TUE, allday: true, remarks: 'Overseas' })
    const st1 = await state(p, 's36-1-all-three')
    R('S36.1', `${CSN} (SC DAY current only): Monday flight 21:00–22:30 (took ${sm.took}); Tuesday SC B 05:00, Cobra in MAIN row 0; his name pressed on the other MAIN seat (crew list said: ${a.said.slice(0, 120)}) → seat holds "${took}", toast ${toast ? '"' + toast.slice(0, 160) + '"' : 'nothing'}; then the shift retimed to 19:00–07:00 (night) and OL all Tuesday filed (iid ${f.iid}); shift now ${await X.shiftNow(p, TUE, sc.gi)}`,
      st1.say, st1.codes.length >= 3 ? 'RECORDED' : 'PARTIAL', st1.s.pics)
    /* cause 1 removed: the crew-rest breach — a B after his clearance (B stays before the shift's start) */
    await K.ff(p, TUE, sc.gi, 0, 'br', '12:45')
    const st2 = await state(p, 's36-2-rest-removed')
    R('S36.2', `cause 1 removed: B retyped 12:45 (after his 12:30 clearance); the shift is ${await X.shiftNow(p, TUE, sc.gi)}`, st2.say, 'RECORDED', st2.s.pics)
    /* cause 2 removed: the shift back to the day window */
    await K.ff(p, TUE, sc.gi, 0, 'to', '13:00'); await K.ff(p, TUE, sc.gi, 0, 'ld', '19:00')
    const st3 = await state(p, 's36-3-qual-removed')
    R('S36.3', `cause 2 removed: shift retimed back to 13:00–19:00 (${await X.shiftNow(p, TUE, sc.gi)})`, st3.say, 'RECORDED', st3.s.pics)
    /* cause 3 removed: the OL deleted through the Inputs page's ✕ */
    await B.toEdit(p); await W.boardOff(p)
    const had = await W2.delReq(p, f.iid)
    const gone = await p.evaluate(i => !window.INPUTS.find(x => x.iid === i), f.iid)
    const st4 = await state(p, 's36-4-ol-removed')
    R('S36.4', `cause 3 removed: the OL deleted on the Inputs page (the row's ✕ pressed: ${had}; input gone ${gone})`, st4.say, gone ? 'RECORDED' : 'PARTIAL', st4.s.pics)
  } catch (e) { R('S36', 'script', String(e.stack || e).slice(0, 600), 'FAIL', [await pic(p, 's36-X')]) }
  R('S36.err', 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
  await browser.close()
}
await s36()
B.savePart('bta-C-4')
for (const r of B.TABLE) console.log(`${r.verdict}  ${r.id}  ${r.did}\n      → ${r.saw}`)
