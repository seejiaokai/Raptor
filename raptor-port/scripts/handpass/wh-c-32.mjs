/* walker C — scenario 32: Undo after ANOTHER person has changed that day's hides must refuse and name him; his change on
   another day must not block. Two schedulers in two tabs of one browser (Saber in tab A; Hex, made an admin on Admin →
   Users, in tab B). Tab A is never reloaded between its hide and its Undo — a reload or a sign-out empties the Undo list. */
import * as C from './wh-c-lib.mjs'
const { H } = C, { L, W } = H
const TUE = 1, WED = 2, RE = /Long work day/i, RE2 = /No time for the flight brief/i
const strike = s => s.lines.map(l => `${l.ix}:${l.struck ? 'struck' : 'plain'}`).join(' ')

/* ---------- part 1: the same day ---------- */
{
  const { browser, ctx, p, errors } = await H.world({ who: 'a' })
  try {
    await C.makeHexAdmin(p); await L.go(p, 'editsched'); await W.toastSpy(p)
    const q = await C.secondPage(ctx, errors, C.HEX); await L.go(q, 'editsched')
    const a0 = await C.see(p, '#eWeek', TUE, RE), IX = a0.line.ix, IX2 = a0.lines.find(l => RE2.test(l.text)).ix
    await H.tapLine(p, '#eWeek', TUE, IX); await L.settle(p)                       // A hides Static's long day
    await H.reloadAs(q, C.HEX); await L.go(q, 'editsched')
    const b1 = await C.see(q, '#eWeek', TUE, RE2)
    await H.tapLine(q, '#eWeek', TUE, IX2); await L.settle(q)                      // B hides Saint's "no time for the brief"
    const b2 = await C.see(q, '#eWeek', TUE, RE2)
    const picB = await C.picLine(q, '#eWeek', TUE, IX2, '32-1-B-hides-on-same-day')
    H.judge('32.1', 'A (Saber) hid Static\'s "Long work day" on Tuesday; B (Hex) reloaded, saw it, and hid Saint\'s "No time for the flight brief" on the same Tuesday', [['B saw A\'s hide after his reload', b1.lines.find(l => RE.test(l.text)).struck, strike(b1)], ['B\'s Tuesday now has both struck, 2 issues', b2.n === 2 && b2.lines.filter(l => l.struck).length === 2, b2.bar + ' · ' + strike(b2)]], [picB])
    /* A presses Undo — his tab has not been reloaded */
    const tA = await p.evaluate(() => { const b = document.querySelector('#undoBtn'); return { title: b.title, disabled: b.disabled } })
    const u = await W.door(p, 'top', 'undo'); await L.settle(p)
    const said = (u.toasts || []).join(' | ')
    const a3 = await C.see(p, '#eWeek', TUE, RE)
    const picA = await C.picLine(p, '#eWeek', TUE, IX, '32-2-A-undo-pressed')
    const rowsNow = await p.evaluate(() => { try { return (JSON.parse(localStorage.getItem('raptor:weeks/13-07-2026#1')) || {}).wo || null } catch (e) { return 'unreadable' } })
    console.log('UNDO', JSON.stringify(u), 'A screen', C.say(a3), strike(a3), 'stored wo', JSON.stringify(rowsNow))
    await H.reloadAs(p, 'a'); await L.go(p, 'editsched')
    const a4 = await C.see(p, '#eWeek', TUE, RE)
    const picA4 = await C.picLine(p, '#eWeek', TUE, IX, '32-3-A-after-reload')
    await H.reloadAs(q, C.HEX); await L.go(q, 'editsched')
    const b4 = await C.see(q, '#eWeek', TUE, RE2)
    H.judge('32.2', 'A (his tab not reloaded; Undo titled "' + tA.title + '") pressed Undo in the top bar', [
      ['Undo refused (it did not take the hide back)', /can.t|cannot|refus|changed|since|first|later/i.test(said) && !/^Undid:/i.test(said), said || '(no message)'],
      ['the refusal names Hex', /Hex/.test(said), said || '(no message)'],
      ['B\'s hide survived in the store (Saint\'s line still hidden for B after a reload)', !!b4.line && b4.line.struck, strike(b4)],
      ['A\'s own hide was not taken back either (after A\'s reload both are struck, 2 issues)', a4.n === 2 && a4.lines.filter(l => l.struck).length === 2, a4.bar + ' · ' + strike(a4)],
    ], [picA, picA4])
    H.savePart('32-sameday', { errors })
    console.log('ERRORS part 1', JSON.stringify(errors))
  } catch (e) { H.row('32.X1', 'the script (part 1)', String(e && e.stack || e).slice(0, 700), 'FAIL', [await H.pic(p, '32-X1-error')]) }
  await browser.close()
}

/* ---------- part 2: another day must not block ---------- */
{
  const { browser, ctx, p, errors } = await H.world({ who: 'a' })
  try {
    await C.makeHexAdmin(p); await L.go(p, 'editsched'); await W.toastSpy(p)
    const q = await C.secondPage(ctx, errors, C.HEX); await L.go(q, 'editsched')
    const a0 = await C.see(p, '#eWeek', TUE, RE), IX = a0.line.ix
    await H.tapLine(p, '#eWeek', TUE, IX); await L.settle(p)                       // A hides on Tuesday
    await H.reloadAs(q, C.HEX); await L.go(q, 'editsched')
    const w0 = await C.see(q, '#eWeek', WED, /./)
    await H.tapLine(q, '#eWeek', WED, 0); await L.settle(q)                        // B hides Wednesday's first line
    const w1 = await C.see(q, '#eWeek', WED, /./)
    const picB = await C.picLine(q, '#eWeek', WED, 0, '32-4-B-hides-on-wednesday')
    const u = await W.door(p, 'top', 'undo'); await L.settle(p)
    const said = (u.toasts || []).join(' | ')
    const a2 = await C.see(p, '#eWeek', TUE, RE)
    const picA = await C.picLine(p, '#eWeek', TUE, IX, '32-5-A-undo-other-day')
    await H.reloadAs(p, 'a'); await L.go(p, 'editsched')
    const a3 = await C.see(p, '#eWeek', TUE, RE), a3w = await C.see(p, '#eWeek', WED, /./)
    const picA3 = await C.picLine(p, '#eWeek', WED, 0, '32-6-A-after-reload-wednesday')
    console.log('UNDO other day', JSON.stringify(u), C.say(a2))
    H.judge('32.3', 'fresh world: A hid Tuesday\'s "Long work day"; B reloaded and hid the first line of WEDNESDAY; A (tab not reloaded) pressed Undo', [
      ['B\'s Wednesday hide took (one fewer issue, first line struck)', w1.n === w0.n - 1 && w1.lines[0].struck, w0.bar + ' → ' + w1.bar],
      ['A\'s Undo was not blocked: it took his Tuesday hide back', /^Undid: hiding a warning/i.test(said) && a2.n === 4 && !!a2.line && !a2.line.struck, said + ' · ' + a2.bar],
      ['after A\'s reload Tuesday is flagged again (4 issues)', a3.n === 4 && !a3.line.struck, a3.bar],
      ['and B\'s Wednesday hide is still there', a3w.lines[0].struck && a3w.n === w1.n, a3w.bar + ' · ' + strike(a3w)],
    ], [picB, picA, picA3])
  } catch (e) { H.row('32.X2', 'the script (part 2)', String(e && e.stack || e).slice(0, 700), 'FAIL', [await H.pic(p, '32-X2-error')]) }
  H.savePart('32', { errors })
  console.log('ERRORS part 2', JSON.stringify(errors))
  await browser.close()
}
