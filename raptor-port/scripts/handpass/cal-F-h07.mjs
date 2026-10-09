import * as L from './cal-F-lib3.mjs'
const PHONE = process.env.HP_PHONE === '1', TAG = PHONE ? 'ph' : 'dk'
const b = await L.launch()
const ctx = await L.newCtx(b, { phone: PHONE })
const p = await L.newPage(ctx)
await L.signIn(p, 'ad')
await L.go(p, 'inputs')
await L.toastSpy(p)
const P = L.press(p, PHONE)
const [ranger, saber] = await L.ids(p, ['Ranger', 'Saber'])
const pic = n => L.pic(p, `${TAG}-h07-${n}`)
const closeEd = async () => { for (const s of ['#inpEditCancel', '#inpEditClose']) { if (await p.locator(s + ':visible').count()) { await P(p.locator(s)).catch(() => {}); await L.sleep(300); return } } }
const closeDay = async () => { if (await p.locator('[data-testid="win-inputsday-x"]').count()) { await P(p.locator('[data-testid="win-inputsday-x"]')); await L.sleep(250) } }

/* Saber files a duty for Ranger from "+ Input" */
await L.openNew(p, '2026-07-28', { phone: PHONE })
const newPlaced = await p.locator('[data-testid="inped-placed"]').count()
const newText = await p.evaluate(() => document.getElementById('inpEditPop').innerText.replace(/\s+/g, ' '))
await pic('new-input-window')
await p.selectOption('#inpEditPerson', ranger); await p.selectOption('#inpEditType', 'Duty')
await L.setWhen(p, { allday: true, remarks: 'h07 one' })
await P(p.locator('#inpEditSave')); await L.sleep(700)
const r1 = (await L.rowsNow(p)).find(r => /^h07/.test(r.remarks))
/* Ranger changes the remarks */
await L.be(p, ranger, 'member')
await closeDay()
const bar = p.locator(`[data-testid="ib-bar-${r1.iid}"]`).first()
await P(bar); await L.sleep(700)
await p.locator('#inpEditRmk').fill('h07 two'); await P(p.locator('#inpEditSave')); await L.sleep(700)
await closeEd()
/* back to Saber: a NEW input again */
await L.be(p, saber, 'admin')
await closeDay()
await L.openNew(p, '2026-07-29', { phone: PHONE })
const new2Placed = await p.locator('[data-testid="inped-placed"]').count()
await pic('new-input-again')
await closeEd(); await closeDay()
/* the saved one */
await P(bar); await L.sleep(700)
const foot = await p.locator('[data-testid="inped-placed"]').innerText().catch(() => null)
await pic('saved-editor-foot')
await closeEd()
const tip = await bar.getAttribute('title')
let hoverShot = null
if (!PHONE) { await bar.hover(); await L.sleep(1500); hoverShot = await pic('bar-hover') }
/* the opened day's own line too */
await closeDay()
{ const c = L.cell(p, '2026-07-28'); if (PHONE) await c.tap({ position: { x: 8, y: 8 } }); else await c.click({ position: { x: 8, y: 8 } }); await L.sleep(500) }
const dayPlaced = await p.locator('[data-testid="idy-placed"]').first().innerText().catch(() => null)
const rN = (await L.rowsNow(p)).find(r => /^h07/.test(r.remarks))
console.log(JSON.stringify({ newPlaced, new2Placed, foot, tip, dayPlaced, by: r1 && r1.by, remarksNow: rN && rN.remarks }))
L.judge('H-07', 'Saber files a duty for Ranger from "+ Input"; Ranger changes its remarks; Saber opens a NEW "+ Input" (twice), the saved one, and hovers its bar', [
  ['a new input’s window has no placed-by line (first and second time)', newPlaced === 0 && new2Placed === 0, { newPlaced, new2Placed }],
  ['the saved one’s foot reads "Placed by Saber for Ranger · <date, time>"', /^Placed by Saber for Ranger · .+\d/.test(foot || ''), foot],
  ['after Ranger’s change the change is beside it ("changed by Ranger · …")', /changed by Ranger/.test(foot || ''), foot],
  ['the bar’s tooltip carries the same line (desktop)', PHONE ? true : /Placed by Saber for Ranger/.test(tip || '') && /changed by Ranger/.test(tip || ''), tip],
  ['the opened day’s line carries it too', /Placed by Saber for Ranger/.test(dayPlaced || ''), dayPlaced],
], [])
console.log('errors', JSON.stringify(L.errors))
L.savePart('h07-' + TAG)
await b.close()
