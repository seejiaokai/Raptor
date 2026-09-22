/* RULES SWEEP 9 — D33/D47 at EVERY door (board, edit week, phone), D31 in plain
   words (a row the app has not saved yet), and D36's narrow window. */
import { open, board, tap, type, shot, go, oilMode, closeBoard, STATE } from './lib.mjs'
import { allSwitches, allChips, toast } from './seat-lib.mjs'
const di = 5
const { browser, page, errors } = await open({ state: STATE })

/* ---- D33/D47 on the BOARD (desktop) -------------------------------------- */
await board(page, di)
const tryPH = async (key, where) => {
  await tap(page, `[data-slot="${key}"], [data-fill="${key}"]`); await page.waitForTimeout(250)
  const armed = await page.evaluate(()=>(window.ARM&&window.ARM.key)||null)
  const offered = await page.locator('#sbRoster .rpuck[data-person="allavail"]:visible').count()
  let said=null, took=null
  if (armed && offered) { await page.locator('#sbRoster .rpuck[data-person="allavail"]:visible').first().click(); await page.waitForTimeout(500)
    said = await toast(page)
    took = await page.evaluate(k=>{const b=document.querySelector('#schedBoard')
      const h=b.querySelector(`[data-slot="${k}"]`)||b.querySelector(`[data-fill="${k}"]`)
      return h?[...h.querySelectorAll('[data-person]')].map(e=>e.dataset.person):[]},key) }
  await page.keyboard.press('Escape')
  console.log(` ${where} ${key}: armed=${armed} placeholderOffered=${offered} took=${JSON.stringify(took)} SAID: ${said||'(nothing)'}`)
  return { armed, offered, said, took }
}
console.log('=== D33/D47 — the placeholder at a COCKPIT seat, and at a legal seat ===')
await tryPH(`${di}.1.0.1.p`, 'BOARD  cockpit (SC MAIN empty)')
await tryPH(`${di}.1.0.3.w`, 'BOARD  cockpit (SC SPARE empty)')
await tryPH(`d:${di}.1.2.+`, 'BOARD  duty desk (legal)')
await shot(page, 'RULE-09-board-doors')

/* ---- D31 in plain words: a row the app has not saved yet ------------------ */
console.log('\n=== D31 in plain words — a row that has no id yet ===')
await oilMode(page, true)
const before = (await allSwitches(page)).length
await oilMode(page, false)
await tap(page, `[data-gradd="${di}"]`); await page.waitForTimeout(700)
await oilMode(page, true)
const after = await allSwitches(page)
console.log('switches before the new row:', before, '| after:', after.length)
const unsaved = after.filter(s=>/not been saved/i.test(s.title))
console.log('rows saying "not saved yet":', JSON.stringify(unsaved))
console.log('the new row\'s switch:', JSON.stringify(after[after.length-1]))
console.log('did the new row get an id?', await page.evaluate(i=>{const g=window.DAYS[i].ground; return !!g[g.length-1].rid}, di))
await shot(page, 'RULE-09-new-row-switch')
await oilMode(page, false)

/* ---- D33/D47 on the PHONE ------------------------------------------------ */
console.log('\n=== D33/D47 at PHONE width ===')
await page.setViewportSize({ width: 390, height: 844 }); await page.waitForTimeout(1000)
await shot(page, 'RULE-09-phone-board')
await tryPH(`${di}.1.0.1.p`, 'PHONE  cockpit')
await tryPH(`d:${di}.1.2.+`, 'PHONE  duty desk (legal)')
const phoneOil = await page.locator(`[data-oilmode="${di}"]`).count()
console.log('phone OIL door present?', phoneOil)
if (phoneOil) { await page.locator(`[data-oilmode="${di}"]`).first().click(); await page.waitForTimeout(900)
  console.log('phone switches:', (await allSwitches(page)).length, '| phone chips:', (await allChips(page)).length)
  await shot(page, 'RULE-09-phone-mode-on') }

/* ---- D33/D47 on the EDIT WEEK -------------------------------------------- */
console.log('\n=== D33/D47 on the EDIT WEEK ===')
await page.setViewportSize({ width: 1440, height: 900 }); await page.waitForTimeout(800)
await closeBoard(page); await go(page, 'editsched'); await page.waitForTimeout(900)
const weekTry = async (key) => {
  const el = page.locator(`#eWeek [data-slot="${key}"]:visible, [data-slot="${key}"]:visible`).first()
  if (!await el.count()) return 'NO SUCH SEAT ON THE WEEK'
  await el.evaluate(e=>e.scrollIntoView({block:'center',inline:'center'})); await page.waitForTimeout(200)
  await el.click({force:true}); await page.waitForTimeout(350)
  const armed = await page.evaluate(()=>(window.ARM&&window.ARM.key)||null)
  const offered = await page.locator('#eRoster .rpuck[data-person="allavail"]:visible').count()
  let said=null, took=null
  if (armed && offered) { await page.locator('#eRoster .rpuck[data-person="allavail"]:visible').first().click(); await page.waitForTimeout(500)
    said=await toast(page)
    took=await page.evaluate(k=>{const h=document.querySelector(`[data-slot="${k}"]`);return h?[...h.querySelectorAll('[data-person]')].map(e=>e.dataset.person):[]},key) }
  await page.keyboard.press('Escape')
  return `armed=${armed} offered=${offered} took=${JSON.stringify(took)} SAID: ${said||'(nothing)'}` }
console.log(' WEEK cockpit:', await weekTry(`${di}.1.0.1.p`))
console.log(' WEEK duty desk:', await weekTry(`d:${di}.1.2`))
await shot(page, 'RULE-09-week-doors')
console.log('\nerrors:', errors.slice(0,8))
await browser.close()
