// B2: the phone's armed "+ add", cancel, then answer No -> Add
import { world, done, log, rec, sleep, FRI, makeHoliday, closeCal } from './on-B-lib.mjs'
const w = await world('p844')
const { page, tid, press } = w
const iid = await w.fileIt(FRI, { type: 'Training', people: ['bane'], from: '09:00', to: '12:00', title: 'Fri brief' })
await makeHoliday(w); await press(tid('odl-later')); await sleep(400); await closeCal(w)
await page.evaluate(() => window.go('editsched')); await sleep(800)
const rowLoc = page.locator('#page-editsched .day:not(.peek)').nth(4).locator('.pl-row').filter({ has: page.locator('.nm .ntx', { hasText: /fri brief/i }) })
log('rows found', await rowLoc.count())
const row = rowLoc.first()
await row.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(400)
const add = row.locator('.addz').first()
log('add count in row', await row.locator('.addz').count(), await row.evaluate(e => e.outerHTML.slice(0, 600)))
await w.shot('B2-1-week-row')
const oilNow = () => page.evaluate(i => JSON.stringify(window.INPUTS.find(r => r.iid === i).oil || null), iid)
const peopleNow = () => page.evaluate(i => { const r = window.INPUTS.find(r => r.iid === i); return JSON.stringify({ person: r.person, grp: r.grp || null }) }, iid)
const undoLabel = () => page.evaluate(() => { const b = document.querySelector('#undoBtn'); return b ? `${b.disabled ? 'off' : 'on'}|${b.title}` : '' })
const before = { oil: await oilNow(), ppl: await peopleNow(), undo: await undoLabel() }
log('before', before)
await press(add); await sleep(800)
const armed = async () => page.evaluate(() => ({ armCls: [...document.querySelectorAll('.arm, .armed, [data-armed], .addz.on, .addz.arm')].length, rosterOpen: !!document.querySelector('#eRoster') && document.querySelector('#eRoster').getBoundingClientRect().width > 0, bodyCls: document.body.className }))
log('after tap +add', await armed())
await w.shot('B2-2-armed')
// find Tally in the drawer
const tally = await page.evaluate(() => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === 'Tally'))
const tl = page.locator(`#eRoster .rpuck .puck[data-person="${tally}"]`)
log('tally in drawer', await tl.count(), await tl.first().boundingBox())
await done(w); process.exit(0)
