/* X-18 (Undo half) — after a filing by Saber, a sign-out and a sign-in as Ranger: does Ranger's Undo (on the Inputs page,
   where it is drawn) carry Saber's step? And back as Saber? */
import * as H from './cal-H-lib.mjs'
H.setTag('x18b')
const { browser, page, errors } = await H.world({ plain: true })
const undo = () => page.evaluate(() => { const b = document.getElementById('undoBtn'), r = document.getElementById('redoBtn'); return b ? { title: b.title, disabled: b.disabled, redo: r && r.disabled } : null })
await H.inputsMonth(page, 2026, 7)
await H.fileShared(page, { iso: '2026-07-18', type: 'Duty', people: ['Ranger', 'Drifter'], remarks: 'X18b duty', answerOil: 'Yes' })
await H.sleep(1200)
const u0 = await undo(); const p0 = await H.pic(page, '1-saber-after-filing')
await H.signOut(page); await H.signIn(page, 'us', 'us')
await H.go(page, 'inputs'); await H.sleep(600)
const u1 = await undo(); const p1 = await H.pic(page, '2-ranger-inputs-page')
let pressed = null
if (u1 && !u1.disabled) { await page.click('#undoBtn'); await H.sleep(800); pressed = (await H.inputsNow(page)).filter(x => /X18b/.test(x.remarks)).length }
await H.signOut(page); await H.signIn(page, 'ad')
await H.go(page, 'inputs'); await H.sleep(600)
const u2 = await undo(); const p2 = await H.pic(page, '3-saber-back')
const left = (await H.inputsNow(page)).filter(x => /X18b/.test(x.remarks)).length
H.judge('X-18 (Undo)', 'Saber filed a group (Undo live); signed out; signed in as Ranger; read his Undo on the Inputs page; signed out; signed in as Saber; read Undo', [
  ['Undo was live for Saber after the filing', u0 && u0.disabled === false, u0],
  ['Ranger\'s Undo (Inputs page) is disabled — he did not inherit Saber\'s step', u1 && u1.disabled === true, u1],
  ['Saber\'s Undo is disabled again after returning (his history cleared at sign-out)', u2 && u2.disabled === true, u2],
  ['the group is still filed (3 records) after all that', left === 3, { left, pressedCount: pressed }],
], [p0, p1, p2])
H.save('x18b', { errors })
console.log(errors)
await browser.close()
