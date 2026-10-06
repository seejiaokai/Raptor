/* S24 — cancel, remove and restore: B plus a blank crewed Tuesday line. CX the blank line, then one aircraft only, restore; CX the real late source and the real early target;
   delete and re-add each. Walker A. */
import * as K from './rbl-A-lib.mjs'
const { B, W, R, X, MON, TUE, chk, whole, clean } = K
const id = 'S24'
const { browser, p, errors } = await K.fresh()
try {
  const cs = await B.csOf(p, X)
  const { m, t } = await K.baseB(p)
  await K.addLine(p, TUE, t.gi); const bf = (await K.nLines(p, TUE, t.gi)) - 1
  const sd = await K.seat(p, TUE, t.gi, bf, 0, 'w', X)
  const ok = s => whole(s) && /05:00/.test(K.restText(s) || '') && /4h30/.test(K.restText(s) || '') && clean(s)
  const gone = s => !s.breach && !s.dotMon && clean(s)
  await chk(p, `${id}.0`, `B plus a blank crewed Tuesday line (fi ${bf}, took ${sd.took})`, ok, { monPic: true })
  /* 1. cancel the blank formation (its only aircraft), restore */
  await K.cx(p, TUE, `${TUE}.${t.gi}.${bf}.0`, 'walk S24')
  await chk(p, `${id}.1`, `CX on the blank line's aircraft (the whole blank formation)`, ok, { monPic: true })
  await K.uncx(p, TUE, `${TUE}.${t.gi}.${bf}.0`)
  await chk(p, `${id}.1r`, `…and restored`, ok)
  /* 2. a second aircraft on the blank line; cancel ONE aircraft only */
  await K.boardTo(p, TUE)
  const add = p.locator(`#schedBoard [data-lac="${TUE}.${t.gi}.${bf}"]`).first()
  await add.evaluate(e => e.scrollIntoView({ block: 'center' })); await add.click(); await K.sleep(600)
  const nac = await p.evaluate(([i, g, f]) => window.DAYS[i].waves[g].formations[f].aircraft.length, [TUE, t.gi, bf])
  await K.cx(p, TUE, `${TUE}.${t.gi}.${bf}.0`, 'walk S24 one aircraft')
  await chk(p, `${id}.2`, `the blank line given a second aircraft (${nac} now) and ONLY the first (${cs}'s) aircraft cancelled`, ok, { monPic: true })
  await K.uncx(p, TUE, `${TUE}.${t.gi}.${bf}.0`)
  await chk(p, `${id}.2r`, `…restored`, ok)
  /* 3. the real late source (Monday ZM) cancelled, restored */
  await K.cx(p, MON, `${MON}.${m.gi}.0.0`, 'walk S24 source')
  await chk(p, `${id}.3`, `CX on the REAL late source (Monday ZM 20:00-22:30)`, gone, { monPic: true })
  await K.uncx(p, MON, `${MON}.${m.gi}.0.0`)
  await chk(p, `${id}.3r`, `…the real late source restored`, ok, { monPic: true })
  /* 4. the real early target (Tuesday ZT) cancelled, restored: only the blank line is left for him on Tuesday */
  await K.cx(p, TUE, `${TUE}.${t.gi}.0.0`, 'walk S24 target')
  await chk(p, `${id}.4`, `CX on the REAL early target (Tuesday ZT); only the blank crewed line is left`, s => !s.breach && clean(s), { monPic: true })
  await K.uncx(p, TUE, `${TUE}.${t.gi}.0.0`)
  await chk(p, `${id}.4r`, `…the real early target restored`, ok, { monPic: true })
  /* 5. delete the real source, then re-add it (a new line with the same times, X seated) */
  await K.boardTo(p, MON)
  const dm = p.locator(`#schedBoard [data-ldel="${MON}.${m.gi}.0.0"]`).first()
  await dm.evaluate(e => e.scrollIntoView({ block: 'center' })); await dm.click(); await K.sleep(700)
  const monN = await K.nLines(p, MON, m.gi).catch(() => 'wave gone')
  await chk(p, `${id}.5`, `the real late source DELETED with its ✕ (Monday ZM's wave now has ${monN} line(s))`, gone, { monPic: true })
  const mg = m.gi
  await K.addLine(p, MON, mg).catch(async () => { await K.addFlyWave(p, MON) })
  const mfi = (await K.nLines(p, MON, mg)) - 1
  await K.ff(p, MON, mg, mfi, 'cs', 'ZM'); await K.ff(p, MON, mg, mfi, 'to', '20:00'); await K.ff(p, MON, mg, mfi, 'ld', '22:30')
  const sm = await K.seat(p, MON, mg, mfi, 0, 'w', X)
  await chk(p, `${id}.5r`, `…and re-added as a new Monday line ZM 20:00-22:30 with ${cs} (took ${sm.took})`, ok, { monPic: true })
  /* 6. delete the real target, re-add it */
  await K.boardTo(p, TUE)
  const dt = p.locator(`#schedBoard [data-ldel="${TUE}.${t.gi}.0.0"]`).first()
  await dt.evaluate(e => e.scrollIntoView({ block: 'center' })); await dt.click(); await K.sleep(700)
  await chk(p, `${id}.6`, `the real early target DELETED with its ✕ (the wave keeps ${await K.nLines(p, TUE, t.gi)} line(s): only the blank one)`, s => !s.breach && clean(s), { monPic: true })
  await K.addLine(p, TUE, t.gi); const tfi = (await K.nLines(p, TUE, t.gi)) - 1
  await K.ff(p, TUE, t.gi, tfi, 'cs', 'ZT'); await K.ff(p, TUE, t.gi, tfi, 'br', '05:00'); await K.ff(p, TUE, t.gi, tfi, 'to', '07:00'); await K.ff(p, TUE, t.gi, tfi, 'ld', '08:00')
  const st = await K.seat(p, TUE, t.gi, tfi, 0, 'w', X)
  await chk(p, `${id}.6r`, `…and re-added as a new Tuesday line ZT 07:00-08:00 Brief 05:00 with ${cs} (took ${st.took})`, ok, { monPic: true })
  await K.reload(p)
  await chk(p, `${id}.7`, 'reload', ok, { monPic: true })
} catch (e) { R(`${id}.script`, 'script', String(e.stack || e).slice(0, 700), 'FAIL', [await B.pic(p, `${id}-X`)]) }
await K.wrap('rbl-A-s24', browser, errors, id)
