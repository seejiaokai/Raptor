// B2 desktop once: click "+ add" on the week row, click a crew name
import { world, done, log, rec, sleep, FRI, makeHoliday, closeCal } from './on-B-lib.mjs'
const w = await world('desk')
const { page, tid, press } = w
const iid = await w.fileIt(FRI, { type: 'Training', people: ['bane', 'harpoon'], from: '09:00', to: '12:00', title: 'Fri brief' })
await makeHoliday(w); await press(tid('odl-later')); await sleep(400); await closeCal(w)
await page.evaluate(() => window.go('editsched')); await sleep(900)
await page.evaluate(() => window.openScheduler(4)); await sleep(1000)
const rows = page.locator('#schedBoard .sb-arow')
const idx = await rows.evaluateAll(els => els.findIndex(e => /fri brief/i.test((e.querySelector('textarea.ain, input.ain') || {}).value || '')))
const row = rows.nth(idx)
await row.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(500)
const undoLabel = () => page.evaluate(() => { const b = document.querySelector('#undoBtn'); return b ? `${b.disabled ? 'off' : 'on'}|${b.title}` : '' })
const state = () => page.evaluate(i => { const r = window.INPUTS.find(x => x.iid === i); return JSON.stringify({ people: (r.people || []).map(p => (window.PEOPLE[p.p] || {}).cs), oil: r.oil || null }) }, iid)
const armInfo = () => page.evaluate(() => ({ rosArm: !!document.querySelector('.ros-arm'), rosOpen: document.body.classList.contains('ros-open') }))
const s0 = { st: await state(), undo: await undoLabel() }
const ab = await row.locator('.addz').first().boundingBox()
log('addz', ab)
await page.mouse.move(ab.x + ab.width / 2, ab.y + ab.height / 2); await sleep(300)
await w.shot('B2d-1-hover')
await page.mouse.click(ab.x + ab.width / 2, ab.y + ab.height / 2); await sleep(800)
log('armed after click +add', await armInfo())
await w.shot('B2d-2-armed')
const tally = await page.evaluate(() => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === 'Tally'))
const tl = page.locator(`#sbRoster .rpuck .puck[data-person="${tally}"]`).first()
log('tally in crew list', await tl.count(), await tl.boundingBox())
if (!(await tl.boundingBox())) { await page.locator('.sb-ros .ros-tab').click(); await sleep(700) }
await tl.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(300)
await tl.click(); await sleep(800)
const q = { up: await tid('oilconf').count(), lead: await tid('oilconf-lead').innerText().catch(() => ''), box: await w.measure('[data-testid="oilconf"] .airpop-box') }
await w.hush(); await w.shot('B2d-3-question'); await w.unhush()
rec('B2d-question', q)
await page.keyboard.press('Escape'); await sleep(600)
const r1 = { q: await tid('oilconf').count(), armed: await armInfo(), bar: await tid('oilbar-text').innerText().catch(() => ''), st: await state(), undoSame: (await undoLabel()) === s0.undo }
await w.shot('B2d-4-after-escape')
rec('B2d-escape', r1)
if (await tid('oilbar-ok').count()) await press(tid('oilbar-ok')); await sleep(300)
await tl.click(); await sleep(800)
await press(tid('oil-no')); await press(tid('oilconf-save')); await sleep(900)
const r3 = { toast: await w.toast(), armed: await armInfo(), st: await state(), undo: await undoLabel() }
await w.shot('B2d-5-after-no-add')
rec('B2d-no-add', r3)
await done(w); process.exit(0)
