// bell190 walker A — group 1: a drop on an input's Ground Programme row (empty place / a shared input's puck / the only
// man's puck), Edit Schedule desktop, the Scheduler Board desktop, the Board on the phone by tap-to-arm [F1-F3, F7, A1-A4].
// Usage: node bell190-a-g1.mjs [filter]
import * as L from './bell190-a-lib.mjs'
console.log('bell190-a-g1 v5', L.LIBV)
const R = L.recorder('bell190-a-g1')
const only = process.argv[2] || ''
const { ID, J } = L
const SHAPES = {
  empty: { people: [ID.Tally], target: null, expect: { bane: 'in', nick: 'add:bane' } },
  shared: { people: [ID.Tally, ID.Hex], target: ID.Tally, expect: { bane: 'in', nick: 'add:bane', rocky: 'add:bane' } },
  only: { people: [ID.Tally], target: ID.Tally, expect: { bane: 'in', nick: 'out' } },
}
for (const door of ['week-desk', 'board-desk', 'board-phone']) for (const [shape, S] of Object.entries(SHAPES)) {
  const c = `A1-${shape}-${door}`
  if (only && !c.includes(only)) continue
  console.log('\n=====', c)
  let w = await L.newWorld('desk')
  try {
    await L.signIn(w, 'ad')
    const tallySignIn = shape === 'only' && door === 'week-desk'
    if (tallySignIn) await L.giveSignIn(w, ID.Tally, 'tally')
    const iid = await L.fileInput(w, L.WED, { type: 'Training', people: S.people, from: '09:00', to: '11:00' })
    if (!iid) { R(c, 'fixture', 'NOT WALKED', 'the Training was not filed'); continue }
    if (door === 'board-phone') { w = await L.handOver(w, 'phone'); await L.signIn(w, 'ad') }
    const p = w.page
    let root, src
    if (door === 'week-desk') { await L.go(p, 'editsched'); root = '#eWeek'; src = '#eRoster .rpuck[data-person="bane"]' }
    else { await L.openBoard(w, 2); root = '#schedBoard'; src = '#sbRoster .rpuck[data-person="bane"]' }
    const place = await L.rowPlace(p, 2, iid, S.target)
    if (!place) { R(c, 'fixture', 'NOT WALKED', 'no ground row of the input on Wed: ' + J(await L.groundDump(p, 2))); continue }
    const before = await L.rowsOf(p, 2, iid)
    const n0 = await L.allNotices(p)
    const pb = `a-${c}`
    let d
    if (door === 'board-phone') d = await L.phoneArmPlace(w, place.sel, 'bane', pb + '-2')
    else { await L.shot(w, pb + '-1-before'); d = await L.drag(w, src, `${root} ${place.sel}`, pb + '-2') }
    const note = await L.toast(p)
    await L.sleep(500)
    const after = await L.rowsOf(p, 2, iid)
    const recNow = await L.rec(p, iid)
    await p.evaluate(s => document.querySelector(s)?.scrollIntoView({ block: 'center' }), `${root} [data-fill="g:2.${place.ri}.+"]`)
    await L.shot(w, pb + '-3-after')
    const n1 = await L.allNotices(p)
    const fresh = L.newSince(n0, n1)
    /* on the phone a man's puck cannot be armed by a tap (a tap selects him — the Board's own rule, "only a real person's
       puck falls through to selection"), so the tap route has no "replace" or "join on his puck": nothing may change */
    const noRoute = door === 'board-phone' && S.target
    const expectNow = noRoute ? { bane: null, nick: null, rocky: null } : S.expect
    const j = L.judgeLines(fresh, { ...expectNow, stiff: null }, iid)
    if (noRoute) R(c, 'the tap route to a man\'s puck', 'RECORD', { armed: d.armed, rowBefore: before.map(r => [r.who, r.more]), rowAfter: after.map(r => [r.who, r.more]), note }, 'a tap on Tally\'s puck selects him (blue) and rings where he may go; it arms nothing, so Ranger\'s tap places nothing', [pb + '-2-armtap-lift.png', pb + '-2-pick-lift.png'])
    R(c, 'the act', d.ok ? 'DONE' : 'BLOCKED', { how: door === 'board-phone' ? 'tap the place, then Ranger in the crew drawer' : 'mouse drag from the crew list', act: d.ok ? (d.armed !== undefined ? { armed: d.armed, drawer: d.drawer } : 'ok') : d.why, note, rowBefore: before.map(r => [r.who, r.more]), rowAfter: after.map(r => [r.who, r.more]), inputNow: recNow && recNow.people }, '', door === 'board-phone' ? [pb + '-2-armtap-lift.png', pb + '-2-pick-lift.png', pb + '-3-after.png'] : [pb + '-2-carried.png', pb + '-3-after.png'])
    R(c, 'lines written (the store; one per man; Saber none)', j.ok ? 'PASS' : 'FAIL', j.out, J(expectNow))
    if (door !== 'week-desk') await L.closeBoard(w)
    if (noRoute) { const rr = await L.readAs(w, 'us', pb + '-4-ranger', /Training/); R(c, 'Ranger\'s bell on screen (nothing changed)', !(rr.bell.lines || []).length ? 'PASS' : 'FAIL', { lit: rr.bell.lit, lines: rr.bell.lines, toast: rr.bell.toast }, 'no line', [rr.bell.lift, rr.bell.pic].filter(Boolean)); await w.ctx.close(); continue }
    /* Ranger's own bell, on screen */
    const rr = await L.readAs(w, 'us', pb + '-4-ranger', /Training/)
    const rl = (rr.bell.lines || []).filter(l => /Training/.test(l.name))
    const okR = rl.length === 1 && /^You were added · Saber$/.test(rl[0].what) && /Wed 15 Jul/.test(rl[0].day)
    R(c, 'Ranger\'s bell on screen', okR ? 'PASS' : 'FAIL', { lit: rr.bell.lit, lines: (rr.bell.lines || []).map(l => `${l.name} | ${l.day} | ${l.what} | ${l.ago} | ${l.cls}`) }, 'one line: Training · Wed 15 Jul · You were added · Saber', [rr.bell.lift, rr.bell.pic].filter(Boolean))
    const okT = rr.tap && rr.tap.editor && rr.tap.type === 'Training' && ((rr.tap.people || []).includes('bane') || ['bane', 'Ranger'].includes(rr.tap.person))
    R(c, 'a tap on Ranger\'s line', okT ? 'PASS' : 'FAIL', rr.tap, 'opens the input (its window, Ranger in it)', rr.tap ? [rr.tap.pic] : [])
    if (tallySignIn) {
      await L.closeBell(w)
      const tr = await L.readAs(w, 'tally', pb + '-5-tally', /Training/, { pass: 'x' })
      const tl = (tr.bell.lines || []).filter(l => /Training/.test(l.name))
      R(c, 'Tally\'s bell on screen (his own sign-in, given on Admin → Users)', tl.some(l => /^You were taken off · Saber$/.test(l.what)) && !tl.some(l => /Ranger added/.test(l.what)) ? 'PASS' : 'FAIL', { lines: (tr.bell.lines || []).map(l => `${l.name} | ${l.day} | ${l.what} | ${l.ago}`) }, 'Training · You were taken off · Saber (beside the filing\'s own You were added from before); no "Ranger added"', [tr.bell.pic])
    }
    if (w.errs.length) R(c, 'page errors', 'NOTE', w.errs)
  } catch (e) { R(c, 'script', 'BLOCKED', String(e.stack || e).slice(0, 400)) }
  await w.ctx.close().catch(() => {})
}
await L.closeAll()
