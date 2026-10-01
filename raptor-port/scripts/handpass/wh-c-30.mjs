/* walker C — scenario 30: two schedulers see a hide, then a flag-again, as one shared state; the change history names
   both acts and both men. Scheduler A = Saber (tab A). Scheduler B = Hex, made an admin on Admin → Users (his row →
   Role → Save), in a second tab of the same browser. This build has no server: a tab learns of the other's change at
   its next reload, so "refreshes" is a reload and a sign-in. */
import * as C from './wh-c-lib.mjs'
const { H } = C, { L, W } = H
const TUE = 1, RE = /Long work day/i, WHO = 'wolf'
const { browser, ctx, p, errors } = await H.world({ who: 'a' })
try {
  const hexRow = await C.makeHexAdmin(p)
  await L.go(p, 'editsched')
  const q = await C.secondPage(ctx, errors, C.HEX)
  const qBadge = await q.evaluate(() => (document.querySelector('#roleBadge') || {}).innerText || '')
  await L.go(q, 'editsched')
  const a0 = await C.see(p, '#eWeek', TUE, RE, WHO), b0 = await C.see(q, '#eWeek', TUE, RE, WHO), IX = a0.line.ix
  const picA0 = await C.picLine(p, '#eWeek', TUE, IX, '30-0-A-before'), picB0 = await C.picLine(q, '#eWeek', TUE, IX, '30-0-B-before')
  H.judge('30.0', 'Admin → Users: Hex\'s row → Role "Admin" → Save; a second tab signed in as Hex; both on Edit Schedule, Tuesday', [['Hex is an admin on the roster list', /ADMIN/i.test(hexRow), hexRow], ['tab B is Hex · Admin with Edit Schedule', /HEX/i.test(qBadge) && /ADMIN/i.test(qBadge), qBadge], ...C.shownChecks(a0, 4, { label: 'A: ' }), ...C.shownChecks(b0, 4, { label: 'B: ' })], [picA0, picB0])

  /* A hides */
  await H.tapLine(p, '#eWeek', TUE, IX); await L.settle(p)
  const a1 = await C.see(p, '#eWeek', TUE, RE, WHO)
  const b1stale = await C.see(q, '#eWeek', TUE, RE, WHO)
  await H.reloadAs(q, C.HEX); await L.go(q, 'editsched')
  const b1 = await C.see(q, '#eWeek', TUE, RE, WHO)
  const picB1 = await C.picLine(q, '#eWeek', TUE, IX, '30-1-B-sees-A-hide')
  H.judge('30.1', 'A (Saber) pressed ✕ on Static\'s "Long work day"; B (Hex) reloaded and signed in', [...C.hiddenChecks(a1, 3, { label: 'A: ' }), ...C.hiddenChecks(b1, 3, { label: 'B after his reload: ' })], [picB1])
  H.row('30.1n', 'B\'s tab BEFORE its reload (recorded, not judged — this build has no server, so a tab learns at its next reload)', C.say(b1stale), 'RECORDED')

  /* B flags again */
  await H.tapLine(q, '#eWeek', TUE, IX); await L.settle(q)
  const b2 = await C.see(q, '#eWeek', TUE, RE, WHO)
  const picB2 = await C.picLine(q, '#eWeek', TUE, IX, '30-2-B-flags-again')
  await H.reloadAs(p, 'a'); await L.go(p, 'editsched')
  const a2 = await C.see(p, '#eWeek', TUE, RE, WHO)
  const picA2 = await C.picLine(p, '#eWeek', TUE, IX, '30-2-A-sees-B-flag-again')
  H.judge('30.2', 'B (Hex) pressed ↺ on the struck line; A (Saber) reloaded and signed in', [...C.shownChecks(b2, 4, { label: 'B: ' }), ...C.shownChecks(a2, 4, { label: 'A after his reload: ' })], [picB2, picA2])

  /* B reloads once more: his own flag-again is still what is kept (the last refresh must not bring the hide back) */
  await H.reloadAs(q, C.HEX); await L.go(q, 'editsched')
  const b3 = await C.see(q, '#eWeek', TUE, RE, WHO)
  H.judge('30.3', 'B reloaded again', C.shownChecks(b3, 4, { label: 'B: ' }), [await C.picLine(q, '#eWeek', TUE, IX, '30-3-B-reload')])

  /* the change history */
  const ch = await C.changesText(p, { by: 'Item' })
  const picH = await H.pic(p, '30-4-A-changes-window')
  const chWho = await C.changesText(p, { by: 'Who' })
  const picH2 = await H.pic(p, '30-5-A-changes-by-who')
  await C.closeChanges(p)
  const t = (ch.text || '') + ' ' + (chWho.text || '')
  console.log('CHANGES', (ch.text || JSON.stringify(ch)).slice(0, 1500), '\nBY WHO', (chWho.text || '').slice(0, 1500))
  const stored = await C.histTail(p, 4)
  console.log('STORED', stored.join('\n'))
  H.judge('30.4', 'A opened the changes window (the top bar\'s clock) → "All changes", grouped by Item, then by Who', [
    ['it lists the hide: "flagged → hidden"', /flagged\s*→\s*hidden/i.test(t), (ch.text || '').slice(0, 300)],
    ['it lists the flag-again: "hidden → flagged"', /hidden\s*→\s*flagged/i.test(t)],
    ['it names Saber', /Saber/.test(t)], ['it names Hex', /Hex/.test(t)],
    ['the line is a "Warning · Static — …" line', /Warning\s*·\s*Static/i.test(t)],
    ['exactly two warning changes (no duplicate, no contradiction)', (t.match(/flagged\s*→\s*hidden/gi) || []).length === 2 && (t.match(/hidden\s*→\s*flagged/gi) || []).length === 2, JSON.stringify({ hide: (t.match(/flagged\s*→\s*hidden/gi) || []).length, again: (t.match(/hidden\s*→\s*flagged/gi) || []).length, note: 'each counted once per grouping (Item + Who)' })],
  ], [picH, picH2])
} catch (e) { H.row('30.X', 'the script', String(e && e.stack || e).slice(0, 700), 'FAIL', [await H.pic(p, '30-X-error')]) }
C.done('30', errors)
await browser.close()
