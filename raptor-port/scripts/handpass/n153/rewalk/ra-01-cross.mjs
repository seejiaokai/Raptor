// ra-01 - item 1: a real drag on 142's chart held across a pick of 149. KINDS: bend, ball, endhandle (a link's end), lend and
// lvert (a drawn line's end and corner). MODE: clean (no draft), discard, save (a draft, the question answered with the press held).
// SZ=d|pc  KINDS=bend,ball  MODE=clean  TAG=<run name>
import { signIn, closeAll, finish, picsFor, pic, step, mk, go, T, log, pickSq, shut, check, ask, addEvent, hasEv, arrange, tool, undoBtn } from './rlib.mjs'
import { chartPrint, samePrint, viewSig, inEditor, shot, ready, hold, pickHeld, answerHeld, edgePoint, ballPoint, trackerSaved, layoutDiff } from './ra-lib.mjs'
const SZS = (process.env.SZ || 'd,pc').split(','), MODE = process.env.MODE || 'clean'
const KINDS = (process.env.KINDS || (MODE === 'clean' ? 'bend,ball,endhandle,lend,lvert' : 'bend,ball')).split(',')
const TAG = process.env.TAG || `ra-01-${MODE}`
console.log('ra-01-cross v1', process.env.MQ_PORT, SZS, MODE, KINDS)
const wait = (s, ms) => s.page.waitForTimeout(ms)
const to = async (s, u) => { await pickSq(s, u); await shut(s); await wait(s, 1300) }
const ANS = { discard: 'Discard them', save: 'Save them' }

for (const sz of SZS) for (const kind of KINDS) {
  const run = `${TAG}-${sz}-${kind}`, dir = picsFor(run)
  await step(run, async () => {
    const s = await mk(sz); const { page } = s
    await signIn(s, 'ad', 'a'); await go(s, 'tracker'); await wait(s, 1800)
    await to(s, '149'); await to(s, '142')   /* 149's first visit seeds it: the baseline comes after */
    await arrange(s, true); await wait(s, 300)
    const clean = await chartPrint(s)
    let name = null
    if (MODE !== 'clean') {
      name = 'RA' + MODE[0].toUpperCase() + sz + kind.slice(0, 2)
      await arrange(s, false); await wait(s, 300)   /* addEvent opens the editor itself */
      if (!(await addEvent(s, name))) { check(`${run} NOT WALKED: the unsaved event`, false, name); await s.ctx.close(); return }
    }
    const g = await ready(s, kind)
    if (!g) { check(`${run} NOT WALKED: the grip`, false, kind); await pic(s, '00-no-grip'); await s.ctx.close(); return }
    const base = await chartPrint(s), a0 = await trackerSaved(s, '142'), b0 = await trackerSaved(s, '149'), tb = await T(s), u0 = await undoBtn(s)
    log(run, 'before', { sq: tb.sq, dirty: tb.dirty, base, undo: u0.undo?.on, grip: [Math.round(g.x), Math.round(g.y), g.w] })
    await shot(s, dir, '01-before-press')

    const h = await hold(s, g.x, g.y)
    const mx = g.x + (s.desk ? 46 : 26), my = g.y + (s.desk ? 34 : 22)
    await h.move(mx, my); await wait(s, 200)
    const held = await page.evaluate(sel => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); return [Math.round(r.left + r.width / 2), Math.round(r.top + r.height / 2)] }, g.sel)
    const heldPrint = await chartPrint(s)
    const moved = (held && (Math.abs(held[0] - g.x) > 4 || Math.abs(held[1] - g.y) > 4)) || !samePrint(heldPrint, base)
    check(`${run}: the drag really moved under the held press`, !!moved, { grip: held, printChanged: !samePrint(heldPrint, base) })
    await shot(s, dir, '02-held-moved')

    const how = await pickHeld(s, '149')
    log(run, 'pick by', how)
    if (!how) { check(`${run} NOT WALKED: the pick`, false, 'not reached'); await h.up(); await s.ctx.close(); return }
    if (MODE !== 'clean') {
      const q = await ask(s)
      check(`${run}: the question opened during the held drag`, /Save them before switching to 149\?/.test(q.msg || ''), q)
      await shot(s, dir, '03-question-held')
      const by = await answerHeld(s, ANS[MODE]); log(run, 'answered by', by)
      if (!by) { check(`${run} NOT WALKED: the answer`, false, 'not reached'); await h.up(); await s.ctx.close(); return }
      await wait(s, 600)
    }
    await wait(s, 500)
    const t1 = await T(s); await shot(s, dir, '04-after-pick-still-held')
    check(`${run}: on 149 with the press still held`, /^149/.test(t1.sq || ''), t1.sq)

    /* further, to the board's edge where a live edge pan would run, and a rest there */
    const v0 = await viewSig(s), e = await edgePoint(s, mx)
    await h.move(e.x, e.y); await wait(s, 700)
    const v1 = await viewSig(s)
    check(`${run}: no edge pan on 149 from the old press`, v0 === v1, { v0, v1 })
    await h.move(mx + 8, my + 6); await wait(s, 120)
    await h.up(); await wait(s, 900)
    await shot(s, dir, '05-after-release')
    if (!s.desk) { await shut(s); await wait(s, 300) }
    const t2 = await T(s), a2 = await trackerSaved(s, '142'), b2 = await trackerSaved(s, '149')
    check(`${run}: ends on 149`, /^149/.test(t2.sq || ''), t2.sq)
    check(`${run}: 149 has no unsaved mark`, !t2.dirty, { dirty: t2.dirty, stat: t2.saveStat })
    check(`${run}: 149's saved records unchanged`, layoutDiff(b0, b2).length === 0, layoutDiff(b0, b2))
    const d142 = layoutDiff(a0, a2)
    if (MODE === 'save') check(`${run}: Save wrote on 142`, d142.length > 0, d142)
    else check(`${run}: 142's saved records unchanged`, d142.length === 0, d142)
    await pic(s, '06-149-settled')

    await to(s, '142'); await arrange(s, true); await wait(s, 400)
    const t3 = await T(s), back = await chartPrint(s), a3 = await trackerSaved(s, '142'), b3 = await trackerSaved(s, '149')
    check(`${run}: back on 142, no unsaved mark`, /^142/.test(t3.sq || '') && !t3.dirty, { sq: t3.sq, dirty: t3.dirty, stat: t3.saveStat })
    if (MODE === 'clean') check(`${run}: 142's chart as it was`, samePrint(back, base), { base, back })
    if (MODE === 'discard') {
      check(`${run}: Discard: 142's chart is the saved one, the edit gone`, samePrint(back, clean) && !(await hasEv(s, name)), { clean, back, name })
    }
    if (MODE === 'save') {
      check(`${run}: Save: the edit kept, the half-done drag in no record`, samePrint(back, base) && await hasEv(s, name), { base, back, name })
    }
    check(`${run}: the round trip wrote nothing more`, layoutDiff(a2, a3).length === 0 && layoutDiff(b2, b3).length === 0, { on142: layoutDiff(a2, a3), on149: layoutDiff(b2, b3) })
    await pic(s, '07-142-back')

    /* a later ordinary drag */
    await tool(s, 'Move'); await wait(s, 150)
    const b = await ballPoint(s)
    if (!b) { check(`${run} NOT WALKED: later drag`, false, 'no ball'); await s.ctx.close(); return }
    const before = await chartPrint(s), a4 = await trackerSaved(s, '142'), b4 = await trackerSaved(s, '149')
    const h2 = await hold(s, b.x, b.y); await h2.move(b.x + (s.desk ? 40 : 24), b.y + (s.desk ? 30 : 18)); await wait(s, 120)
    /* the edge-pan read calibrated: the same read, the same rest at the foot, on a drag that is alive */
    const c0 = await viewSig(s), ce = await edgePoint(s, b.x); await h2.move(ce.x, ce.y); await wait(s, 700); const c1 = await viewSig(s)
    check(`${run}: (calibration) a live drag at the board's foot does pan, so the read can see one`, c0 !== c1, { c0, c1 })
    await h2.move(b.x + (s.desk ? 40 : 24), b.y + (s.desk ? 30 : 18)); await wait(s, 120); await h2.up(); await wait(s, 800)
    const after = await chartPrint(s), t5 = await T(s), a5 = await trackerSaved(s, '142'), b5 = await trackerSaved(s, '149')
    check(`${run}: a later drag moves the ball`, after.b !== before.b, { before: before.b, after: after.b })
    check(`${run}: the later drag saved on 142`, layoutDiff(a4, a5).length > 0, layoutDiff(a4, a5))
    check(`${run}: the later drag wrote nothing on 149`, layoutDiff(b4, b5).length === 0, layoutDiff(b4, b5))
    log(run, 'after later drag', { dirty: t5.dirty, stat: t5.saveStat })
    await pic(s, '08-later-drag')
    await s.ctx.close()
  })
}
finish(TAG); await closeAll()
