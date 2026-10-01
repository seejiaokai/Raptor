/* walker C — scenario 32, the two records beside it (RECORDED, not judged):
   (a) is the overwrite special to Undo? The same two tabs, but A's stale tab makes a PLAIN edit on Tuesday (a day note).
   (b) the one-tab road: A hides, signs out; B signs in, hides on the same day, signs out; A signs in — what Undo offers. */
import * as C from './wh-c-lib.mjs'
const { H } = C, { L, W } = H
const TUE = 1, RE = /Long work day/i, RE2 = /No time for the flight brief/i
const strike = s => s.lines.map(l => `${l.ix}:${l.struck ? 'struck' : 'plain'}`).join(' ')
{
  const { browser, ctx, p, errors } = await H.world({ who: 'a' })
  try {
    await C.makeHexAdmin(p); await L.go(p, 'editsched')
    const q = await C.secondPage(ctx, errors, C.HEX); await L.go(q, 'editsched')
    const a0 = await C.see(p, '#eWeek', TUE, RE), IX = a0.line.ix, IX2 = a0.lines.find(l => RE2.test(l.text)).ix
    await H.tapLine(p, '#eWeek', TUE, IX); await L.settle(p)
    await H.reloadAs(q, C.HEX); await L.go(q, 'editsched'); await C.see(q, '#eWeek', TUE, RE2)
    await H.tapLine(q, '#eWeek', TUE, IX2); await L.settle(q)
    await W.showDay(p, TUE); await W.weekText(p, 'dn:1.0', 'ORDERS: STALE TAB EDIT'); await L.settle(p)
    await H.reloadAs(q, C.HEX); await L.go(q, 'editsched')
    const b = await C.see(q, '#eWeek', TUE, RE2)
    const pic = await C.picLine(q, '#eWeek', TUE, IX2, '32b-a-B-after-A-plain-edit')
    H.row('32.a', 'two tabs again: A hid "Long work day"; B reloaded and hid "No time for the flight brief"; A (tab not reloaded) typed a Tuesday day note; B reloaded', `B now sees: ${b.bar} · ${strike(b)} — B's own hide is ${b.line && b.line.struck ? 'STILL there' : 'GONE (the stale tab\'s plain edit overwrote Tuesday too)'}; A's hide is ${b.lines.find(l => RE.test(l.text)).struck ? 'there' : 'gone'}`, 'RECORDED', [pic])
  } catch (e) { H.row('32.aX', 'the script', String(e && e.stack || e).slice(0, 500), 'FAIL', []) }
  H.savePart('32b-a', { errors }); console.log('ERRORS', JSON.stringify(errors))
  await browser.close()
}
{
  const { browser, p, errors } = await H.world({ who: 'a' })
  try {
    await C.makeHexAdmin(p); await L.go(p, 'editsched')
    const a0 = await C.see(p, '#eWeek', TUE, RE), IX = a0.line.ix, IX2 = a0.lines.find(l => RE2.test(l.text)).ix
    await H.tapLine(p, '#eWeek', TUE, IX); await L.settle(p)
    await C.reSign(p, C.HEX); await L.go(p, 'editsched'); await C.see(p, '#eWeek', TUE, RE2)
    const uB = await p.evaluate(() => { const b = document.querySelector('#undoBtn'); return b ? { title: b.title, disabled: b.disabled } : null })
    await H.tapLine(p, '#eWeek', TUE, IX2); await L.settle(p)
    await C.reSign(p, 'a'); await L.go(p, 'editsched'); await W.toastSpy(p)
    const uA = await p.evaluate(() => { const b = document.querySelector('#undoBtn'); return b ? { title: b.title, disabled: b.disabled } : null })
    const d = await W.door(p, 'top', 'undo')
    const a = await C.see(p, '#eWeek', TUE, RE)
    const pic = await C.picLine(p, '#eWeek', TUE, IX, '32b-b-A-signed-in-again')
    H.row('32.b', 'one tab: A hid "Long work day", Logout; Hex signed in (his Undo: ' + JSON.stringify(uB) + '), hid "No time for the flight brief", Logout; Saber signed in again', `Saber's Undo: ${JSON.stringify(uA)}; a press: ${JSON.stringify(d)}; Tuesday: ${a.bar} · ${strike(a)} — both hides kept, and neither man can undo the other's (the list empties at every sign-in, D148)`, 'RECORDED', [pic])
  } catch (e) { H.row('32.bX', 'the script', String(e && e.stack || e).slice(0, 500), 'FAIL', []) }
  H.savePart('32b-b', { errors }); console.log('ERRORS', JSON.stringify(errors))
  await browser.close()
}
