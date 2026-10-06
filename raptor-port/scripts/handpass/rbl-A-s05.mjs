/* S05 — today's extra blank line: "+ Line" then "+ Wave" on Tuesday; seat X, remove X, reseat X; each change before -> after -> Undo -> Redo, then a reload.
   Walker A. Env: HP_URL HP_SHOTS HP_OUT HP_PHONE. Usage: node rbl-A-s05.mjs [line|wave|all] */
import * as K from './rbl-A-lib.mjs'
const { B, W, R, X, MON, TUE, see, whole, brief } = K
const which = process.argv[2] || 'all'
const SZ = K.PHONE ? 'phone' : 'desk'

async function variant(kind) {
  const { browser, p, errors } = await K.fresh()
  const id = `S05-${kind}-${SZ}`
  try {
    const cs = await B.csOf(p, X)
    const { t } = await K.baseB(p)
    const base = await see(p, `${id}-0-base`, { monPic: true })
    R(`${id}.0`, `Baseline B for ${cs}: Monday new wave ZM 20:00-22:30, Tuesday new wave ZT 07:00-08:00 with typed Brief 05:00, ${cs} on both`, brief(base), whole(base) && /4h30/.test(K.restText(base) || '') ? 'PASS' : 'FAIL', base.shots)
    const baseTxt = K.restText(base)

    let gi = t.gi, fi = 0
    /* ---- 1. create the blank line / wave ---- */
    if (kind === 'line') { await K.addLine(p, TUE, t.gi); fi = (await K.nLines(p, TUE, t.gi)) - 1 }
    else { const w = await K.addFlyWave(p, TUE); gi = w.gi; fi = 0 }
    const blank = await K.lineOf(p, TUE, gi, fi)
    /* where the app holds the new blank line and its seat, right now */
    const state = async () => { const n = await K.nLines(p, TUE, t.gi).catch(() => '?'); const nw = await K.nWaves(p, TUE); const sh = await K.seatOf(p, TUE, gi, fi).catch(() => '(line gone)'); return ` [Tue has ${nw} waves, wave ${t.gi} has ${n} lines; blank-line back seat holds "${sh}"]` }
    const mut = async (label, mutate, pics = true) => {
      /* BEFORE was the previous snapshot; run the change then the three reads */
      await mutate()
      const a = await see(p, `${id}-${label}-after`, { pics })
      R(`${id}.${label}.after`, `${label} (the new line is: ${blank})`, brief(a) + await state(), whole(a) ? 'PASS' : 'FAIL', a.shots)
      const u = await K.undo(p)
      const su = await see(p, `${id}-${label}-undo`, { pics: 'list' })
      R(`${id}.${label}.undo`, `Undo pressed (${JSON.stringify({ pressed: u.pressed, title: u.title })}; the app said ${JSON.stringify(u.toasts || [])})`, brief(su) + await state(), whole(su) ? 'PASS' : 'FAIL', su.shots)
      const r = await K.redo(p)
      const sr = await see(p, `${id}-${label}-redo`, { pics: 'list' })
      R(`${id}.${label}.redo`, `Redo pressed (${JSON.stringify({ pressed: r.pressed, title: r.title })}; ${JSON.stringify(r.toasts || [])})`, brief(sr) + await state(), whole(sr) ? 'PASS' : 'FAIL', sr.shots)
      return a
    }
    /* the line itself was created already: read it as the first "after" (before -> after of the creation) */
    const s1 = await see(p, `${id}-1-created`, { pics: true })
    R(`${id}.1.created`, `"+ ${kind === 'line' ? 'Line' : 'Wave'}" on Tuesday — blank, nobody seated (${blank})`, brief(s1) + await state(), whole(s1) ? 'PASS' : 'FAIL', s1.shots)
    const u1 = await K.undo(p); const s1u = await see(p, `${id}-1-undo`, { pics: 'list' })
    R(`${id}.1.undo`, `Undo of the creation (${JSON.stringify({ pressed: u1.pressed, title: u1.title })})`, brief(s1u) + await state(), whole(s1u) ? 'PASS' : 'FAIL', s1u.shots)
    const r1 = await K.redo(p); const s1r = await see(p, `${id}-1-redo`, { pics: 'list' })
    R(`${id}.1.redo`, `Redo of the creation (${JSON.stringify({ pressed: r1.pressed, title: r1.title })})`, brief(s1r) + await state(), whole(s1r) ? 'PASS' : 'FAIL', s1r.shots)

    /* ---- 2. seat X on it ---- */
    let took = null
    await mut('2-seat', async () => { const s = await K.seat(p, TUE, gi, fi, 0, 'w', X); took = s.took })
    /* the seat after the undo/redo round: is he still on the blank line? */
    const there = await K.seatOf(p, TUE, gi, fi)
    R(`${id}.2.seatheld`, `after the Undo/Redo round, who is in the blank line's back seat (took ${took})`, `seat holds "${there}"`, there === X ? 'PASS' : 'FAIL')
    /* ---- 3. take X off ---- */
    if (there === X) {
      await mut('3-remove', async () => { const o = await K.takeOff(p, TUE, gi, fi); console.log('takeoff', o) })
      const there3 = await K.seatOf(p, TUE, gi, fi)
      R(`${id}.3.seatheld`, 'after that round, who is in the blank line seat', `seat holds "${there3}"`, 'RECORDED')
      /* ---- 4. reseat X ---- */
      if (there3 !== X) await mut('4-reseat', async () => { const s = await K.seat(p, TUE, gi, fi, 0, 'w', X); took = s.took })
    }
    /* ---- 5. reload and read again (X is on the blank line when the state is rebuilt) ---- */
    const before = await K.seatOf(p, TUE, gi, fi)
    await K.reload(p)
    const rl = await see(p, `${id}-5-reload`, { pics: true, monPic: true })
    R(`${id}.5.reload`, `page reloaded, signed in again (blank line seat held "${before}" before)`, brief(rl) + await state(), whole(rl) ? 'PASS' : 'FAIL', rl.shots)
    R(`${id}.base-text`, 'the rest sentence at the baseline vs after reload', `base "${baseTxt}" | reload "${K.restText(rl)}"`, baseTxt === K.restText(rl) ? 'PASS' : 'RECORDED')
  } catch (e) { R(`${id}.script`, 'script', String(e.stack || e).slice(0, 700), 'FAIL', [await B.pic(p, `${id}-X`)]) }
  R(`${id}.err`, 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
  await browser.close()
}
if (which === 'line' || which === 'all') await variant('line')
if (which === 'wave' || which === 'all') await variant('wave')
B.savePart('rbl-A-s05')
for (const r of B.TABLE) console.log(`${r.verdict}  ${r.id}  ${r.did}\n      → ${r.saw}`)
