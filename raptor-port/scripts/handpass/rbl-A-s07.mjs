/* S07 — reporting instruction only: Monday as B; Tuesday's only flight has no times; add "05:00 IN TIME", then "05:00 RALLY", then Brief 06:00. Walker A. */
import * as K from './rbl-A-lib.mjs'
const { B, W, R, X, MON, TUE, chk, whole, txt, clean } = K
const id = 'S07'
const { browser, p, errors } = await K.fresh()
try {
  const cs = await B.csOf(p, X)
  await K.wave(p, MON, 'ZM', 'BFM', '20:00', '22:30', X)
  const t = await K.wave(p, TUE, 'ZT', 'BFM', null, null, X)
  const has = (s, re) => whole(s) && re.test(K.restText(s) || '') && clean(s)
  const s0 = await chk(p, `${id}.0`, `Monday ZM 20:00-22:30; Tuesday ZT with NO times and no reporting line, ${cs} on both (${await K.lineOf(p, TUE, t.gi, 0)})`, s => !s.breach && clean(s), { verdict: undefined, monPic: true })
  await K.itAdd(p, 'board', TUE, t.gi)
  const live = await K.itSet(p, 'board', TUE, t.gi, 0, '05:00 IN TIME')
  console.log('feedback live:', live, '| lines', JSON.stringify(await K.itLines(p, TUE, t.gi)))
  await chk(p, `${id}.1`, `reporting line "05:00 IN TIME" typed (the box said "${live}"; held lines ${JSON.stringify(await K.itLines(p, TUE, t.gi))})`, s => has(s, /05:00/), { monPic: true })
  await K.itSet(p, 'board', TUE, t.gi, 0, '05:00 RALLY')
  await chk(p, `${id}.2`, `the reporting line changed to "05:00 RALLY" (held ${JSON.stringify(await K.itLines(p, TUE, t.gi))})`, s => has(s, /05:00/))
  /* an unrelated blank line, X seated on it: it must not mask the instruction */
  await K.addLine(p, TUE, t.gi); const fi = (await K.nLines(p, TUE, t.gi)) - 1
  const sd = await K.seat(p, TUE, t.gi, fi, 0, 'w', X)
  await chk(p, `${id}.3`, `"+ Line" on Tuesday's wave, blank, ${cs} seated (took ${sd.took}) — unrelated blank leg beside the rally`, s => has(s, /05:00/))
  /* a later Brief on the timed-less line: the EARLIEST report (05:00) must win, not the later Brief */
  await K.ff(p, TUE, t.gi, 0, 'br', '06:00')
  await chk(p, `${id}.4`, `Brief 06:00 typed on the first line (the rally 05:00 stays): ${await K.lineOf(p, TUE, t.gi, 0)}`, s => has(s, /05:00/) && !/06:00/.test(K.restText(s) || ''), { monPic: true })
  /* the rally line deleted: only Brief 06:00 remains -> report 06:00, 5h30 rest */
  await K.itDel(p, 'board', TUE, t.gi, 0)
  await chk(p, `${id}.5`, `the reporting line deleted with its own ✕ (held ${JSON.stringify(await K.itLines(p, TUE, t.gi))}); only Brief 06:00 and the blank leg remain`, s => has(s, /06:00/) && /5h30/.test(K.restText(s) || ''), { monPic: true })
  /* back to IN TIME 05:00 on a fresh line, then Brief removed: the instruction alone */
  await K.itAdd(p, 'board', TUE, t.gi)
  await K.itSet(p, 'board', TUE, t.gi, 0, '05:00 IN TIME')
  await chk(p, `${id}.6`, 'a new "05:00 IN TIME" line typed again beside Brief 06:00', s => has(s, /05:00/))
  await K.ff(p, TUE, t.gi, 0, 'br', '')
  await chk(p, `${id}.7`, `Brief cleared (${await K.lineOf(p, TUE, t.gi, 0)}); the instruction alone again`, s => has(s, /05:00/))
  const u = await K.undo(p); await chk(p, `${id}.7u`, `Undo (${u.pressed}) of the Brief clear`, s => has(s, /0[56]:00/))
  const r = await K.redo(p); await chk(p, `${id}.7r`, `Redo (${r.pressed})`, s => has(s, /05:00/))
  await K.reload(p)
  await chk(p, `${id}.8`, 'reload', s => has(s, /05:00/), { monPic: true })
} catch (e) { R(`${id}.script`, 'script', String(e.stack || e).slice(0, 700), 'FAIL', [await B.pic(p, `${id}-X`)]) }
await K.wrap('rbl-A-s07', browser, errors, id)
