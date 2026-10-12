// K4 - a saved plan. Meeting of three on Wed 15 Jul; "+ Alt Plan" saves the day as a plan; Tally added to the input
// from the schedule; the saved plan switched in. Real controls; INPUTS / DRAFTS only READ.
import * as K from './or-K-lib.mjs'
const { fileInput, goWeek, shot, shotEl, readRows, inputsOf, reload, saveRes, errs, drag, rowLoc, rosterPuck, toast, toastMark, toastsSince, undoRedo } = K
const out = {}
const { ctx, page: p } = await K.openWorld({ fresh: false })
await K.hideToast(p)
const filed = await fileInput(p, { type: 'Meeting', people: ['Drifter', 'Hunter', 'Ranger'], from: K.ISO, to: K.ISO, timed: ['14:00', '15:00'], title: K.TITLE })
console.log('filed', JSON.stringify(filed))
await goWeek(p); await K.openFold(p, 'week')
const rows0 = await readRows(p); out.before = rows0
console.log('BEFORE', JSON.stringify(rows0.weekGround.map(r => r.who)), JSON.stringify(rows0.weekInputs.map(r => r.who)))
const plans = () => p.evaluate(i => ({ list: (window.SCHED.drafts[i] || []).map(x => x.name + ':' + x.id), live: window.SCHED.curDraft ? window.SCHED.curDraft[i] : null }), K.DI)
const planMenu = async () => {
  const b = p.locator(`#eWeek [data-planmenu="${K.DI}"]:visible`).first()
  await b.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await b.click(); await p.waitForTimeout(500)
  return p.evaluate(() => { const m = [...document.querySelectorAll('.wavemenu')].pop(); return m ? { text: m.innerText.replace(/\s+/g, ' ').trim(), btns: [...m.querySelectorAll('button, .wm')].map(b => b.className + '|' + [...b.attributes].filter(a => /^data-/.test(a.name)).map(a => a.name + '=' + a.value).join(',') + '|' + b.textContent.trim().slice(0, 40)) } : null })
}
const m1 = await planMenu(); out.menu1 = m1; console.log('MENU1', JSON.stringify(m1))
await shot(p, 'k4-1-plan-menu-before')
await p.locator('.wavemenu .wm[data-plandup]:visible').first().click(); await p.waitForTimeout(800)
out.plansAfterSave = await plans(); console.log('PLANS after save', JSON.stringify(out.plansAfterSave), 'toast:', await toast(p))
out.inputsAfterSave = await inputsOf(p)
const rowsS = await readRows(p); console.log('AFTER SAVE', JSON.stringify(rowsS.weekGround.map(r => r.who)))
// add Tally to the input from the schedule: drag Tally's crew-list puck onto the row's "+ add"
await goWeek(p); await K.openFold(p, 'week'); await K.scrollToSec(p, 'ground'); await p.waitForTimeout(300)
const row = await rowLoc(p, 'weekG')
const mk = await toastMark(p)
await drag(p, await rosterPuck(p, 'Tally'), row.locator('.addz').first())
out.addToast = await toastsSince(p, mk); console.log('ADD toast:', out.addToast)
const rowsA = await readRows(p); out.afterAdd = rowsA
console.log('AFTER ADD', JSON.stringify(rowsA.weekGround.map(r => r.who)))
out.inputsAfterAdd = await inputsOf(p); console.log('INPUTS after add', JSON.stringify(out.inputsAfterAdd))
await K.scrollToSec(p, 'ground'); await K.hideToast(p)
await shotEl(p.locator('#eWeek .day:not(.peek) [data-secmove="2.ground"]').first(), 'k4-2-after-add-tally')
out.plansAfterAdd = await plans()
// switch the saved plan in
const m2 = await planMenu(); out.menu2 = m2; console.log('MENU2', JSON.stringify(m2))
await shot(p, 'k4-3-plan-menu-after-add')
const mk2 = await toastMark(p)
const sel = p.locator('.wavemenu .wm[data-plansel]:visible').first()
console.log('plansel count', await p.locator('.wavemenu .wm[data-plansel]:visible').count(), 'text', await sel.innerText().catch(() => ''))
await sel.click(); await p.waitForTimeout(900)
out.switchToast = await toastsSince(p, mk2); console.log('SWITCH toast:', out.switchToast, '| now:', await toast(p))
out.plansAfterSwitch = await plans()
await K.openFold(p, 'week')
const rowsB = await readRows(p); out.afterSwitch = rowsB
console.log('AFTER SWITCH', JSON.stringify(rowsB.weekGround.map(r => r.who)), JSON.stringify(rowsB.weekInputs.map(r => r.who)))
out.inputsAfterSwitch = await inputsOf(p); console.log('INPUTS after switch', JSON.stringify(out.inputsAfterSwitch))
await K.scrollToSec(p, 'ground'); await K.hideToast(p)
await shotEl(p.locator('#eWeek .day:not(.peek) [data-secmove="2.ground"]').first(), 'k4-4-after-switch-ground')
const ri = await p.locator('#eWeek .day:not(.peek) [data-secmove="2.inputs"]').count()
if (ri) await shotEl(p.locator('#eWeek .day:not(.peek) [data-secmove="2.inputs"]').first(), 'k4-5-after-switch-personal')
await shot(p, 'k4-6-page-after-switch')
// undo / redo of the switch, reload
const u = await undoRedo(p, 'undo'); const ru = await readRows(p); out.undo = { used: u.used, ok: u.ok, ground: ru.weekGround.map(r => r.who), inputs: await inputsOf(p), plans: await plans() }; console.log('UNDO', JSON.stringify(out.undo))
const r = await undoRedo(p, 'redo'); const rr = await readRows(p); out.redo = { used: r.used, ok: r.ok, ground: rr.weekGround.map(r => r.who), inputs: await inputsOf(p), plans: await plans() }; console.log('REDO', JSON.stringify(out.redo))
await reload(p); await goWeek(p); await K.openFold(p, 'week')
const rl = await readRows(p); out.reload = { ground: rl.weekGround.map(r => r.who), line: rl.weekInputs.map(r => r.who), inputs: await inputsOf(p), plans: await plans() }; console.log('RELOAD', JSON.stringify(out.reload))
out.errs = errs.slice(); saveRes('k4', out); console.log('ERRS', JSON.stringify(errs))
await ctx.close(); await K.browser.close()
