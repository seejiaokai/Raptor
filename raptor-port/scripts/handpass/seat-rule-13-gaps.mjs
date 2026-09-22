/* RULES SWEEP 13 — the two gaps: the OTHER placeholder (ALL) at the cockpit
   doors, and D49's other half (a crewed line with NO readable times earns
   nothing and is NAMED beside the duty desks). */
import { open, board, tap, type, shot, oilMode, warnings, STATE } from './lib.mjs'
import { allSwitches, allPucks, toast } from './seat-lib.mjs'
const di = 5
const { browser, page, errors } = await open({ state: STATE })
await board(page, di)
const tryPH = async (key, who, where) => {
  await tap(page, `[data-slot="${key}"], [data-fill="${key}"]`); await page.waitForTimeout(250)
  const armed = await page.evaluate(()=>(window.ARM&&window.ARM.key)||null)
  const offered = await page.locator(`#sbRoster .rpuck[data-person="${who}"]:visible`).count()
  let said=null, took=null
  if (armed && offered) { await page.locator(`#sbRoster .rpuck[data-person="${who}"]:visible`).first().click(); await page.waitForTimeout(500)
    said=await toast(page)
    took=await page.evaluate(k=>{const b=document.querySelector('#schedBoard')
      const h=b.querySelector(`[data-slot="${k}"]`)||b.querySelector(`[data-fill="${k}"]`)
      return h?[...h.querySelectorAll('[data-person]')].map(e=>e.dataset.person):[]},key) }
  await page.keyboard.press('Escape')
  console.log(` ${where} [${who}] ${key}: armed=${!!armed} offered=${offered} took=${JSON.stringify(took)} SAID: ${said||'(nothing)'}`) }
console.log('=== the OTHER placeholder (ALL) ===')
await tryPH(`${di}.1.0.1.p`, 'all', 'cockpit  ')
await tryPH(`${di}.1.0.1.w`, 'all', 'cockpit  ')
await tryPH(`d:${di}.1.2.+`, 'all', 'duty desk')
await tryPH(`g:${di}.1.+`,  'all', 'ground   ')
await shot(page, 'RULE-13-all-placeholder')

console.log('\n=== D49 other half — a crewed line with NO readable times ===')
console.log('warnings before:', JSON.stringify((await warnings(page)).lines))
await type(page, `[data-bfld="ff:${di}.0.0.to"]`, '')
await type(page, `[data-bfld="ff:${di}.0.0.ld"]`, '')
await page.waitForTimeout(900)
console.log('VIPER now:', await page.evaluate(i=>{const f=window.DAYS[i].waves[0].formations[0];return `"${f.to}"-"${f.ld}" crew ${JSON.stringify(f.aircraft.map(a=>a.p+'/'+a.w))}`}, di))
const w = await warnings(page)
console.log('WARNINGS AFTER:', JSON.stringify(w, null, 1))
await shot(page, 'RULE-13-no-times')
await oilMode(page, true)
const sw = (await allSwitches(page)).filter(s=>/VIPER/.test(s.txt))
console.log('the line\'s switch:', JSON.stringify(sw))
const o={}; for(const p of await allPucks(page)) (o[p.item]||=[]).push(`${p.cs}${p.on?'':'(OFF)'}`)
console.log('its crew earning:', sw[0]&&sw[0].item ? (o[sw[0].item]||[]).join(', ')||'(NONE)' : '(no item — the switch is inert)')
await shot(page, 'RULE-13-no-times-mode')
console.log('\nerrors:', errors.slice(0,6))
await browser.close()
