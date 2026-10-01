/* walker C — scenario 31: Undo and Redo replay the hide — the list, the puck, the count and what a reload gives back.
   From the top bar, then from the Scheduler Board's own bar; then again for a flag-again. */
import * as C from './wh-c-lib.mjs'
const { H } = C, { L, W } = H
const TUE = 1, RE = /Long work day/i, WHO = 'wolf'
const { browser, p, errors } = await H.world({ who: 'a' })
const title = async sel => p.evaluate(s => { const b = [...document.querySelectorAll(s)].find(e => e.offsetParent !== null); return b ? { title: b.title || b.getAttribute('aria-label') || '', disabled: b.disabled } : null }, sel)
try {
  await L.go(p, 'editsched'); await W.toastSpy(p)
  const s0 = await C.see(p, '#eWeek', TUE, RE, WHO), IX = s0.line.ix
  await H.tapLine(p, '#eWeek', TUE, IX); await L.settle(p)
  const t1 = await title('#undoBtn')
  const s1 = await C.see(p, '#eWeek', TUE, RE, WHO)
  const pic1 = await C.picLine(p, '#eWeek', TUE, IX, '31-1-hidden')
  H.judge('31.1', 'Edit Schedule: ✕ on Static\'s "Long work day"; read the top bar\'s Undo', [...C.hiddenChecks(s1, 3), ['Undo is offered and names "hiding a warning"', !!t1 && !t1.disabled && /hiding a warning/i.test(t1.title), t1 && t1.title]], [pic1])

  const u1 = await W.door(p, 'top', 'undo'); await L.settle(p)
  const s2 = await C.see(p, '#eWeek', TUE, RE, WHO), r2 = await title('#redoBtn')
  const pic2 = await C.picLine(p, '#eWeek', TUE, IX, '31-2-undone-top')
  H.judge('31.2', 'pressed Undo in the top bar', [['it was pressed', u1.pressed, JSON.stringify(u1)], ...C.shownChecks(s2, 4), ['the app said what it undid', (u1.toasts || []).some(t => /hiding a warning/i.test(t)), (u1.toasts || []).join(' | ')], ['Redo now names "hiding a warning"', !!r2 && /hiding a warning/i.test(r2.title), r2 && r2.title]], [pic2])

  const d1 = await W.door(p, 'top', 'redo'); await L.settle(p)
  const s3 = await C.see(p, '#eWeek', TUE, RE, WHO)
  const pic3 = await C.picLine(p, '#eWeek', TUE, IX, '31-3-redone-top')
  H.judge('31.3', 'pressed Redo in the top bar', [['it was pressed', d1.pressed, JSON.stringify(d1)], ...C.hiddenChecks(s3, 3), ['the app said what it redid', (d1.toasts || []).some(t => /hiding a warning/i.test(t)), (d1.toasts || []).join(' | ')]], [pic3])

  await H.reloadAs(p, 'a'); await L.go(p, 'editsched'); await W.toastSpy(p)
  const s4 = await C.see(p, '#eWeek', TUE, RE, WHO)
  const pic4 = await C.picLine(p, '#eWeek', TUE, IX, '31-4-redone-reload')
  H.judge('31.4', 'reloaded after the Redo', C.hiddenChecks(s4, 3), [pic4])

  /* an Undo, then a reload: the undone state is what is kept */
  await H.tapLine(p, '#eWeek', TUE, IX); await L.settle(p)          // ↺ flag again
  const t5 = await title('#undoBtn')
  const s5 = await C.see(p, '#eWeek', TUE, RE, WHO)
  const pic5 = await C.picLine(p, '#eWeek', TUE, IX, '31-5-flagged-again')
  H.judge('31.5', 'pressed ↺ on the struck line (flag again); read the top bar\'s Undo', [...C.shownChecks(s5, 4), ['Undo names "flagging a warning again"', !!t5 && /flagging a warning again/i.test(t5.title), t5 && t5.title]], [pic5])
  const u2 = await W.door(p, 'top', 'undo'); await L.settle(p)
  const s6 = await C.see(p, '#eWeek', TUE, RE, WHO)
  const pic6 = await C.picLine(p, '#eWeek', TUE, IX, '31-6-flag-again-undone')
  H.judge('31.6', 'pressed Undo (takes the flag-again back)', [['pressed', u2.pressed, JSON.stringify(u2)], ...C.hiddenChecks(s6, 3), ['the app said so', (u2.toasts || []).some(t => /flagging a warning again/i.test(t)), (u2.toasts || []).join(' | ')]], [pic6])
  await H.reloadAs(p, 'a'); await L.go(p, 'editsched'); await W.toastSpy(p)
  const s7 = await C.see(p, '#eWeek', TUE, RE, WHO)
  const pic7 = await C.picLine(p, '#eWeek', TUE, IX, '31-7-undone-reload')
  H.judge('31.7', 'reloaded after that Undo', C.hiddenChecks(s7, 3), [pic7])
  await H.tapLine(p, '#eWeek', TUE, IX); await L.settle(p)          // ↺: flagged again, kept
  const d2u = await W.door(p, 'top', 'undo'); await L.settle(p)     // hidden
  const d2 = await W.door(p, 'top', 'redo'); await L.settle(p)      // flagged again
  const s8 = await C.see(p, '#eWeek', TUE, RE, WHO)
  await H.reloadAs(p, 'a'); await L.go(p, 'editsched'); await W.toastSpy(p)
  const s9 = await C.see(p, '#eWeek', TUE, RE, WHO)
  const pic9 = await C.picLine(p, '#eWeek', TUE, IX, '31-9-flag-again-redone-reload')
  H.judge('31.8', '↺ again, Undo, Redo (the flag-again redone), then a reload', [['Redo named "flagging a warning again"', /flagging a warning again/i.test(d2.title || ''), d2.title], ...C.shownChecks(s8, 4, { label: 'before the reload: ' }), ...C.shownChecks(s9, 4, { label: 'after the reload: ' })], [pic9])

  /* the board's own Undo / Redo */
  await W.boardOn(p, TUE); await H.boardOpenFold(p); await W.toastSpy(p)
  const b0 = await H.readBoard(p), bix = (b0.lines || []).find(l => RE.test(l.text)).ix
  await H.tapBoardLine(p, TUE, bix); await L.settle(p)
  const tb = await title('#sbUndo')
  const b1 = await H.readBoard(p), bl1 = b1.lines.find(l => RE.test(l.text)), bp1 = H.flagged(await H.pucks(p, '#schedBoard', WHO))
  const pic10 = await H.pic(p, '31-10-board-hidden')
  H.judge('31.9', 'the Scheduler Board on Tuesday: ✕ on the same line in its panel', [['heading counts 3', /\b3 issues/.test(b1.head), b1.head], ['struck, ↺', bl1.struck && bl1.btn === '↺'], ['Static\'s pucks on the board plain', bp1.length === 0, bp1.map(x => x.cls).join('|')], ['the board\'s Undo names "hiding a warning"', !!tb && /hiding a warning/i.test(tb.title), tb && tb.title]], [pic10])
  const ub = await W.door(p, 'board', 'undo'); await L.settle(p); await H.boardOpenFold(p)
  const b2 = await H.readBoard(p), bl2 = b2.lines.find(l => RE.test(l.text)), bp2 = H.flagged(await H.pucks(p, '#schedBoard', WHO))
  const pic11 = await H.pic(p, '31-11-board-undone')
  H.judge('31.10', 'pressed the board\'s Undo', [['pressed', ub.pressed, JSON.stringify(ub)], ['heading counts 4', /\b4 issues/.test(b2.head), b2.head], ['the line is plain with ✕', !bl2.struck && bl2.btn === '✕', bl2.btn], ['Static\'s pucks carry the flag again', bp2.length > 0, bp2.length]], [pic11])
  const rb = await W.door(p, 'board', 'redo'); await L.settle(p); await H.boardOpenFold(p)
  const b3 = await H.readBoard(p), bl3 = b3.lines.find(l => RE.test(l.text)), bp3 = H.flagged(await H.pucks(p, '#schedBoard', WHO))
  const pic12 = await H.pic(p, '31-12-board-redone')
  H.judge('31.11', 'pressed the board\'s Redo', [['pressed', rb.pressed, JSON.stringify(rb)], ['heading counts 3', /\b3 issues/.test(b3.head), b3.head], ['struck, ↺ topmost', bl3.struck && bl3.btn === '↺' && bl3.btnTop === true, bl3.btn + ' ' + bl3.btnTop], ['Static\'s pucks plain', bp3.length === 0, bp3.map(x => x.cls).join('|')]], [pic12])
  await W.boardOff(p)
  const s12 = await C.see(p, '#eWeek', TUE, RE, WHO)
  await H.reloadAs(p, 'a'); await L.go(p, 'editsched')
  const s13 = await C.see(p, '#eWeek', TUE, RE, WHO)
  const pic13 = await C.picLine(p, '#eWeek', TUE, IX, '31-13-board-redone-reload')
  H.judge('31.12', 'closed the board (✓ Done): Edit Schedule\'s list; then a reload', [...C.hiddenChecks(s12, 3, { label: 'Edit Schedule: ' }), ...C.hiddenChecks(s13, 3, { label: 'after the reload: ' })], [pic13])
} catch (e) { H.row('31.X', 'the script', String(e && e.stack || e).slice(0, 700), 'FAIL', [await H.pic(p, '31-X-error')]) }
C.done('31', errors)
await browser.close()
