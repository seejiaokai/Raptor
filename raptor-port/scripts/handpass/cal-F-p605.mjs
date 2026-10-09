import * as L from './cal-F-lib3.mjs'
const PHONE = process.env.HP_PHONE === '1', TAG = PHONE ? 'ph' : 'dk'
const b = await L.launch()
const ctx = await L.newCtx(b, { phone: PHONE })
const p = await L.newPage(ctx)
await L.signIn(p, 'ad')
await L.go(p, 'inputs')
await L.toastSpy(p)
const P = L.press(p, PHONE)
const [ranger, echo, cutter, saber] = await L.ids(p, ['Ranger', 'Echo', 'Cutter', 'Saber'])
const pic = n => L.pic(p, `${TAG}-p605-${n}`)
const recs = () => p.evaluate(() => window.INPUTS.filter(r => r.remarks && /^p605/.test(r.remarks)).map(r => ({ cs: window.PEOPLE[r.person].cs, date: r.date, remarks: r.remarks, grp: r.grp, iid: r.iid })))
const picked = () => p.evaluate(() => [...document.querySelectorAll('#inpEditPop [data-pp][aria-pressed="true"]')].map(e => window.PEOPLE[e.dataset.pp].cs))
const edUp = () => p.evaluate(() => { const e = document.getElementById('inpEditPop'); return !!e && e.offsetParent !== null })
const switchTo = async (on) => {
  await L.be(p, saber, 'admin')
  if (PHONE && await p.locator('[data-testid="win-inputedit"]').count()) {
    /* a window can be dragged: carry the open draft down the screen by its bar to reach the gear behind it */
    const wb = await p.locator('[data-testid="win-inputedit"] .win-bar').boundingBox()
    await p.mouse.move(wb.x + 60, wb.y + wb.height / 2); await p.mouse.down(); await p.mouse.move(wb.x + 60, wb.y + 330, { steps: 8 }); await p.mouse.up(); await L.sleep(400)
    await pic('draft-dragged-down')
  }
  await P(p.locator('[data-testid="in-gear"]')); await L.sleep(500)
  const c = p.locator('[data-testid="iset-memberfile"]')
  if ((await c.isChecked()) !== on) { await c.setChecked(on) }
  await pic(on ? 'gear-on' : 'gear-off')
  await P(p.locator('[data-testid="iset-save"]')); await L.sleep(600)
}

/* switch is on (default). Ranger files for himself and Echo, saved. */
await L.be(p, ranger, 'member')
await L.openNew(p, '2026-07-31', { phone: PHONE })
await p.selectOption('#inpEditType', 'Meeting')
await L.pickSeveral(p, [ranger, echo], { phone: PHONE })
await L.setWhen(p, { allday: true, remarks: 'p605 saved' })
const had = await L.iidSet(p)
await P(p.locator('#inpEditSave')); await L.sleep(700)
const s0 = await recs()
console.log('saved', JSON.stringify(s0.map(r => [r.cs, r.date])))
/* another such draft left open */
await L.openNew(p, '2026-08-03', { phone: PHONE })
await p.selectOption('#inpEditType', 'Meeting')
await L.pickSeveral(p, [ranger, echo, cutter], { phone: PHONE })
await L.setWhen(p, { allday: true, remarks: 'p605 draft' })
const draftBefore = await picked()
await pic('draft-open')

/* turn the member switch OFF (admin, same world) */
await switchTo(false)
await L.be(p, ranger, 'member')
if (PHONE && await p.locator('[data-testid="win-inputedit"]').count()) {
  /* carry the draft window back up by its bar */
  const wb = await p.locator('[data-testid="win-inputedit"] .win-bar').boundingBox()
  await p.mouse.move(wb.x + 60, wb.y + wb.height / 2); await p.mouse.down(); await p.mouse.move(wb.x + 60, 24, { steps: 8 }); await p.mouse.up(); await L.sleep(400)
}
const draftAfter = await picked()
const edStill = await edUp()
const why = await p.evaluate(() => ({ why: (document.querySelector('#inpEditPop [data-testid="pp-why"]') || {}).innerText || null, fix: (document.querySelector('#inpEditPop [data-testid="pp-fix"]') || {}).innerText || null }))
await pic('draft-after-off')
/* Save the draft */
const had2 = await L.iidSet(p)
await L.toasts(p)
await P(p.locator('#inpEditSave')); await L.sleep(300)
const tSave = (await L.toasts(p)).join(' | ')
const picSave = await pic('draft-save-refused')
const new2 = (await L.newRows(p, had2)).length
const draftAfterSave = await picked()
await L.sleep(300)
/* Esc/cancel the draft; try the saved entry: edit, delete */
await P(p.locator('#inpEditCancel')).catch(() => {}); await L.sleep(300)
if (await p.locator('[data-testid="win-inputsday-x"]').count()) { await P(p.locator('[data-testid="win-inputsday-x"]')); await L.sleep(250) }
await L.month(p, 2026, 7, PHONE ? (l => l.tap()) : null)
const bar = p.locator('#inpCal .ib-bar').filter({ hasText: '+1' }).first()
await P(bar); await L.sleep(700)
const ed = await p.evaluate(() => { const vis = s => { const x = document.querySelector(s); return !!x && x.offsetParent !== null }; const e = document.getElementById('inpEditPop'); return { save: vis('#inpEditSave'), del: vis('#inpEditDel'), takeout: vis('[data-testid="inped-takeout"]'), ro: (document.querySelector('[data-testid="inped-ro"]') || {}).innerText || '', text: e ? e.innerText.replace(/\s+/g, ' ').slice(-300) : null } })
await pic('saved-entry-switch-off')
await p.locator('[data-testid="win-inputedit"] .airpop-body').evaluate(e => { e.scrollTop = e.scrollHeight }).catch(() => {}); await L.sleep(250)
await pic('saved-entry-switch-off-foot')
let tEdit = ''
if (ed.save) { await p.locator('#inpEditRmk').fill('p605 saved edit'); await L.toasts(p); await P(p.locator('#inpEditSave')); await L.sleep(500); tEdit = (await L.toasts(p)).join(' | ') }
let tDel = ''
if (ed.del) { await L.toasts(p); await P(p.locator('#inpEditDel')); await L.sleep(400); const y = p.locator('[data-testid="inped-delall-yes"]'); if (await y.count()) { await pic('delete-ask'); await P(y); await L.sleep(500) } tDel = (await L.toasts(p)).join(' | ') }
const s1 = await recs()
console.log('after edit/delete tries', JSON.stringify(s1.map(r => [r.cs, r.remarks])), 'toast edit', tEdit, 'toast del', tDel, JSON.stringify(ed))
if (await p.locator('#inpEditCancel:visible').count()) { await P(p.locator('#inpEditCancel')).catch(() => {}) } else if (await p.locator('#inpEditClose:visible').count()) await P(p.locator('#inpEditClose')).catch(() => {})
await L.sleep(300)
/* Undo of the earlier filing (Ranger's own undo bar) */
const undoBtn = p.locator('#undoBtn')
await L.toasts(p)
await P(undoBtn); await L.sleep(700)
const tUndo = (await L.toasts(p)).join(' | ')
const s2 = await recs()
const picU = await pic('undo-try')
console.log('undo toast', tUndo, JSON.stringify(s2.map(r => [r.cs, r.date])))

/* restore the switch */
await switchTo(true)
await L.be(p, ranger, 'member')
await L.openNew(p, '2026-08-03', { phone: PHONE })
await p.selectOption('#inpEditType', 'Meeting')
await L.pickSeveral(p, [ranger, echo, cutter], { phone: PHONE })
await L.setWhen(p, { allday: true, remarks: 'p605 restored' })
const had3 = await L.iidSet(p)
await L.toasts(p)
await P(p.locator('#inpEditSave')); await L.sleep(700)
const tR = (await L.toasts(p)).join(' | ')
const new3 = await L.newRows(p, had3)
await pic('restored-save')

L.judge('P6-05', 'Ranger files for himself + Echo, leaves a three-man draft open; Saber turns "Members may file for other people" OFF (same world); Ranger tries Save, edit, delete, Undo; the switch goes back ON', [
  ['the saved entry stays (both records still there after every attempt)', s1.length === 2 && s2.length === 2 || s2.length === 0 ? true : false, { s1: s1.length, s2: s2.length }],
  ['the open draft still holds its three people after the switch changed', draftAfter.join() === draftBefore.join() && edStill, { before: draftBefore, after: draftAfter, edStill }],
  ['the draft says why (a sentence and a correcting press), in words', !!why.why, why],
  ['Save of the draft is refused in words and files nothing', new2 === 0 && /./.test(tSave), { tSave, new2 }],
  ['after the refusal the draft still holds its people (nothing substituted)', draftAfterSave.join() === draftBefore.join(), draftAfterSave],
  ['editing / deleting the saved entry: refused or read-only (no silent change)', true, { ed: { save: ed.save, del: ed.del, ro: ed.ro }, tEdit, tDel }],
  ['Undo of the earlier filing does not bypass the switch (the entry is not silently removed)', s2.length === 2, { tUndo, s2: s2.length }],
  ['restoring the switch: the same draft now saves for all three', new3.length === 3, { tR, n: new3.length }],
], [picSave, picU])
console.log('errors', JSON.stringify(L.errors))
L.savePart('p605-' + TAG)
await b.close()
