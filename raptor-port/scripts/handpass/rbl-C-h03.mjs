/* H-03 (RECORDED) — Tuesday "+ Wave" → SC; clear the first shift's start and end; X in its first MAIN seat. Every warning line naming X or that shift, and his puck's chip. */
import * as C from './rbl-C-lib.mjs'
const { B, L, W, K, ID, MON, TUE, R, pic, picEl } = C

async function record(p, tag, gi) {
  const s = await C.seeWeek(p, TUE, tag, { prev: MON })
  const lines = (s.list.full || []).filter(x => new RegExp(`${C.CSN}|\\bSC\\b|SC MAIN|shift`, 'i').test(x.text)).map(x => `[${x.sev}] ${x.text.replace(/ ✕| ↺/g, '')}`)
  const held = (await B.warnsOf(p, TUE)).filter(w => w.who.includes(C.ID) || /\bSC\b|shift/i.test(w.msg)).map(w => `${w.sev}/${w.code}: ${w.msg}`)
  const sc = s.pk.filter(x => x.where === 'flying line')
  await K.boardTo(p, TUE); await C.sleep(400)
  const bw = await B.boardOpenFold(p).catch(() => {}); const bl = await B.readBoard(p)
  const boardLines = (bl.lines || []).filter(x => new RegExp(`${C.CSN}|\\bSC\\b|shift`, 'i').test(x.text)).map(x => x.text)
  const bpk = await C.painted(p, '#schedBoard', C.ID)
  const pb = await C.picEl(p, `#schedBoard [data-slot="${TUE}.${gi}.0.0.${C.SEAT}"]`, `${tag}-board-seat`, { pad: 200, maxH: 500 })
  const pw = await C.picEl(p, '#schedBoard .sb-warn', `${tag}-board-warnings`, { pad: 6, maxH: 600 })
  return { bar: s.list.bar, lines, held, week: C.pk2(s.pk), prev: C.pk2(s.pv), boardBar: bl.head, boardLines, board: C.pk2(bpk), pics: [...s.pics, pb, pw] }
}
const say = r => `Tuesday bar "${r.bar}"; week list lines naming him or the SC shift: ${r.lines.length ? JSON.stringify(r.lines) : 'none'}; warnings the app holds that name him or the shift: ${r.held.length ? JSON.stringify(r.held) : 'none'}; his pucks on the week: [${r.week}]; Monday: [${r.prev}]; Board panel "${r.boardBar}" lines: ${r.boardLines.length ? JSON.stringify(r.boardLines) : 'none'}; his pucks on the Board: [${r.board}]`

for (const variant of ['plain', 'late-monday']) {
  const { browser, p, errors } = await K.fresh()
  try {
    const cs = await B.csOf(p, ID)
    let note = ''
    if (variant === 'late-monday') { const m = await C.flyWave(p, MON, { cs: 'ZM', msn: 'BFM', to: '20:00', ld: '22:30' }); note = ` Monday first: ZM 20:00–22:30 with ${cs} (took ${m.took}).` }
    const w = await K.addStandby(p, TUE, 'sc')
    const before = { to: await C.formVal(p, TUE, w.gi, 0, 'to'), ld: await C.formVal(p, TUE, w.gi, 0, 'ld') }
    await K.ff(p, TUE, w.gi, 0, 'to', ''); await K.ff(p, TUE, w.gi, 0, 'ld', '')
    const after = { to: await C.formVal(p, TUE, w.gi, 0, 'to'), ld: await C.formVal(p, TUE, w.gi, 0, 'ld') }
    const s = await K.seat(p, TUE, w.gi, 0, 0, C.SEAT, ID)
    const holds = await p.evaluate(([d, g, st]) => window.DAYS[d].waves[g].formations[0].aircraft[0][st], [TUE, w.gi, C.SEAT])
    const r = await record(p, `h03-${variant}`, w.gi)
    R(`H-03.${variant}`, `Tuesday "+ Wave" → SC (first shift came as to "${before.to}" ld "${before.ld}"); cleared both boxes (now to "${after.to}" ld "${after.ld}"); ${cs} put in the first MAIN seat (took ${s.took}${s.msg ? ', app said "' + s.msg + '"' : ''}; seat holds "${holds}").${note}`, say(r) + `. Errors: ${errors.join(' | ') || 'none'}`, 'RECORDED', r.pics)
  } catch (e) { R(`H-03.${variant}`, 'script', String(e.stack || e).slice(0, 600), 'NOT WALKED', [await pic(p, `h03-${variant}-X`).catch(() => '')]) }
  await browser.close()
}
B.savePart('rbl-C-h03')
for (const r of B.TABLE) console.log(`${r.verdict}  ${r.id}\n   ${r.did}\n   → ${r.saw}\n   ${r.pics.join(' ')}`)
