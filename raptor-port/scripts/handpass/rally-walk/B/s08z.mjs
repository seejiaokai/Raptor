console.log('B s08z v3 (Logic page: change a box inside the page, then its buttons, phone)')
import { launch, open, sleep, shot, tap, rec, finish } from './lib.mjs'
const b = await launch()
const sel = '#page-logic [data-lgset="reportLead"]'
const editing = p => p.evaluate(() => { const bs = [...document.querySelectorAll('#page-logic button')].filter(x => x.offsetParent !== null).map(x => x.textContent.trim().slice(0, 14)); return { visibleButtons: bs.slice(0, 5), editMode: bs.includes('Done') } })
const st = p => p.evaluate(s => ({ box: document.querySelector(s)?.value, vconf: window.VCONF ? window.VCONF.reportLead : 'n/a' }), sel)
const start = async () => {
  const { ctx, p } = await open(b)
  await p.evaluate(() => window.go('logic')); await sleep(900)
  const e0 = await editing(p)
  await tap(p, p.locator('#page-logic button', { hasText: /Edit/ }).first()); await sleep(500)
  return { ctx, p, e0, e1: await editing(p) }
}
/* baseline: Edit then Done with nothing changed */
let { ctx, p, e0, e1 } = await start()
await tap(p, p.locator('#page-logic button:visible', { hasText: /^Done$/ }).first()); await sleep(500)
let e2 = await editing(p)
rec('L1', 'Logic baseline: tap Edit, then Done (nothing changed)', 'Done ends edit mode on one press', { notEditing: e0, editing: e1, afterDone: e2 }, e1.editMode && !e2.editMode ? 'PASS' : 'FAIL', await shot(p, 'B08z-L1'))
await ctx.close()
/* after a changed box */
;({ ctx, p, e0, e1 } = await start())
await tap(p, p.locator(sel)); await p.keyboard.press('Control+A'); await p.keyboard.type('2h30'); await sleep(150)
const s1 = await st(p)
await tap(p, p.locator('#page-logic button:visible', { hasText: /^Done$/ }).first()); await sleep(600)
e2 = await editing(p); const s2 = await st(p)
const pic2 = await shot(p, 'B08z-L2')
await tap(p, p.locator('#page-logic button:visible', { hasText: /^Done$/ }).first()).catch(() => {}); await sleep(500)
const e3 = await editing(p)
rec('L2', 'Logic: edit mode, change "Default rally before take-off" 3h to 2h30 (not left), press Done once', 'Done ends edit mode on the first press, value 2h30 kept (150)', { before: s1, afterFirstDone: { ...e2, ...s2 }, afterSecondDone: e3 }, !e2.editMode && s2.vconf === 150 ? 'PASS' : 'FAIL', pic2)
await ctx.close()
/* after a changed box, the Reset link under it */
;({ ctx, p, e0, e1 } = await start())
await tap(p, p.locator(sel)); await p.keyboard.press('Control+A'); await p.keyboard.type('2h30'); await sleep(150)
const resetLink = p.locator('#page-logic [data-lgset="reportLead"]').locator('xpath=ancestor::*[contains(@class,"lg")][1]').locator('text=Reset').first()
const cnt = await p.locator('#page-logic', {}).getByText('Reset', { exact: true }).count()
await tap(p, p.locator('#page-logic').getByText('Reset', { exact: true }).first()); await sleep(600)
const s3 = await st(p)
rec('L3', 'Logic: change the box to 2h30 (not left), press the Reset link next to Standard 3h', 'one press: back to 3h (180)', { resetLinksVisible: cnt, after: s3 }, s3.vconf === 180 ? 'PASS' : 'FAIL', await shot(p, 'B08z-L3'))
await ctx.close()
await b.close()
await finish('s08z')
