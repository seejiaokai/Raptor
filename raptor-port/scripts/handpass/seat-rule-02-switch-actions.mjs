/* RULES SWEEP 2 — what the switches DO. D24's "the admin can switch any of them
   on", OIL7, OIL28, OIL8, and [OIL-UNDO-WORDS]. */
import { open, board, tap, shot, oilMode, STATE } from './lib.mjs'
import { allSwitches, allPucks, toast } from './seat-lib.mjs'
const di = 5
const { browser, page, errors } = await open({ state: STATE })
await board(page, di)
await oilMode(page, true)

const sw = async () => Object.fromEntries((await allSwitches(page)).map(s=>[`${s.txt}|${s.item}`, s.state+' :: '+s.title.slice(0,60)]))
const pk = async () => { const o={}; for(const p of await allPucks(page)) (o[p.item]||=[]).push(`${p.cs}${p.on?'':'(OFF)'}`); return o }

const AV = 'r:rmubclmb23ywg2d'           // the AVALON flying line
const AVD = 'r:rmubclu980n6lyl'          // the AVALON duty desk SXO row (Saint)
const VIPER = 'r:rmubcl96zk43f8n'        // an ordinary flying line
const SCROW = 'r:rmubclgntiqurs0'        // the SC row with MAIN + SPARE

const tapItem = async (item) => { await tap(page, `[data-oilitem="${item}"]`); await page.waitForTimeout(500); return await toast(page) }
const tapPuck = async (who,item) => { await tap(page, `[data-oilp="${who}"][data-oilitem="${item}"]`); await page.waitForTimeout(500); return await toast(page) }

console.log('--- BEFORE ---'); const b=await pk(); for(const k of [AV,AVD,VIPER,SCROW]) console.log(' ',k,'->',(b[k]||[]).join(', '))

console.log('\n=== D24: switch the AVALON LINE on ==='); console.log('said:', await tapItem(AV))
let a=await pk(); console.log(' AV now ->', (a[AV]||[]).join(', '))
console.log(' switch now:', (await allSwitches(page)).filter(s=>s.item===AV).map(s=>s.state+' :: '+s.title).join(''))
await shot(page, 'RULE-02-avalon-switched-on')

console.log('\n=== D24: switch the AVALON DUTY DESK on ==='); console.log('said:', await tapItem(AVD))
a=await pk(); console.log(' AVD now ->', (a[AVD]||[]).join(', '))
console.log(' switch now:', (await allSwitches(page)).filter(s=>s.item===AVD).map(s=>s.state+' :: '+s.title).join(''))

console.log('\n=== OIL7: tap an ordinary line name to STOP it earning ==='); console.log('said:', await tapItem(VIPER))
a=await pk(); console.log(' VIPER now ->', (a[VIPER]||[]).join(', '))
console.log(' switch now:', (await allSwitches(page)).filter(s=>s.item===VIPER).map(s=>s.state+' :: '+s.title).join(''))
await shot(page, 'RULE-02-oil7-viper-off')

console.log('\n=== OIL7: a man added LATER to a switched-off item ===')
await oilMode(page, false)
const armed = await (async()=>{ await tap(page, `[data-slot="${di}.0.0.1.p"], [data-fill="${di}.0.0.1.p"]`); await page.waitForTimeout(200)
  return await page.evaluate(()=> (window.ARM&&window.ARM.key)||null) })()
console.log(' armed an empty VIPER seat?', armed)
if (armed) { const ids = await page.evaluate(()=>[...document.querySelectorAll('#sbRoster .rpuck[data-person]')].filter(e=>e.offsetParent!==null).map(e=>e.dataset.person).filter(v=>v!=='allavail'&&v!=='all'))
  if (ids.length) { await page.locator(`#sbRoster .rpuck[data-person="${ids[0]}"]:visible`).first().click(); await page.waitForTimeout(500); console.log(' added', ids[0]) } }
await page.keyboard.press('Escape')
await oilMode(page, true)
a=await pk(); console.log(' VIPER after the late add ->', (a[VIPER]||[]).join(', '))

console.log('\n=== OIL8: does a placeholder crowd open into real pucks? ===')
const crowds = await pk()
for (const [k,v] of Object.entries(crowds)) if (v.length > 5) console.log(' ', k, '->', v.length, 'pucks; first 5:', v.slice(0,5).join(', '))

console.log('\n=== OIL-UNDO-WORDS: what does Undo call it? ===')
const u = await page.evaluate(() => { const b=document.querySelector('#schedBoard')
  const btn=[...b.querySelectorAll('button')].find(x=>/Undo/i.test(x.innerText||''))
  return btn ? { txt:(btn.innerText||'').trim(), title:btn.title, disabled:btn.disabled } : 'NO UNDO BUTTON' })
console.log(' undo button:', JSON.stringify(u))
await shot(page, 'RULE-02-undo-label')
const hist = await page.evaluate(() => { const b=document.querySelector('#schedBoard')
  const h=[...b.querySelectorAll('button')].find(x=>/History/i.test(x.innerText||'')); if(h) h.click(); return !!h })
await page.waitForTimeout(900)
const rows = await page.evaluate(()=>[...document.querySelectorAll('.hist-row, .histrow, [class*=hist] li, .sheet li, .sheet tr')]
  .filter(e=>e.offsetParent!==null).map(e=>(e.innerText||'').replace(/\s+/g,' ').trim()).filter(Boolean).slice(0,14))
console.log(' History opened:', hist, '\n  ', rows.join('\n   '))
await shot(page, 'RULE-02-history')
console.log('\nerrors:', errors.slice(0,6))
await browser.close()
