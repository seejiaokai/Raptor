/* S28 — specialised exclusions and non-time rules.
   a: blank SC MAIN / SC SPARE / AVALON / BB — no invented crew-rest rule (judged)
   b: an ordinary blank flying line keeps its seat / AAR / OCU-pairing checks (judged)
   c: SANS availability: Fly unticked vs a timed Fly offer (RECORDED — the SANS part) */
import * as C from './rbl-C-lib.mjs'
const { B, L, W, K, ID, MON, TUE, R, pic, picEl } = C
const which = process.argv[2] || 'all'
const mine = async p => (await B.warnsOf(p, TUE)).filter(w => w.who.includes(ID)).map(w => `${w.sev}/${w.code}: ${w.msg}`)
const all = async p => (await B.warnsOf(p, TUE)).map(w => `${w.sev}/${w.code}${w.who.length ? ' [' + w.who.join(',') + ']' : ''}: ${w.msg}`)

async function partA() {
  const { browser, p, errors } = await K.fresh()
  try {
    const cs = await B.csOf(p, ID)
    const m = await C.flyWave(p, MON, { cs: 'ZM', msn: 'BFM', to: '20:00', ld: '22:30' })
    const outs = []
    let scw = null
    for (const [name, kind, ai] of [['SC MAIN', 'sc', 0], ['SC SPARE', 'sc', 2], ['AVALON', 'avalon', 0], ['BB', 'bb', 0]]) {
      let w
      if (name === 'SC SPARE') w = scw
      else { w = await K.addStandby(p, TUE, kind); await K.ff(p, TUE, w.gi, 0, 'to', ''); await K.ff(p, TUE, w.gi, 0, 'ld', ''); if (kind === 'sc') scw = w }
      let took = null, msg = null
      const tryKeys = [`${TUE}.${w.gi}.0.${ai}.${C.SEAT}`, `${TUE}.${w.gi}.0.${ai}.${C.OPP}`]
      for (const key of tryKeys) { const [d, g, f, a, s] = key.split('.'); const r = await K.seat(p, +d, +g, +f, +a, s, ID); took = r.took; msg = r.msg; if (took) break }
      const mn = await mine(p)
      const pc = await pic(p, `s28-a-${kind}-${ai}`)
      outs.push({ name, took, msg, mn, pc })
    }
    const bad = outs.some(o => o.mn.some(x => /CREW_REST|CREW_TIGHT/.test(x)))
    R('S28.a', `Monday ZM 20:00–22:30 with ${cs}; then on Tuesday, one after another: "+ Wave" → SC (first shift's times cleared, ${cs} in a MAIN seat; then the same wave's SPARE aircraft), AVALON (times cleared), BB — each seat taken from the crew list`,
      outs.map(o => `${o.name}: took ${o.took}${o.msg ? ' (app said "' + o.msg + '")' : ''}; warnings naming him: ${o.mn.length ? JSON.stringify(o.mn) : 'none'}`).join(' | ') + `. Errors: ${errors.join(' | ') || 'none'}`,
      bad ? 'FAIL' : (outs.every(o => o.took) ? 'PASS' : 'PARTIAL'), outs.map(o => o.pc))
  } catch (e) { R('S28.a', 'script', String(e.stack || e).slice(0, 600), 'NOT WALKED', [await pic(p, 's28-a-X').catch(() => '')]) }
  await browser.close()
}
async function partB() {
  const { browser, p, errors } = await K.fresh()
  try {
    const out = []
    /* wrong seat: a pilot in the back seat of a blank line; AAR: a remark on a blank line with a man who is not AAR-qualified; OCU pairing: a student with no instructor */
    const w = await K.addFlyWave(p, TUE)
    const before = await all(p)
    const s1 = await K.seat(p, TUE, w.gi, 0, 0, 'w', 'split')    /* Vandal is a front-seater */
    const a1 = await all(p)
    const d1 = a1.filter(x => !before.includes(x))
    out.push(`front-seat pilot Vandal put in the BACK seat of a blank line (took ${s1.took}${s1.msg ? ', app said "' + s1.msg + '"' : ''}): new warnings ${d1.length ? JSON.stringify(d1) : 'none'}`)
    const p1 = await pic(p, 's28-b-wrongseat')
    await W.boardText(p, `fr:${TUE}.${w.gi}.0.0`, 'AAR')
    const s2 = await K.seat(p, TUE, w.gi, 0, 0, 'p', ID)           /* waldo is not AAR-qualified; put him in the FRONT seat of the AAR line? seat mismatch too */
    const a2 = await all(p)
    const d2 = a2.filter(x => !a1.includes(x))
    out.push(`remark "AAR" typed on the blank line, Scribe (not AAR-qualified) put in the front seat (took ${s2.took}): new warnings ${d2.length ? JSON.stringify(d2) : 'none'}`)
    const p2 = await pic(p, 's28-b-aar')
    const w2 = await K.addFlyWave(p, TUE)
    const s3 = await K.seat(p, TUE, w2.gi, 0, 0, 'w', 'nick')      /* Tally is an OCU student */
    const a3 = await all(p)
    const d3 = a3.filter(x => !a2.includes(x) && /OCU|IP|instructor/i.test(x))
    out.push(`a second blank flying line: OCU student Tally in the back seat with no instructor (took ${s3.took}): OCU/IP warnings ${d3.length ? JSON.stringify(d3) : 'none'}`)
    const p3 = await pic(p, 's28-b-ocu')
    const okSeat = d1.length > 0 || d2.some(x => /QUAL.*cannot fly|cannot fly/i.test(x)), okAar = d2.some(x => /AAR|refuel|air.to.air/i.test(x)), okOcu = d3.length > 0
    R('S28.b', 'ordinary BLANK flying lines (no times): a wrong seat, an AAR remark with an unqualified man, an OCU student with no instructor', out.join(' | ') + `. Errors: ${errors.join(' | ') || 'none'}`, okSeat && okAar && okOcu ? 'PASS' : (okSeat || okAar || okOcu ? 'PARTIAL' : 'FAIL'), [p1, p2, p3])
  } catch (e) { R('S28.b', 'script', String(e.stack || e).slice(0, 600), 'NOT WALKED', [await pic(p, 's28-b-X').catch(() => '')]) }
  await browser.close()
}
async function partC(tag, ticks, span, from, to, flyTimed) {
  const { browser, p, errors } = await K.fresh()
  try {
    const cs = await B.csOf(p, ID)
    const f = await C.fileInput(p, { type: 'SANS Availability', di: TUE, allday: span === 'all', span, from, to, sans: ticks, remarks: '' })
    const filed = await C.inputRowText(p, f.iid)
    const w = await K.addFlyWave(p, TUE)
    if (flyTimed) { await K.ff(p, TUE, w.gi, 0, 'cs', 'ZS'); await K.ff(p, TUE, w.gi, 0, 'msn', 'BFM'); await K.ff(p, TUE, w.gi, 0, 'to', '10:00'); await K.ff(p, TUE, w.gi, 0, 'ld', '11:00') }
    const key = `${TUE}.${w.gi}.0.0.${C.SEAT}`
    const armed = await C.armSeat(p, key)
    const r = await C.rosterX(p)
    const pa = await pic(p, `s28-c-${tag}-armed`)
    const toast = await C.pressName(p)
    const holds = await p.evaluate(k => { const h = document.querySelector(`#schedBoard [data-slot="${k}"]`); return h ? [...h.querySelectorAll('[data-person]')].map(e => e.dataset.person) : [] }, key)
    const mn = await mine(p)
    const sw = await C.seeWeek(p, TUE, `s28-c-${tag}`, { prev: -1 })
    const pk = C.pk2(sw.pk)
    const lines = (sw.list.full || []).filter(x => x.text.includes(C.CSN)).map(x => x.text.replace(/ ✕| ↺/g, ''))
    R(`S28.c.${tag}`, `SANS (${cs}): availability filed on Tuesday — ${filed}; a ${flyTimed ? 'TIMED flying line 10:00–11:00' : 'BLANK flying line'}; seat armed then name pressed`,
      `crew list before placing: ${C.sayRoster(r)}; took ${holds.includes(ID)}; toast ${toast ? '"' + toast + '"' : 'none'}; warnings naming him: ${mn.length ? JSON.stringify(mn) : 'none'}; Tuesday list lines naming him: ${lines.length ? JSON.stringify(lines) : 'none'}; his puck(s): [${pk}]. Errors: ${errors.join(' | ') || 'none'}`, 'RECORDED', [pa, ...sw.pics])
  } catch (e) { R(`S28.c.${tag}`, 'script', String(e.stack || e).slice(0, 600), 'NOT WALKED', [await pic(p, `s28-c-${tag}-X`).catch(() => '')]) }
  await browser.close()
}
if (which === 'a' || which === 'all') await partA()
if (which === 'b' || which === 'all') await partB()
if (which === 'c' || which === 'all') {
  await partC('amt-only-blank', [1], 'all', null, null, false)
  await partC('amt-only-timed', [1], 'all', null, null, true)
  await partC('fly-1400-blank', [0], 'custom', '14:00', '16:00', false)
  await partC('fly-1400-timed', [0], 'custom', '14:00', '16:00', true)
}
B.savePart('rbl-C-s28')
for (const r of B.TABLE) console.log(`${r.verdict}  ${r.id}\n   ${r.did}\n   → ${r.saw}\n   ${r.pics.join(' ')}`)
