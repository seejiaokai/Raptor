/* The final reads' last two fixes, walked in the running app (30 Sep 26):
   - Fable F1 (step 4): Admin → Data → Clear edit history… runs as the ADMIN who asked — its change-log batch names his
     account, never "system"; a reload gives the history back as cleared and writes nothing.
   - Astra A3: a Tracker grade's batch names the mark's own table, `Attempt` (it said `Enrolment`).
   Results `docs/handpass/parts/dbrA-rewalk-host-final.json` (HP_OUT), pictures in the re-walk folder (HP_SHOTS). */
import * as L from './dbrA-lib.mjs'
import * as T from './dbrA-W5-lib.mjs'
const errors = []
const b = await L.launch(); const ctx = await L.context(b)
const p = await L.page(ctx, errors, 'A')
await L.signIn(p, 'a'); await L.settle(p)
const ELOG = /^settings\/elog:/
const batchesIn = (before, after) => Object.keys(after).filter(k => k.startsWith('changes/') && !(k in before)).map(k => JSON.parse(after[k]))

/* a history line of today to clear: a day note on the week */
await L.go(p, 'editsched')
const n0 = await L.rows(p)
const el = p.locator('#eWeek [data-txt="dn:1.0"]:visible').first()
await el.click(); await p.keyboard.press('End'); await p.keyboard.type(' FINAL-READ-LINE'); await p.keyboard.press('Tab'); await L.settle(p)
/* the signed-in admin's account, as his own edit's batch names it (the demo's seeded accounts are not stored as rows
   until one changes — [ACCOUNTS-SEED-FIRST-WRITE]) */
const noteBatches = batchesIn(n0, await L.rows(p))
const who = noteBatches.length ? noteBatches[0].actorId : null
L.check('the admin’s own edit is saved in a batch naming his account', !!who && who !== 'system', noteBatches.map(x => `${x.type} ${x.actorId}`))

/* Admin → Data → Clear edit history…: "A specific date" = today, tapped twice */
await L.go(p, 'admin')
const t = p.locator('[data-admcat="data"]:visible, .adm-cat:has-text("Data"):visible').first()
if (await t.count()) { await t.click(); await L.sleep(400) }
await p.waitForSelector('#admLog', { state: 'attached', timeout: 8000 })
const d = new Date(), pad = n => String(n).padStart(2, '0')
const TODAY = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
await p.selectOption('#admLogMode', 'on'); await L.sleep(150)
await p.fill('#admLogDate', TODAY); await L.sleep(150)
const before = await L.rows(p)
await p.click('#admLog'); await L.sleep(400)
const said = (await p.locator('#admLog').innerText()).trim()
await p.click('#admLog'); await L.sleep(900)
const after = await L.rows(p)
await L.shot(p, 'FINAL-1-history-cleared')
const dd = L.diff(before, after)
const bs = batchesIn(before, after)
const n = Number((said.match(/clear (\d+)/) || [])[1])
L.check('the sweep removed exactly the lines it said', n > 0 && dd.del.filter(k => ELOG.test(k)).length === n, { said, del: dd.del.length })
L.check('ONE batch, the sweep\'s', bs.length === 1 && bs[0].type === 'elog.sweep', bs.map(x => x.type))
L.check('its batch names the admin who cleared it, not "system" (Fable F1)', bs.length === 1 && bs[0].actorId === who && who !== 'system', { actorId: bs[0] && bs[0].actorId, who })
await L.reloadCompare(p, 'FINAL-1 the history cleared, after a reload')

/* a Tracker grade: its batch names `Attempt` (Astra A3) */
await T.toTracker(p)
const [ball] = await T.firstBalls(p, 1)
const g0 = await L.rows(p)
await T.grade(p, ball, 'DCO'); await L.settle(p)
const g1 = await L.rows(p)
await L.shot(p, 'FINAL-2-tracker-graded')
const gb = batchesIn(g0, g1)
const markItems = gb.flatMap(x => x.items).filter(i => /^tracker\/v3:[^:]+:[^:]+:m:/.test(i.key))
L.check('the grade saved its mark row, in a batch', markItems.length >= 1, gb.map(x => x.items.map(i => `${i.table} ${i.key}`)))
L.check('the batch names the mark\'s table Attempt, not Enrolment (Astra A3)', markItems.length >= 1 && markItems.every(i => i.table === 'Attempt'), markItems)
const dateItems = gb.flatMap(x => x.items).filter(i => /^tracker\/v3:[^:]+:[^:]+:d:/.test(i.key))
L.check('a date written with it is named Enrolment', dateItems.every(i => i.table === 'Enrolment'), dateItems)

L.check('no console error, page error or failed request', !errors.length, errors)
console.log(errors); await b.close(); L.save()
