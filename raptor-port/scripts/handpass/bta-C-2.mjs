/* WALKER C, script 2: S32, S33, S34, S35, S20 (desktop). Usage: node scripts/handpass/bta-C-2.mjs [s32|s33|s34|s35|s20|all] */
import * as X from './bta-C-lib.mjs'
const { B, K, R, ID, CSN, MON, TUE, WED, pic, sleep } = X
const which = process.argv[2] || 'all'
const placed = async (p, k) => (await X.holds(p, k)) === ID
const struckBy = (a, re) => a.r.struck && re.test(X.reasonOf(a))
const boxVal = (p, di, gi, f) => p.evaluate(([i, g, k]) => { const e = document.querySelector(`#schedBoard [data-bfld="ff:${i}.${g}.0.${k}"]`); return e ? (e.value !== undefined && e.tagName === 'INPUT' ? e.value : e.textContent) : null }, [di, gi, f])

/* S32 — the boundary: B 12:29 / 12:30 / 12:31 against clearance 12:30, shift start 14:00; then B 13:00 with shift start 12:00 */
async function s32() {
  const { browser, p, errors } = await K.fresh()
  try {
    const mon = await X.mondayLate(p)
    const sc = await X.scTuesday(p, { to: '14:00', ld: '19:00', br: '12:29' })
    const k = X.key(TUE, sc.gi, 0, 1)
    for (const [b, to, want] of [['12:29', '14:00', true], ['12:30', '14:00', false], ['12:31', '14:00', false], ['13:00', '12:00', true]]) {
      await K.ff(p, TUE, sc.gi, 0, 'br', b); await K.ff(p, TUE, sc.gi, 0, 'to', to)
      const a = await X.readArmed(p, k, `s32-b${b.replace(':', '')}-to${to.replace(':', '')}`)
      const said = X.reasonOf(a)
      const gotStruck = a.r.struck && /crew rest — not clear until 12:30/.test(said)
      R(`S32.${b}/${to}`, `Cobra seated in MAIN row 0; Monday landing 22:30 (clear 12:30); B typed ${b}, shift start ${to}; the other MAIN seat armed (${await X.shiftNow(p, TUE, sc.gi)})`,
        `crew list: ${a.said}`, gotStruck === want ? 'PASS' : 'FAIL', [a.shot])
      await X.disarm(p)
    }
  } catch (e) { R('S32', 'script', String(e.stack || e).slice(0, 600), 'FAIL', [await pic(p, 's32-X')]) }
  R('S32.err', 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
  await browser.close()
}

/* S33 — early shift start 01:00 with B 23:00 (the previous evening); then B cleared */
async function s33() {
  const { browser, p, errors } = await K.fresh()
  try {
    await X.mondayLate(p)
    const sc = await X.scTuesday(p, { to: '01:00', ld: '07:00', br: '23:00' })
    const k = X.key(TUE, sc.gi, 0, 1)
    const a1 = await X.readArmed(p, k, 's33-b2300-armed')
    R('S33.1', `Monday landing 22:30; Tuesday SC ${await X.shiftNow(p, TUE, sc.gi)}; Cobra seated; the other MAIN seat armed`, `crew list: ${a1.said}`, a1.r.struck && /crew rest/.test(X.reasonOf(a1)) ? 'PASS' : 'FAIL', [a1.shot])
    await X.disarm(p)
    await K.ff(p, TUE, sc.gi, 0, 'br', '')
    const a2 = await X.readArmed(p, k, 's33-b-cleared-armed')
    R('S33.2', `B cleared (${await X.shiftNow(p, TUE, sc.gi)}); the same seat armed again`, `crew list: ${a2.said}`, a2.r.struck && /crew rest/.test(X.reasonOf(a2)) ? 'PASS' : 'FAIL', [a2.shot])
    await X.disarm(p)
    /* B typed again, placed: the breach after the drop */
    await K.ff(p, TUE, sc.gi, 0, 'br', '23:00')
    const a3 = await X.readArmed(p, k, 's33-b2300-again')
    const toast = await X.pressName(p)
    const held = await X.restWarns(p, TUE); const heldM = await X.restWarns(p, MON)
    R('S33.3', `B 23:00 typed again, armed, his name pressed → placed ${await placed(p, k)}`, `before: ${a3.said} · toast ${toast ? '"' + toast.slice(0, 220) + '"' : 'nothing'} · Tuesday crew-rest warnings: ${X.shortWarns(held)} · Monday: ${X.shortWarns(heldM)}`,
      a3.r.struck && held.length + heldM.length >= 1 ? 'PASS' : 'FAIL', [await pic(p, 's33-placed')])
  } catch (e) { R('S33', 'script', String(e.stack || e).slice(0, 600), 'FAIL', [await pic(p, 's33-X')]) }
  R('S33.err', 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
  await browser.close()
}

/* S34 — which siblings count */
async function s34() {
  const { browser, p, errors } = await K.fresh()
  try {
    await X.mondayLate(p)
    const sc = await X.scTuesday(p, { to: '13:00', ld: '19:00', br: '05:00', cobra: false })
    const kMain = X.key(TUE, sc.gi, 0, 1), kMain0 = X.key(TUE, sc.gi, 0, 0), kSpare = X.key(TUE, sc.gi, 0, 2)
    /* (a) empty formation */
    const a1 = await X.readArmed(p, kMain0, 's34-a-empty-main'); await X.disarm(p)
    R('S34.a', `SC shift 13:00–19:00 B 05:00, nobody seated; a MAIN seat (${kMain0}) armed`, `crew list: ${a1.said}`, 'RECORDED', [a1.shot])
    /* (a2) empty formation, early shift start: the older shift-start check */
    await K.ff(p, TUE, sc.gi, 0, 'to', '12:00')
    const a1b = await X.readArmed(p, kMain0, 's34-a2-empty-early-start'); await X.disarm(p)
    R('S34.a2', `nobody seated; shift start typed 12:00 (before his 12:30 clearance), B 05:00; the MAIN seat armed`, `crew list: ${a1b.said}`, a1b.r.struck && /not clear until 12:30/.test(X.reasonOf(a1b)) ? 'PASS' : 'FAIL', [a1b.shot])
    await K.ff(p, TUE, sc.gi, 0, 'to', '13:00')
    /* (b) only a SPARE occupant */
    const sp = await K.seat(p, TUE, sc.gi, 0, 2, 'p', X.COBRA)
    const a2 = await X.readArmed(p, kMain0, 's34-b-spare-only'); await X.disarm(p)
    R('S34.b', `Cobra seated on a SPARE row only (took ${sp.took}); a MAIN seat armed`, `crew list: ${a2.said}`, !(a2.r.struck && /not clear until 12:30/.test(X.reasonOf(a2))) ? 'PASS' : 'FAIL', [a2.shot])
  } catch (e) { R('S34.pre', 'script', String(e.stack || e).slice(0, 600), 'FAIL', [await pic(p, 's34-X')]) }
  try {
    /* (c) a MAIN sibling: undo the SPARE placement, seat Cobra in MAIN row 0 */
    const sc = { gi: await p.evaluate(i => window.DAYS[i].waves.findIndex(w => /SC/.test(w.label)), TUE) }
    const kMain = X.key(TUE, sc.gi, 0, 1)
    const d = await B.W.door(p, 'board', 'undo')
    const held0 = await X.holds(p, X.key(TUE, sc.gi, 0, 2, 'p'))
    const sib = await K.seat(p, TUE, sc.gi, 0, 0, 'p', X.COBRA)
    const a3 = await X.readArmed(p, kMain, 's34-c-main-sibling')
    R('S34.c', `the SPARE placement taken back with Undo (SPARE seat now holds "${held0}"), Cobra seated in MAIN row 0 (took ${sib.took}); the other MAIN seat armed`, `crew list: ${a3.said}`, a3.r.struck && /not clear until 12:30/.test(X.reasonOf(a3)) ? 'PASS' : 'FAIL', [a3.shot])
    /* (d) remove the sibling while armed: the board's Undo (does the armed list refresh without re-arming?) */
    const d2 = await B.W.door(p, 'board', 'undo')
    await sleep(300)
    const armedAfter = await p.evaluate(() => (window.ARM && window.ARM.key) || null)
    const rLive = await X.rosterX(p); const rowLive = await X.crewListRow(p)
    const sLive = await pic(p, 's34-d-sibling-removed-live')
    const heldNow = await X.holds(p, X.key(TUE, sc.gi, 0, 0, 'p'))
    R('S34.d1', `Cobra taken out of MAIN by the board's Undo (his seat now "${heldNow}"; Undo said ${JSON.stringify(d2.toasts || d2.title || '')}); the armed seat was ${armedAfter ? 'still armed (' + armedAfter + ')' : 'disarmed by it'}`,
      `crew list right then: ${X.sayRoster(rLive)}${rowLive ? ' · row "' + rowLive.slice(0, 120) + '"' : ''}`, 'RECORDED', [sLive])
    const a4 = await X.readArmed(p, kMain, 's34-d-sibling-removed-rearmed')
    R('S34.d2', `the other MAIN seat armed again with nobody else in MAIN`, `crew list: ${a4.said}`, !(a4.r.struck && /not clear until 12:30/.test(X.reasonOf(a4))) ? 'PASS' : 'FAIL', [a4.shot])
    await X.disarm(p)
    const d3 = await B.W.door(p, 'board', 'redo')
    const heldBack = await X.holds(p, X.key(TUE, sc.gi, 0, 0, 'p'))
    const a5 = await X.readArmed(p, kMain, 's34-d-sibling-restored')
    R('S34.d3', `Redo → Cobra back in MAIN (seat "${heldBack}"); the other MAIN seat armed again`, `crew list: ${a5.said}`, heldBack === X.COBRA ? (a5.r.struck && /not clear until 12:30/.test(X.reasonOf(a5)) ? 'PASS' : 'FAIL') : 'PARTIAL', [a5.shot])
  } catch (e) { R('S34.post', 'script', String(e.stack || e).slice(0, 600), 'FAIL', [await pic(p, 's34-X2')]) }
  R('S34.err', 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
  await browser.close()
}

/* S35 — his own held seat and moves */
async function s35() {
  const { browser, p, errors } = await K.fresh()
  try {
    const mon = await X.mondayLate(p)
    const sc = await X.scTuesday(p, { to: '14:00', ld: '19:00', br: '13:00' })
    const k1 = X.key(TUE, sc.gi, 0, 1), k0w = X.key(TUE, sc.gi, 0, 0, 'w')
    const s = await K.seat(p, TUE, sc.gi, 0, 1, 'p', ID)
    const held = await X.restWarns(p, TUE)
    R('S35.0', `B 13:00 (after his 12:30 clearance), shift 14:00–19:00, Cobra in MAIN row 0; he is seated in the other MAIN seat (took ${s.took})`, `his crew-rest warnings: ${X.shortWarns(held)}`, held.length === 0 ? 'PASS' : 'FAIL', [await pic(p, 's35-seated')])
    /* (1) ask about his own held seat */
    const a = await X.readArmed(p, k1, 's35-1-own-seat-armed'); await X.disarm(p)
    R('S35.1', `his own held seat (${k1}) tapped (armed)`, `crew list: ${a.said} (his seat afterwards holds "${await X.holds(p, k1)}")`, !a.r.struck && !/crew rest|clash/.test(X.reasonOf(a)) ? 'PASS' : 'FAIL', [a.shot])
    /* (2) seat-to-seat drag within the same shift: his seat → the rear seat of MAIN row 0 (a WSO seat — may be refused) */
    const kSpare = X.key(TUE, sc.gi, 0, 3, 'p')
    const dr = await X.dragSeat(p, k1, kSpare, 's35-2-drag-to-spare', { drop: false })
    R('S35.2', `a seat-to-seat drag of his puck from MAIN (${k1}) towards a SPARE seat (${kSpare}) of the same shift, held over it, released without dropping`, `bubble: ${JSON.stringify(dr.bubble || dr.err)} (released back on his own seat: it holds "${await X.holds(p, k1)}")`, 'RECORDED', [dr.shot])
    const dr2 = await X.dragSeat(p, k1, kSpare, 's35-3-drop-on-spare', { drop: true })
    const wsAfter = await X.fullWarnsX(p, TUE)
    R('S35.2b', `…then really dropped on that SPARE seat`, `toast ${dr2.toast ? '"' + dr2.toast.slice(0, 200) + '"' : 'nothing'} · MAIN seat now "${await X.holds(p, k1)}", SPARE seat now "${await X.holds(p, kSpare)}" · his warnings: ${JSON.stringify(wsAfter.map(w => w.code + ': ' + w.msg.slice(0, 120)))}`, 'RECORDED', [await pic(p, 's35-3-after-drop')])
  } catch (e) { R('S35', 'script', String(e.stack || e).slice(0, 600), 'FAIL', [await pic(p, 's35-X')]) }
  R('S35.err', 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
  await browser.close()
}

/* S35b — he is the ONLY MAIN occupant: drag him to the other MAIN seat of the shift (the bubble must not count his old seat); and the cross-day drag of his sole late seat */
async function s35b() {
  const { browser, p, errors } = await K.fresh()
  try {
    const mon = await X.mondayLate(p)
    const sc = await X.scTuesday(p, { to: '14:00', ld: '19:00', br: '05:00', cobra: false })
    const k1 = X.key(TUE, sc.gi, 0, 1), k0 = X.key(TUE, sc.gi, 0, 0)
    const s = await K.seat(p, TUE, sc.gi, 0, 1, 'p', ID)
    const dr = await X.dragSeat(p, k1, k0, 's35b-1-drag-main-to-main', { drop: false })
    R('S35.3', `B 05:00, shift 14:00–19:00, he is the ONLY man in MAIN (took ${s.took}); his puck dragged from MAIN row 1 towards MAIN row 0's front seat, held over it`, `bubble: ${JSON.stringify(dr.bubble || dr.err)} (his seat still "${await X.holds(p, k1)}")`, 'RECORDED', [dr.shot])
    const dr2 = await X.dragSeat(p, k1, k0, 's35b-2-drop-main-to-main', { drop: true })
    const held = await X.restWarns(p, TUE)
    R('S35.3b', `…and dropped`, `toast ${dr2.toast ? '"' + dr2.toast.slice(0, 200) + '"' : 'nothing'} · now row 0 front "${await X.holds(p, k0)}", row 1 front "${await X.holds(p, k1)}" · crew-rest warnings: ${X.shortWarns(held)}`, 'RECORDED', [await pic(p, 's35b-3-dropped')])
  } catch (e) { R('S35.3', 'script', String(e.stack || e).slice(0, 600), 'FAIL', [await pic(p, 's35b-X')]) }
  R('S35b.err', 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
  await browser.close()
}

/* S35c — the week surface: his sole Monday late seat dragged into Tuesday SC MAIN (both days on the edit week) */
async function s35c(second) {
  const { browser, p, errors } = await K.fresh()
  try {
    const mon = await X.mondayLate(p)
    let extra = ''
    if (second) { const m2 = await K.addFlyWave(p, MON); await K.ff(p, MON, m2.gi, 0, 'cs', 'ZN'); await K.ff(p, MON, m2.gi, 0, 'msn', 'BFM'); await K.ff(p, MON, m2.gi, 0, 'to', '23:00'); await K.ff(p, MON, m2.gi, 0, 'ld', '23:45'); const s2 = await K.seat(p, MON, m2.gi, 0, 0, X.SEAT, ID); extra = ` and ANOTHER late seat on Monday (ZN 23:00–23:45, took ${s2.took})` }
    const sc = await X.scTuesday(p, { to: '14:00', ld: '19:00', br: '05:00' })
    await K.boardTo(p, TUE); await B.W.boardOff(p); await B.toEdit(p)
    await B.W.showDay(p, MON)
    const kSrc = X.key(MON, mon.gi, 0, 0), kDst = X.key(TUE, sc.gi, 0, 1)
    const hasDst = await p.locator(`#eWeek [data-slot="${kDst}"]:visible, #eWeek [data-fill="${kDst}"]:visible`).count()
    const hasSrc = await p.locator(`#eWeek [data-slot="${kSrc}"]:visible .puck[data-person="${ID}"]`).count()
    if (!hasDst || !hasSrc) { R(second ? 'S35.5' : 'S35.4', `week surface${extra}: source seat drawn ${hasSrc}, target seat drawn ${hasDst}`, 'a seat on the week was not found as a drag source/target', 'NOT WALKED', [await pic(p, `s35c${second ? '2' : '1'}-nofind`)]) }
    else {
      const dr = await X.dragSeat(p, kSrc, kDst, `s35c${second ? '2' : '1'}-drag`, { drop: false, root: '#eWeek' })
      R(second ? 'S35.5' : 'S35.4', `edit week: his Monday late flight seat dragged onto Tuesday's other MAIN seat (Cobra in MAIN row 0; B 05:00)${extra}; held over it, not dropped`, `bubble: ${JSON.stringify(dr.bubble || dr.err)}`, 'RECORDED', [dr.shot])
    }
  } catch (e) { R('S35.4', 'script', String(e.stack || e).slice(0, 600), 'FAIL', [await pic(p, 's35c-X')]) }
  R('S35c.err', 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
  await browser.close()
}

/* S20 — B typed in different forms */
async function s20() {
  const { browser, p, errors } = await K.fresh()
  try {
    await X.mondayLate(p)
    const sc = await X.scTuesday(p, { to: '14:00', ld: '19:00', br: '05:00' })
    const k = X.key(TUE, sc.gi, 0, 1)
    const out = {}
    for (const v of ['0500', '05:00', '0500H']) {
      await K.ff(p, TUE, sc.gi, 0, 'br', v)
      const stored = await X.formVal(p, TUE, sc.gi, 0, 'br')
      const shown = await boxVal(p, TUE, sc.gi, 'br')
      const a = await X.readArmed(p, k, `s20-form-${v.replace(/:/g, '_')}`)
      out[v] = { stored, shown, said: X.reasonOf(a), struck: a.r.struck }
      R(`S20.${v}`, `B typed "${v}" (shift 14:00–19:00; Cobra in MAIN; clearance 12:30); the other MAIN seat armed`, `box shows "${shown}", stored "${stored}"; crew list: ${a.said}`, 'RECORDED', [a.shot])
      await X.disarm(p)
    }
    const same = Object.values(out).every(o => o.struck === out['05:00'].struck && /not clear until 12:30/.test(o.said) === /not clear until 12:30/.test(out['05:00'].said))
    R('S20.same', 'the three accepted forms compared', JSON.stringify(Object.fromEntries(Object.entries(out).map(([k, o]) => [k, `${o.stored}/${o.struck}`]))), same ? 'PASS' : 'FAIL')
    for (const v of ['12:90', '25:00']) {
      await K.ff(p, TUE, sc.gi, 0, 'br', v)
      const stored = await X.formVal(p, TUE, sc.gi, 0, 'br')
      const shown = await boxVal(p, TUE, sc.gi, 'br')
      const a = await X.readArmed(p, k, `s20-bad-${v.replace(':', '')}`)
      const toast = await X.toastNow(p)
      const ws = await X.fullWarnsX(p, TUE)
      R(`S20.${v}`, `B typed "${v}"`, `box shows "${shown}", stored "${stored}", toast ${toast ? '"' + toast.slice(0, 120) + '"' : 'none'}; crew list: ${a.said}`, (stored === shown || shown === '' ) ? 'RECORDED' : 'RECORDED', [a.shot])
      await X.disarm(p)
    }
    /* equal in-time and shift start */
    await K.ff(p, TUE, sc.gi, 0, 'br', '14:00'); await K.ff(p, TUE, sc.gi, 0, 'to', '14:00')
    const a = await X.readArmed(p, k, 's20-equal-b-start')
    R('S20.eq1', `B 14:00 equal to the shift start 14:00`, `box B "${await boxVal(p, TUE, sc.gi, 'br')}"; crew list: ${a.said}`, 'RECORDED', [a.shot]); await X.disarm(p)
    await K.ff(p, TUE, sc.gi, 0, 'br', '05:00'); await K.ff(p, TUE, sc.gi, 0, 'to', '19:00'); await K.ff(p, TUE, sc.gi, 0, 'ld', '19:00')
    const a2 = await X.readArmed(p, k, 's20-equal-start-end')
    R('S20.eq2', `shift start 19:00 equal to its end 19:00, B 05:00`, `start "${await boxVal(p, TUE, sc.gi, 'to')}" end "${await boxVal(p, TUE, sc.gi, 'ld')}"; crew list: ${a2.said}`, 'RECORDED', [a2.shot]); await X.disarm(p)
  } catch (e) { R('S20', 'script', String(e.stack || e).slice(0, 600), 'FAIL', [await pic(p, 's20-X')]) }
  R('S20.err', 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
  await browser.close()
}

if (which === 's32' || which === 'all') await s32()
if (which === 's33' || which === 'all') await s33()
if (which === 's34' || which === 'all') await s34()
if (which === 's35' || which === 'all') await s35()
if (which === 's35b' || which === 'all') await s35b()
if (which === 's35c' || which === 'all') { await s35c(false); await s35c(true) }
if (which === 's20' || which === 'all') await s20()
B.savePart('bta-C-2-' + which)
for (const r of B.TABLE) console.log(`${r.verdict}  ${r.id}  ${r.did}\n      → ${r.saw}`)
