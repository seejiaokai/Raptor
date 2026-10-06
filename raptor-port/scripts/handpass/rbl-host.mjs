/* [REST-BLANK-LINE] (D602) — the HOST's own reproduction, run on the build BEFORE the fix and on the build AFTER it.
   Every step asserts the RIGHT behaviour (a PASS means the crew-rest warning is where it should be), so the same
   script is the defect's evidence on the old build and the re-walk on the fixed one (bug-check order §5).
   Everything goes through the app's own controls: + Wave, + Line, the text boxes, the crew list (§7.7).
   Env: HP_URL (the served build), HP_SHOTS (pictures), HP_OUT (the JSON part file), HP_PHONE=1.
   Usage: node scripts/handpass/rbl-host.mjs [h1|h2|h3|h4|all] */
import * as K from './stk-B-lib.mjs'
const { B, L, W, R, pic, picEl, sleep } = K
const which = process.argv[2] || 'all'
const MON = 0, TUE = 1
const ID = 'waldo'          // idle across the demo week

/* what a person can see about him, on the week: Tuesday's list and puck, Monday's puck */
async function see(p, tag) {
  const held = (await B.warnsOf(p, TUE)).filter(x => x.who.includes(ID))
  await W.boardOff(p).catch(() => {})
  await B.toEdit(p)
  await W.showDay(p, TUE)
  const tue = await B.dayPucks(p, '#eWeek', TUE, ID)
  const pT = await B.puckPic(p, '#eWeek', TUE, ID, tag + '-tue-puck')
  await B.openList(p, '#eWeek', TUE)
  const list = await B.readList(p, '#eWeek', TUE)
  const mineOnList = (list.lines || []).filter(x => /Crew rest breach|Tight turn/i.test(x.text))
  const pL = await picEl(p, `#eWeek .day[data-day="${TUE}"] [data-dwbox="${TUE}"]`, tag + '-tue-list', { pad: 8, maxH: 700 })
  await W.showDay(p, MON)
  const mon = await B.dayPucks(p, '#eWeek', MON, ID)
  const pM = await B.puckPic(p, '#eWeek', MON, ID, tag + '-mon-puck')
  return {
    breach: held.some(x => x.code === 'CREW_REST'), turn: held.some(x => x.code === 'TURN'),
    codes: held.map(x => `${x.sev}/${x.code}`).join(', ') || 'none',
    listBar: list.bar, listLines: mineOnList.map(x => x.text.slice(0, 70)),
    tue: B.pk(tue), mon: B.pk(mon),
    ringTue: tue.some(x => x.warn && x.sev === 'hard'), dotMon: mon.some(x => x.dot),
    pics: [pT, pL, pM],
  }
}
const says = s => `held: ${s.codes} · Tuesday's list "${s.listBar}" ${JSON.stringify(s.listLines)} · his Tuesday pucks [${s.tue}] · his Monday pucks [${s.mon}]`
const whole = s => s.breach && s.ringTue && s.dotMon && s.listLines.some(t => /Crew rest breach/.test(t))

/* a late Monday (lands 22:30) and an early Tuesday (07:00 take-off) for him — the base breach */
async function lateMon(p) {
  const m = await K.addFlyWave(p, MON)
  await K.ff(p, MON, m.gi, 0, 'cs', 'ZM'); await K.ff(p, MON, m.gi, 0, 'msn', 'BFM'); await K.ff(p, MON, m.gi, 0, 'to', '21:00'); await K.ff(p, MON, m.gi, 0, 'ld', '22:30')
  const s = await K.seat(p, MON, m.gi, 0, 0, 'w', ID)
  return { ...m, took: s.took, msg: s.msg }
}
async function earlyTue(p) {
  const t = await K.addFlyWave(p, TUE)
  await K.ff(p, TUE, t.gi, 0, 'cs', 'ZT'); await K.ff(p, TUE, t.gi, 0, 'msn', 'BFM'); await K.ff(p, TUE, t.gi, 0, 'to', '07:00'); await K.ff(p, TUE, t.gi, 0, 'ld', '08:30')
  const s = await K.seat(p, TUE, t.gi, 0, 0, 'w', ID)
  return { ...t, took: s.took, msg: s.msg }
}
const nLines = (p, di, gi) => p.evaluate(([i, g]) => window.DAYS[i].waves[g].formations.length, [di, gi])

/* H1 — TODAY: the filed fault. He has the breach; "+ Line", seat him on the blank line; then a landing; a take-off; blank again; reload. */
async function h1() {
  const { browser, p, errors } = await K.fresh()
  try {
    const cs = await B.csOf(p, ID)
    const m = await lateMon(p), t = await earlyTue(p)
    const s0 = await see(p, 'h1-0-base')
    R('H1.0', `${cs}: Monday new wave ZM 21:00–22:30 (seated ${m.took}); Tuesday new wave ZT 07:00–08:30 (seated ${t.took})`, says(s0), whole(s0) ? 'PASS' : 'FAIL', s0.pics)

    await K.addLine(p, TUE, t.gi)
    const fi = (await nLines(p, TUE, t.gi)) - 1
    const blankIs = await p.evaluate(([i, g, f]) => { const x = window.DAYS[i].waves[g].formations[f]; return `cs "${x.cs}" to "${x.to}" ld "${x.ld}"` }, [TUE, t.gi, fi])
    const st = await K.seat(p, TUE, t.gi, fi, 0, 'w', ID)
    const pB = await picEl(p, `#schedBoard [data-slot="${TUE}.${t.gi}.${fi}.0.w"]`, 'h1-1-board-blank-line', { pad: 160 })
    const s1 = await see(p, 'h1-1-blank')
    R('H1.1', `"+ Line" on Tuesday (the new line: ${blankIs}); ${cs} put in its back seat from the crew list (took ${st.took}${st.msg ? ', app said "' + st.msg + '"' : ''})`, says(s1), whole(s1) ? 'PASS' : 'FAIL', [pB, ...s1.pics])

    await K.ff(p, TUE, t.gi, fi, 'ld', '15:00')
    const s2 = await see(p, 'h1-2-landing-only')
    R('H1.2', 'a landing 15:00 typed on that line, no take-off', says(s2), whole(s2) ? 'PASS' : 'FAIL', s2.pics)

    await K.ff(p, TUE, t.gi, fi, 'to', '14:00')
    const s3 = await see(p, 'h1-3-takeoff')
    R('H1.3', 'a take-off 14:00 typed on that line', says(s3), whole(s3) ? 'PASS' : 'FAIL', s3.pics)

    await K.ff(p, TUE, t.gi, fi, 'to', ''); await K.ff(p, TUE, t.gi, fi, 'ld', '')
    const again = await p.evaluate(([i, g, f]) => { const x = window.DAYS[i].waves[g].formations[f]; return `to "${x.to}" ld "${x.ld}"` }, [TUE, t.gi, fi])
    const s4 = await see(p, 'h1-4-cleared')
    R('H1.4', `both times cleared again (${again})`, says(s4), whole(s4) ? 'PASS' : 'FAIL', s4.pics)

    await B.reloadAs(p, 'a'); await B.toEdit(p)
    const s5 = await see(p, 'h1-5-reload')
    R('H1.5', 'the page reloaded and signed in again', says(s5), whole(s5) ? 'PASS' : 'FAIL', s5.pics)
  } catch (e) { R('H1', 'script', String(e.stack || e).slice(0, 600), 'FAIL', [await pic(p, 'h1-X')]) }
  R('H1.err', 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
  await browser.close()
}

/* H2 — YESTERDAY: a blank crewed line on Monday, in a wave drawn BEFORE his late landing */
async function h2() {
  const { browser, p, errors } = await K.fresh()
  try {
    const cs = await B.csOf(p, ID)
    const b = await K.addFlyWave(p, MON)
    const sb = await K.seat(p, MON, b.gi, 0, 0, 'w', ID)
    const m = await lateMon(p)
    const order = await p.evaluate(i => window.DAYS[i].waves.map(w => w.label + ':' + w.formations.map(f => f.cs || '(blank)').join('/')).slice(-2).join('  then  '), MON)
    const t = await earlyTue(p)
    const s = await see(p, 'h2-blank-monday-first')
    R('H2.1', `Monday: a new wave whose one line is blank, ${cs} in it (took ${sb.took}); then a second new wave ZM 21:00–22:30 with ${cs} (took ${m.took}) — drawn in that order: ${order}; Tuesday ZT 07:00 (took ${t.took})`, says(s), whole(s) ? 'PASS' : 'FAIL', s.pics)
  } catch (e) { R('H2', 'script', String(e.stack || e).slice(0, 600), 'FAIL', [await pic(p, 'h2-X')]) }
  R('H2.err', 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
  await browser.close()
}

/* H3 — THE SAME-DAY TIGHT TURN: two legs 30 minutes apart, a blank crewed line drawn between them */
async function h3() {
  const { browser, p, errors } = await K.fresh()
  try {
    const cs = await B.csOf(p, ID)
    const t = await K.addFlyWave(p, TUE)
    await K.ff(p, TUE, t.gi, 0, 'cs', 'ZA'); await K.ff(p, TUE, t.gi, 0, 'to', '07:30'); await K.ff(p, TUE, t.gi, 0, 'ld', '09:00')
    const a = await K.seat(p, TUE, t.gi, 0, 0, 'w', ID)
    await K.addLine(p, TUE, t.gi)                       /* the blank line, between the two */
    const bl = await K.seat(p, TUE, t.gi, 1, 0, 'w', ID)
    await K.addLine(p, TUE, t.gi)
    await K.ff(p, TUE, t.gi, 2, 'cs', 'ZC'); await K.ff(p, TUE, t.gi, 2, 'to', '09:30'); await K.ff(p, TUE, t.gi, 2, 'ld', '11:00')
    const c = await K.seat(p, TUE, t.gi, 2, 0, 'w', ID)
    const s = await see(p, 'h3-turn')
    const ok = s.turn && s.listLines.some(x => /Tight turn ZA/.test(x))
    R('H3.1', `Tuesday one new wave, three lines: ZA 07:30–09:00, a blank line, ZC 09:30–11:00 — ${cs} in all three (took ${a.took}, ${bl.took}, ${c.took})`, says(s), ok ? 'PASS' : 'FAIL', s.pics)
  } catch (e) { R('H3', 'script', String(e.stack || e).slice(0, 600), 'FAIL', [await pic(p, 'h3-X')]) }
  R('H3.err', 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
  await browser.close()
}

/* H4 — the same turn with the LATER leg drawn first: ZC 09:30–11:00, a blank line, ZA 07:30–09:00 (found by the host re-reading
   its own fix, 6 Oct 26: a sort cannot place a line with no times, so the real legs stayed in drawn order and paired backwards) */
async function h4() {
  const { browser, p, errors } = await K.fresh()
  try {
    const cs = await B.csOf(p, ID)
    const t = await K.addFlyWave(p, TUE)
    await K.ff(p, TUE, t.gi, 0, 'cs', 'ZC'); await K.ff(p, TUE, t.gi, 0, 'to', '09:30'); await K.ff(p, TUE, t.gi, 0, 'ld', '11:00')
    const c = await K.seat(p, TUE, t.gi, 0, 0, 'w', ID)
    await K.addLine(p, TUE, t.gi)
    const bl = await K.seat(p, TUE, t.gi, 1, 0, 'w', ID)
    await K.addLine(p, TUE, t.gi)
    await K.ff(p, TUE, t.gi, 2, 'cs', 'ZA'); await K.ff(p, TUE, t.gi, 2, 'to', '07:30'); await K.ff(p, TUE, t.gi, 2, 'ld', '09:00')
    const a = await K.seat(p, TUE, t.gi, 2, 0, 'w', ID)
    const s = await see(p, 'h4-turn-reversed')
    const ok = s.turn && s.listLines.some(x => /Tight turn ZA/.test(x))
    R('H4.1', `Tuesday one new wave, three lines drawn in this order: ZC 09:30–11:00, a blank line, ZA 07:30–09:00 — ${cs} in all three (took ${c.took}, ${bl.took}, ${a.took})`, says(s), ok ? 'PASS' : 'FAIL', s.pics)
  } catch (e) { R('H4', 'script', String(e.stack || e).slice(0, 600), 'FAIL', [await pic(p, 'h4-X')]) }
  R('H4.err', 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
  await browser.close()
}

if (which === 'h1' || which === 'all') await h1()
if (which === 'h2' || which === 'all') await h2()
if (which === 'h3' || which === 'all') await h3()
if (which === 'h4' || which === 'all') await h4()
B.savePart('rbl-host')
for (const r of B.TABLE) console.log(`${r.verdict}  ${r.id}  ${r.did}\n      → ${r.saw}`)
