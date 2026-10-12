// K5 - a day template. Wed holds the Meeting row (3 people); Wed saved as a template; applied to Thu 16 Jul.
import * as K from './or-K-lib.mjs'
const { fileInput, goWeek, shot, shotEl, readRows, inputsOf, reload, saveRes, errs, drag, rosterPuck, toast, toastMark, toastsSince, undoRedo } = K
const out = {}
const { ctx, page: p } = await K.openWorld({ fresh: false })
await K.hideToast(p)
const filed = await fileInput(p, { type: 'Meeting', people: ['Drifter', 'Hunter', 'Ranger'], from: K.ISO, to: K.ISO, timed: ['14:00', '15:00'], title: K.TITLE })
console.log('filed', JSON.stringify(filed))
await goWeek(p); await K.openFold(p, 'week')
const THU = 3
const tplMenu = async di => {
  const b = p.locator(`#eWeek .day[data-day="${di}"] [data-daytplopen="${di}"]:visible`).first()
  await b.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await b.click(); await p.waitForTimeout(500)
  return p.evaluate(() => { const m = [...document.querySelectorAll('.wavemenu')].pop(); return m ? m.innerText.replace(/\s+/g, ' ').trim() : '' })
}
const dayRows = di => p.evaluate(di => { const d = [...document.querySelectorAll('#eWeek .day:not(.peek)')][di]; return [...d.querySelectorAll('.sec-grnd .pl-row')].map(r => ({ name: r.querySelector('.nm .ntx')?.textContent.trim(), cls: r.className, who: [...r.querySelectorAll('.puck .nm')].map(n => n.textContent.trim()), times: [...r.querySelectorAll('.t')].map(e => e.textContent.trim()).join(' '), rmk: r.querySelector('.rmk')?.innerText.replace(/\s+/g, ' ').trim() })) }, di)
out.wedBefore = await dayRows(2); out.thuBefore = await dayRows(THU)
console.log('WED rows', JSON.stringify(out.wedBefore)); console.log('THU rows before', JSON.stringify(out.thuBefore))
const inp0 = await inputsOf(p); out.inputs0 = inp0
out.menuWed = await tplMenu(2); console.log('TEMPLATES MENU (Wed):', out.menuWed)
await shot(p, 'k5-1-template-menu-wed')
const mk = await toastMark(p)
await p.locator('.wavemenu [data-daytplsave]:visible').first().click(); await p.waitForTimeout(800)
out.saveToast = await toastsSince(p, mk); console.log('SAVE toast:', out.saveToast, '|', await toast(p))
const tname = ((out.saveToast.match(/"(.+?)"/) || [])[1]) || null
console.log('template name', tname)
await shot(p, 'k5-2-after-save')
const x = p.locator('#daytplClose:visible'); if (await x.count()) { await x.click(); await p.waitForTimeout(400) }
// apply to Thursday
out.menuThu = await tplMenu(THU); console.log('TEMPLATES MENU (Thu):', out.menuThu)
await shot(p, 'k5-3-template-menu-thu')
const picks = await p.locator('.wavemenu [data-daytplpick]:visible').evaluateAll(es => es.map(e => e.textContent.trim().slice(0, 60)))
console.log('picks', JSON.stringify(picks))
const mk2 = await toastMark(p)
const thuBeforeJson = await p.evaluate(() => JSON.stringify(window.DAYS[3]))
const toasts = []
for (let i = 0; i < 2; i++) {
  if (i > 0) await tplMenu(THU)
  await p.locator('.wavemenu [data-daytplpick]:visible').filter({ hasText: tname || 'Template' }).first().click(); await p.waitForTimeout(900)
  toasts.push(await toastsSince(p, mk2))
  const changed = (await p.evaluate(() => JSON.stringify(window.DAYS[3]))) !== thuBeforeJson
  // a confirm sheet?
  const dlg = await p.evaluate(() => [...document.querySelectorAll('button')].filter(b => b.offsetParent && /apply|replace|yes|confirm|overwrite|use this/i.test(b.textContent)).map(b => b.textContent.trim().slice(0, 40)))
  console.log('pick', i, 'changed', changed, 'toasts', toasts[i], 'dialog buttons', JSON.stringify(dlg))
  await shot(p, 'k5-4-after-pick-' + i)
  if (changed) break
  if (dlg.length) { await p.evaluate(() => { const b = [...document.querySelectorAll('button')].filter(b => b.offsetParent && /apply|replace|yes|confirm|overwrite|use this/i.test(b.textContent))[0]; b.click() }); await p.waitForTimeout(900); toasts.push(await toastsSince(p, mk2)); if ((await p.evaluate(() => JSON.stringify(window.DAYS[3]))) !== thuBeforeJson) break }
}
out.applyToasts = toasts
const xx = p.locator('#daytplClose:visible'); if (await xx.count()) { await xx.click(); await p.waitForTimeout(400) }
await goWeek(p); await K.openFold(p, 'week')
out.thuAfter = await dayRows(THU); out.wedAfter = await dayRows(2)
console.log('THU rows after', JSON.stringify(out.thuAfter)); console.log('WED rows after', JSON.stringify(out.wedAfter))
out.inputs1 = await inputsOf(p); console.log('INPUTS after apply', JSON.stringify(out.inputs1))
out.inputsAll = await p.evaluate(() => window.INPUTS.filter(r => /range brief/i.test(r.title || '')).length)
console.log('number of input records titled Range brief:', out.inputsAll)
// the blue input mark: what the Wed and Thu rows wear
out.marks = await p.evaluate(() => [2, 3].map(di => { const d = [...document.querySelectorAll('#eWeek .day:not(.peek)')][di]; return [...d.querySelectorAll('.sec-grnd .pl-row')].filter(r => /range brief/i.test(r.querySelector('.nm .ntx')?.textContent || '')).map(r => { const nm = r.querySelector('.nm'); const cs = getComputedStyle(r); return { di, cls: r.className, borderLeft: cs.borderLeftColor + ' ' + cs.borderLeftWidth, boxShadow: cs.boxShadow.slice(0, 60), nmBefore: getComputedStyle(nm, '::before').content, bg: cs.backgroundColor } }) }))
console.log('MARKS', JSON.stringify(out.marks))
await K.scrollToSec(p, 'ground', 3); await K.hideToast(p)
await shotEl(p.locator('#eWeek .day:not(.peek) [data-secmove="3.ground"]').first(), 'k5-5-thu-ground')
await K.scrollToSec(p, 'ground', 2); await K.hideToast(p)
await shotEl(p.locator('#eWeek .day:not(.peek) [data-secmove="2.ground"]').first(), 'k5-6-wed-ground')
// a hand on the template's row on Thursday: Tally dropped on its "+ add", and a start time typed
const thuIdx = await p.evaluate(() => { const d = [...document.querySelectorAll('#eWeek .day:not(.peek)')][3]; return [...d.querySelectorAll('.sec-grnd .pl-row')].findIndex(r => /range brief/i.test(r.querySelector('.nm .ntx')?.textContent || '')) })
console.log('Thursday template row index', thuIdx)
if (thuIdx >= 0) {
  const row = p.locator('#eWeek .day:not(.peek)').nth(3).locator('.sec-grnd .pl-row').nth(thuIdx)
  const mk3 = await toastMark(p)
  await K.scrollToSec(p, 'ground', 3)
  await drag(p, await rosterPuck(p, 'Tally'), row.locator('.addz').first())
  out.handToast = await toastsSince(p, mk3); console.log('HAND (Tally on Thursday row) toast:', out.handToast)
  out.thuAfterHand = await dayRows(THU); console.log('THU rows after hand', JSON.stringify(out.thuAfterHand))
  out.inputs2 = await inputsOf(p); console.log('INPUTS after hand', JSON.stringify(out.inputs2))
  await K.scrollToSec(p, 'ground', 3); await K.hideToast(p)
  await shotEl(p.locator('#eWeek .day:not(.peek) [data-secmove="3.ground"]').first(), 'k5-7-thu-after-hand')
  out.wedAfterHand = await dayRows(2); console.log('WED rows after hand', JSON.stringify(out.wedAfterHand))
}
const u = await undoRedo(p, 'undo'); out.undoAfterHand = { u, thu: await dayRows(THU), inputs: await inputsOf(p) }; console.log('UNDO', JSON.stringify(out.undoAfterHand))
await reload(p); await goWeek(p); await K.openFold(p, 'week')
out.reload = { thu: await dayRows(THU), wed: await dayRows(2), inputs: await inputsOf(p) }; console.log('RELOAD', JSON.stringify(out.reload))
out.errs = errs.slice(); saveRes('k5', out); console.log('ERRS', JSON.stringify(errs))
await ctx.close(); await K.browser.close()
