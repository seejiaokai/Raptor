// B2: phone 390x844 touch. Person armed first (a populated row's "+ add" cannot be armed first by a finger), then tap the place.
import { world, done, log, rec, sleep, FRI, makeHoliday, closeCal } from './on-B-lib.mjs'
const w = await world('p844')
const { page, tid, press } = w
const iid = await w.fileIt(FRI, { type: 'Training', people: ['bane', 'harpoon'], from: '09:00', to: '12:00', title: 'Fri brief' })
await makeHoliday(w); await press(tid('odl-later')); await sleep(400); await closeCal(w)
await page.evaluate(() => window.go('editsched')); await sleep(800)
const row = page.locator('#page-editsched .day:not(.peek)').nth(4).locator('.pl-row').filter({ has: page.locator('.nm .ntx', { hasText: /fri brief/i }) }).first()
const undoLabel = () => page.evaluate(() => { const b = document.querySelector('#undoBtn'); return b ? `${b.disabled ? 'off' : 'on'}|${b.title}` : '' })
const state = () => page.evaluate(i => { const r = window.INPUTS.find(x => x.iid === i); return JSON.stringify({ who: [r.person, ...(r.people || r.more || [])].map(p => (window.PEOPLE[p] || {}).cs || p), oil: r.oil || null, grp: r.grp || null, ppl: Object.keys(r).filter(k => /pers|peop|grp|who/.test(k)).reduce((o, k) => (o[k] = r[k], o), {}) }) }, iid)
const armInfo = () => page.evaluate(() => ({ ros: document.body.classList.contains('ros-open'), oktake: document.querySelectorAll('#page-editsched .oktake').length }))
await row.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(400)
const s0 = { st: await state(), undo: await undoLabel() }
log('before', s0)
const tally = await page.evaluate(() => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === 'Tally'))
const tl = page.locator(`#eRoster .rpuck .puck[data-person="${tally}"]`)
const toggleDrawer = async () => { await page.locator('#rosTab').tap(); await sleep(800) }
const armTally = async () => {
  await toggleDrawer()
  await tl.first().evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(300); await tl.first().tap(); await sleep(600)
}
const tapPlace = async () => {
  await row.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(400)
  const pb = await row.locator('.puck[data-person="harpoon"]').first().boundingBox()
  await page.touchscreen.tap(pb.x + pb.width / 2, pb.y + pb.height / 2); await sleep(800)
}
await armTally()
const a0 = { drawer: (await armInfo()).ros, ...(await armInfo()) }
log('after tapping Tally in the drawer', a0)
await w.shot('B2-2-tally-armed-drawer')
await toggleDrawer()
log('drawer closed', await armInfo())
// ---- round 1: Escape
await tapPlace()
const q = { up: await tid('oilconf').count() }
q.lead = await tid('oilconf-lead').innerText().catch(() => ''); q.cancel = await tid('oilconf-cancel').innerText().catch(() => ''); q.save = await tid('oilconf-save').innerText().catch(() => '')
q.saveDisabled = await tid('oilconf-save').isDisabled().catch(() => null)
q.box = await w.measure('[data-testid="oilconf"] .airpop-box'); q.saveBox = await w.measureT('oilconf-save')
await w.hush(); await w.shot('B2-3-question'); await w.unhush()
rec('B2-question', q)
await page.keyboard.press('Escape'); await sleep(500)
const r1 = { q: await tid('oilconf').count(), armed: await armInfo(), bar: await tid('oilbar-text').innerText().catch(() => ''), st: await state(), undoSame: (await undoLabel()) === s0.undo, barBox: await w.measureT('oilbar') }
await w.shot('B2-4-after-escape')
rec('B2-escape', r1)
// ---- round 2: the X (the bar from round 1 is still up: tap OK first, as a person would)
if (await tid('oilbar-ok').count()) await press(tid('oilbar-ok')); await sleep(300)
log('armed before round 2', await armInfo())
await tapPlace()
const xs = page.locator('[data-testid="oilconf"] .airpop-head button, [data-testid="oilconf"] .airpop-head [role=button], [data-testid="oilconf"] .airpop-x, [data-testid="oilconf-x"]')
log('x candidates', await xs.count(), await page.evaluate(() => document.querySelector('[data-testid="oilconf"] .airpop-head')?.innerHTML.slice(0, 300)))
if (await xs.count()) await xs.first().tap(); await sleep(500)
const r2 = { q: await tid('oilconf').count(), armed: await armInfo(), bar: await tid('oilbar-text').innerText().catch(() => ''), st: await state(), undoSame: (await undoLabel()) === s0.undo }
await w.shot('B2-5-after-x')
rec('B2-x', r2)
// ---- round 3: No -> Add
if (await tid('oilbar-ok').count()) await press(tid('oilbar-ok')); await sleep(300)
await tapPlace()
await press(tid('oil-no')); await sleep(200)
const saveLive = !(await tid('oilconf-save').isDisabled())
await press(tid('oilconf-save')); await sleep(800)
const r3 = { saveLive, toast: await w.toast(), armed: await armInfo(), st: await state(), q: await tid('oilconf').count(), bar: await tid('oilbar').count(), undo: await undoLabel() }
await w.shot('B2-6-after-no-add')
rec('B2-no-add', r3)
await press(page.locator('#undoBtn')).catch(() => {}); await sleep(600)
rec('B2-undo', { st: await state(), same: (await state()) === s0.st })
await done(w); process.exit(0)
