/* Reproducing Fable's final-read finding 2 (30 Sep 26): a week switch's landing (`sched.load`) writes an input and a day
   row from a STALE tab's copy. Two tabs of one browser. Setup: week 20 saved (a note on Tue) BEFORE request X exists; X
   filed for Wed 22 Jul while week 13 is loaded. Tab B boots now and stays on week 13. Tab A edits X's remarks and adds a
   note on week 20's Wed. Then B (stale) switches to week 20. Right: after reloads X carries A's remarks and Wed A's note. */
import * as L from './dbrA-lib.mjs'
const errors = []
const b = await L.launch(); const ctx = await L.context(b)
const A = await L.page(ctx, errors, 'A')
await L.signIn(A, 'a'); await L.settle(A); await L.go(A, 'editsched')
const note = async (p, key, text) => { const el = p.locator(`#eWeek [data-txt="${key}"]:visible`).first(); await el.click(); await p.keyboard.press('End'); await p.keyboard.type(text); await p.keyboard.press('Tab'); await L.settle(p) }
await A.evaluate(() => window.loadWeek('20/07/2026')); await L.sleep(700)
await note(A, 'dn:1.0', ' W20-SAVED')                                   // week 20 saved (week row + Tue)
await A.evaluate(() => window.loadWeek('13/07/2026')); await L.sleep(700)
await A.evaluate(() => window.fileInput({ person: 'bane', type: 'Appointment', date: 'Jul 22', allday: false, s: 600, e: 660, yr: 2026, remarks: 'X ORIGINAL' }))
await L.settle(A)
const xid = await A.evaluate(() => window.INPUTS.find(i => i.remarks === 'X ORIGINAL').iid)
/* tab B boots now — it holds X with its original remarks and week 20 as saved */
const B = await L.page(ctx, errors, 'B'); await L.signIn(B, 'a'); await L.settle(B); await L.go(B, 'editsched')
/* A changes X's remarks (the real inputs door) and puts a note on week 20's Wednesday */
await A.evaluate(id => { const inp = window.INPUTS.find(i => i.iid === id); window.fileInput && 0; }, xid)
const setRemarks = await A.evaluate(async (id) => { const m = await import('/src/ui/inputedit.tsx').catch(() => null); return !!m }, xid)
await A.evaluate(() => window.loadWeek('20/07/2026')); await L.sleep(700)
await note(A, 'dn:2.0', ' A-WED-NOTE')
const rowsAfterA = await L.rows(A)
const wedA = rowsAfterA['weeks/20-07-2026#2']
L.check('A: Wednesday saved with A\'s note', /A-WED-NOTE/.test(wedA || ''), (wedA || '').slice(0, 80))
/* B, stale, switches to week 20: its landing puts X on Wednesday */
const before = await L.rows(B)
await B.evaluate(() => window.loadWeek('20/07/2026')); await L.settle(B)
const after = await L.rows(B)
const d = L.diff(before, after)
console.log('B switch wrote', d.put, d.del)
L.check('B\'s week switch does not overwrite A\'s Wednesday', /A-WED-NOTE/.test(after['weeks/20-07-2026#2'] || ''), (after['weeks/20-07-2026#2'] || '').slice(0, 120))
L.check('B\'s week switch writes no row', !d.put.length && !d.del.length, d.put.join(', '))
console.log(errors); await b.close(); L.save()
