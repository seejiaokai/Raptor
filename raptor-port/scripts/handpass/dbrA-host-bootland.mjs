import * as L from './dbrA-lib.mjs'
const errors = []
const b = await L.launch(); const ctx = await L.context(b); const p = await L.page(ctx, errors)
await L.signIn(p, 'a'); await L.settle(p)
await L.go(p, 'editsched')
console.log('sample inputs', await p.evaluate(() => JSON.stringify(window.INPUTS.slice(0, 3))))
await L.step(p, 'save week 13 Jul (Monday note)', async () => {
  const el = p.locator('#eWeek [data-txt="dn:0.0"]:visible').first(); await el.click(); await p.keyboard.type(' X'); await p.keyboard.press('Tab')
})
await L.step(p, 'switch to week 20 Jul', () => p.evaluate(() => window.loadWeek('20/07/2026')), { none: true })
const pid = await p.evaluate(() => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === 'RANGER') || Object.keys(window.PEOPLE)[5])
const a = await L.step(p, 'file a request dated in 13 Jul week while 20 Jul is loaded', () => p.evaluate(pid => {
  const t = window.INPUTS.find(i => /leave|LL|OL/i.test(String(i.type)))
  window.fileInput({ person: pid, type: 'Appointment', date: 'Jul 15', allday: false, s: 600, e: 660, yr: 2026, remarks: 'walk appt' })
}, pid))
console.log('filing wrote', a.put, a.del)
// reload: the boot opens on 13 Jul, re-lands the request
const before = await L.rows(p)
await p.reload(); await L.signIn(p, 'a', { goto: false }); await L.settle(p, 1200)
const after = await L.rows(p)
const au = L.audit(before, after)
L.check('reload onto the saved week: rows written at boot are named by a batch', !au.bare.length, { bare: au.bare, put: au.put, batches: au.batches })
console.log('week now', await p.evaluate(() => window.CURWEEK))
console.log(errors)
await b.close(); L.save()
