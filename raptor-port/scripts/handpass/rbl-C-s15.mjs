/* S15 (RECORDED) — all-day leave / a downchit against an ordinary flight line with no times.
   Records what each surface showed, no verdict. X = RBL_X (default waldo). */
import * as C from './rbl-C-lib.mjs'
const { B, L, W, K, ID, MON, TUE, R, pic, picEl } = C

async function stage(p, label, { shots = false, tag }) {
  const s = await C.seeWeek(p, TUE, tag, { prev: -1, noPics: !shots })
  const ws = s.held.map(w => `${w.sev}/${w.code}: ${w.msg}`)
  const lines = (s.list.full || []).filter(x => x.text.includes(C.CSN)).map(x => x.text.replace(/ ✕| ↺/g, '').slice(0, 220))
  return { label, bar: s.list.bar, warns: ws, lines, pk: C.pk2(s.pk), pics: s.pics }
}
const say = st => `${st.label}: bar "${st.bar}"; his warnings held: ${st.warns.length ? JSON.stringify(st.warns) : 'none'}; lines in Tuesday's list naming him: ${st.lines.length ? JSON.stringify(st.lines) : 'none'}; his puck(s) that day: [${st.pk}]`

async function run(kind, type, id) {
  const { browser, p, errors } = await K.fresh()
  const out = [], pics = []
  try {
    const cs = await B.csOf(p, ID)
    const f = await C.fileInput(p, { type, di: TUE, allday: true, remarks: 'S15 ' + kind })
    out.push(`filed ${type} all day on Tuesday for ${cs} through the Inputs page (row: ${await C.inputRowText(p, f.iid)}; asked: ${f.asked.join(',') || 'nothing'})`)
    const m = await K.addFlyWave(p, TUE)
    out.push(`"+ Wave" → Flying wave (its first line comes up blank: ${await C.lineNow(p, TUE, m.gi, 0)})`)
    const key = `${TUE}.${m.gi}.0.0.${C.SEAT}`
    const armed = await C.armSeat(p, key)
    const r = await C.rosterX(p)
    pics.push(await pic(p, `s15-${kind}-1-armed-crewlist`))
    const toast = await C.pressName(p)
    const holds = await p.evaluate(k => { const h = document.querySelector(`#schedBoard [data-slot="${k}"]`); return h ? [...h.querySelectorAll('[data-person]')].map(e => e.dataset.person) : [] }, key)
    out.push(`armed the seat (${armed}); in the crew list his name: ${C.sayRoster(r)}; pressed his name → took ${holds.includes(ID)}, toast: ${toast ? '"' + toast + '"' : 'none'}`)
    pics.push(await pic(p, `s15-${kind}-2-placed`))
    const s1 = await stage(p, 'placed on the blank line', { shots: true, tag: `s15-${kind}-placed` }); out.push(say(s1)); pics.push(...s1.pics)
    await K.ff(p, TUE, m.gi, 0, 'cs', 'ZL'); await K.ff(p, TUE, m.gi, 0, 'msn', 'BFM'); await K.ff(p, TUE, m.gi, 0, 'to', '10:00'); await K.ff(p, TUE, m.gi, 0, 'ld', '11:00')
    const s2 = await stage(p, 'take-off 10:00, landing 11:00 typed', { shots: true, tag: `s15-${kind}-timed` }); out.push(say(s2)); pics.push(...s2.pics)
    await K.ff(p, TUE, m.gi, 0, 'to', ''); await K.ff(p, TUE, m.gi, 0, 'ld', '')
    out.push(`(boxes now ${await C.lineNow(p, TUE, m.gi, 0)})`)
    const s3 = await stage(p, 'both times cleared again', { shots: true, tag: `s15-${kind}-cleared` }); out.push(say(s3)); pics.push(...s3.pics)
    await B.reloadAs(p, 'a'); await B.toEdit(p)
    const s4 = await stage(p, 'after a reload', { shots: true, tag: `s15-${kind}-reload` }); out.push(say(s4)); pics.push(...s4.pics)
    out.push(`Errors: ${errors.join(' | ') || 'none'}`)
    R(id, `${kind} (${type}) all day Tuesday for ${cs}, fresh blank flying line, seat armed then name pressed; times typed then cleared; reload`, out.join('  ||  '), 'RECORDED', pics)
  } catch (e) { out.push('script error: ' + String(e.stack || e).slice(0, 500)); pics.push(await pic(p, `s15-${kind}-X`).catch(() => '')); R(id, kind, out.join(' || '), 'NOT WALKED', pics) }
  await browser.close()
}
const which = process.argv[2] || 'all'
if (which === 'leave' || which === 'all') await run('leave', 'LL', 'S15.leave')
if (which === 'down' || which === 'all') await run('downchit', 'ATT C', 'S15.downchit')
B.savePart('rbl-C-s15')
for (const r of B.TABLE) console.log(`${r.verdict}  ${r.id}\n   ${r.did}\n   → ${r.saw}\n   ${r.pics.join(' ')}`)
