// B2: armed "+ add" on a row that holds several (a one-man row shows no "+ add"), phone 390x844 by touch
import { world, done, log, rec, sleep, FRI, makeHoliday, closeCal } from './on-B-lib.mjs'
const w = await world('p844')
const { page, tid, press } = w
const iid = await w.fileIt(FRI, { type: 'Training', people: ['bane', 'harpoon'], from: '09:00', to: '12:00', title: 'Fri brief' })
log('filed', iid)
const up = await makeHoliday(w); log('list up', up)
await press(tid('odl-later')); await sleep(400); await closeCal(w)
await page.evaluate(() => window.go('editsched')); await sleep(800)
const row = page.locator('#page-editsched .day:not(.peek)').nth(4).locator('.pl-row').filter({ has: page.locator('.nm .ntx', { hasText: /fri brief/i }) }).first()
await row.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(400)
const undoLabel = () => page.evaluate(() => { const b = document.querySelector('#undoBtn'); return b ? `${b.disabled ? 'off' : 'on'}|${b.title}` : '' })
const state = () => page.evaluate(i => { const r = window.INPUTS.filter(x => x.iid === i || (x.grp && x.grp === window.INPUTS.find(y => y.iid === i).grp)); return JSON.stringify({ n: r.length, who: r.map(x => (window.PEOPLE[x.person] || {}).cs), oil: r.map(x => x.oil || null) }) }, iid)
const armInfo = () => page.evaluate(() => ({ ros: document.body.classList.contains('ros-open'), armCls: [...document.querySelectorAll('[class*="arm"]')].slice(0, 6).map(e => e.tagName + '.' + e.className.toString().slice(0, 50)), rowTxt: [...document.querySelectorAll('#page-editsched .pl-row')].find(r => /fri brief/i.test(r.textContent))?.querySelector('.ppl')?.className }))
log('rowhtml', await row.evaluate(e => e.querySelector('.ppl').outerHTML.slice(0, 500)))
const s0 = { st: await state(), undo: await undoLabel() }
log('before', s0, await w.groundNowFri?.())
await w.shot('B2-1-week-row-several')
const add = row.locator('.addz').first()
log('addz box', await add.boundingBox())
{ const ab = await add.boundingBox(); await page.touchscreen.tap(ab.x + ab.width / 2, ab.y + ab.height / 2) } await sleep(800)
const a1 = await armInfo(); log('after tap + add', a1)
await w.shot('B2-2-armed-drawer-open')
const tally = await page.evaluate(() => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === 'Tally'))
const tl = page.locator(`#eRoster .rpuck .puck[data-person="${tally}"]`)
const tapTally = async () => { await tl.first().evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(300); await tl.first().tap(); await sleep(700) }
// ---- round 1: Escape
await tapTally()
const q = {}
q.up = await tid('oilconf').count()
q.lead = await tid('oilconf-lead').innerText().catch(() => ''); q.cancel = await tid('oilconf-cancel').innerText().catch(() => ''); q.save = await tid('oilconf-save').innerText().catch(() => '')
q.saveDisabled = await tid('oilconf-save').isDisabled().catch(() => null)
q.box = await w.measure('[data-testid="oilconf"] .airpop-box')
q.saveBox = await w.measureT('oilconf-save')
await w.hush(); await w.shot('B2-3-question'); await w.unhush()
rec('B2-question', q)
await page.keyboard.press('Escape'); await sleep(500)
const r1 = { q: await tid('oilconf').count(), armed: await armInfo(), bar: await tid('oilbar-text').innerText().catch(() => ''), st: await state(), undoSame: (await undoLabel()) === s0.undo, barBox: await w.measureT('oilbar') }
await w.shot('B2-4-after-escape')
rec('B2-escape', r1)
// ---- round 2: the X
await press(tid('oilbar-ok')).catch(() => {}); await sleep(300)
log('drawer still open before round 2', (await armInfo()).ros)
await tapTally()
const x = page.locator('[data-testid="oilconf"] .airpop-head [aria-label], [data-testid="oilconf"] .airpop-head button, [data-testid="oilconf"] .airpop-x').first()
log('x found', await x.count())
if (await x.count()) await x.tap(); await sleep(500)
const r2 = { q: await tid('oilconf').count(), armed: await armInfo(), bar: await tid('oilbar-text').innerText().catch(() => ''), st: await state(), undoSame: (await undoLabel()) === s0.undo }
await w.shot('B2-5-after-x')
rec('B2-x', r2)
// ---- round 3: No -> Add
await tapTally()
await press(tid('oil-no')); await sleep(200)
const saveLive = !(await tid('oilconf-save').isDisabled())
await press(tid('oilconf-save')); await sleep(800)
const r3 = { saveLive, toast: await w.toast(), armed: await armInfo(), st: await state(), q: await tid('oilconf').count(), bar: await tid('oilbar').count(), undo: await undoLabel() }
await w.shot('B2-6-after-no-add')
rec('B2-no-add', r3)
await press(page.locator('#undoBtn')).catch(() => {}); await sleep(600)
rec('B2-undo', { st: await state(), same: (await state()) === s0.st })
await done(w); process.exit(0)
