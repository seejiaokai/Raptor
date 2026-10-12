// B6: phone 390x844 touch, an OD for Ranger on Sat 18 (answered Yes), arm Ranger's Unavailable puck, tap Hex in the drawer
import { world, done, log, rec, sleep, SAT, SAT_DI } from './on-B-lib.mjs'
const KIND = process.argv[2] || 'OD'
const w = await world('p844')
const { page, tid, press } = w
const iid = await w.fileIt(SAT, { type: KIND, people: ['bane'], title: KIND + ' thing' })
const rec0 = () => page.evaluate(i => { const r = window.INPUTS.find(x => x.iid === i); return JSON.stringify({ people: (r.people || []).map(p => (window.PEOPLE[p.p] || {}).cs), person: r.person, oil: r.oil || null }) }, iid)
const undoLabel = () => page.evaluate(() => { const b = document.querySelector('#undoBtn'); return b ? `${b.disabled ? 'off' : 'on'}|${b.title}` : '' })
log('filed', iid, await rec0())
await page.evaluate(() => window.go('editsched')); await sleep(900)
const day = page.locator('#page-editsched .day:not(.peek)').nth(SAT_DI)
const row = day.locator(`[data-inprow="${iid}"]`).first()
const armed = () => page.evaluate(() => ({ rosArm: !!document.querySelector('.ros-arm'), drawer: [...document.querySelectorAll('#eRoster')].some(e => { const b = e.getBoundingClientRect(); return b.width > 0 && b.left < innerWidth - 20 && b.right > 0 }) }))
const hex = await page.evaluate(() => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === 'Hex'))
const hp = () => page.locator(`#eRoster .rpuck .puck[data-person="${hex}"]`).first()
await row.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(500)
const s0 = { rec: await rec0(), undo: await undoLabel() }
const arm = async () => { const pk = await row.locator('.puck').first().boundingBox(); await page.touchscreen.tap(pk.x + pk.width / 2, pk.y + pk.height / 2); await sleep(800) }
const tapHex = async () => { if (!(await armed()).drawer) { await page.locator('#rosTab').tap(); await sleep(800) } await hp().evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(300); await hp().tap(); await sleep(900) }
await arm(); log('armed', await armed()); await w.shot(`B6-${KIND}-1-armed`)
await tapHex()
const q = { up: await tid('oilconf').count(), lead: await tid('oilconf-lead').innerText().catch(() => ''), head: await page.locator('[data-testid="oilconf"] .airpop-head b').innerText().catch(() => ''), cancel: await tid('oilconf-cancel').innerText().catch(() => ''), save: await tid('oilconf-save').innerText().catch(() => ''), saveDisabled: await tid('oilconf-save').isDisabled().catch(() => null), box: await w.measure('[data-testid="oilconf"] .airpop-box'), saveBox: await w.measureT('oilconf-save'), unchanged: (await rec0()) === s0.rec, undoSame: (await undoLabel()) === s0.undo }
await w.hush(); await w.shot(`B6-${KIND}-2-question`); await w.unhush()
rec(`B6-${KIND}-question`, q)
if (!q.up) { rec(`B6-${KIND}-noquestion`, { toast: await w.toast(), rec: await rec0(), undo: await undoLabel() }); await w.shot(`B6-${KIND}-2b-after`); await done(w); process.exit(0) }
await page.keyboard.press('Escape'); await sleep(700)
const r1 = { q: await tid('oilconf').count(), armed: await armed(), bar: await tid('oilbar-text').innerText().catch(() => ''), rec: (await rec0()) === s0.rec, undoSame: (await undoLabel()) === s0.undo, barBox: await w.measureT('oilbar') }
await w.shot(`B6-${KIND}-3-cancelled`)
rec(`B6-${KIND}-cancel`, r1)
let viaBar = false
if (await tid('oilbar-answer').count()) { await press(tid('oilbar-answer')); await sleep(600); viaBar = (await tid('oilconf').count()) === 1 }
log('question back via the bar', viaBar, await tid('oilconf-lead').innerText().catch(() => ''))
await press(tid('oil-yes')); await sleep(200)
await press(tid('oilconf-save')); await sleep(900)
const r3 = { toast: await w.toast(), rec: await rec0(), q: await tid('oilconf').count(), bar: await tid('oilbar').count(), armed: await armed(), undo: await undoLabel() }
await w.shot(`B6-${KIND}-4-after`)
rec(`B6-${KIND}-answered`, r3)
if ((await armed()).drawer) { await page.locator('#rosTab').tap(); await sleep(800) }
await press(page.locator('#undoBtn')); await sleep(700)
rec(`B6-${KIND}-undo`, { rec: await rec0(), same: (await rec0()) === s0.rec })
await done(w); process.exit(0)
