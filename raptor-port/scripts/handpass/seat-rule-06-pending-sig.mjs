/* RULES SWEEP 6 — D44-the-mark and D45, on a PUBLISHED day.
   A change in availability must raise the pending mark and must NOT invalidate
   a signature. A changed OIL decision must invalidate it. */
import { open, board, tap, type, shot, publish, oilMode, warnings, STATE } from './lib.mjs'
import { allChips, allSwitches, toast } from './seat-lib.mjs'
const di = 5
const { browser, page, errors } = await open({ state: STATE })
await board(page, di)
async function dropPH(key) {
  const box = await page.evaluate(k => { const b=document.querySelector('#schedBoard')
    const z=[...b.querySelectorAll(`[data-fill="${k}"]`)].find(e=>e.offsetParent!==null); if(!z) return null
    z.scrollIntoView({block:'center'}); const r=z.getBoundingClientRect()
    const p=[...z.querySelectorAll('[data-person]')].map(x=>x.getBoundingClientRect())
    const off=p.length?Math.max(...p.map(x=>x.right))-r.left:0
    return {x:r.left+Math.min(off+8,r.width-4), y:r.top+r.height/2} }, key)
  if(!box) return 'NO ZONE'
  await page.mouse.click(box.x, box.y); await page.waitForTimeout(300)
  if(!await page.evaluate(()=>(window.ARM&&window.ARM.key)||null)) return 'NOT ARMED'
  const p=page.locator('#sbRoster .rpuck[data-person="allavail"]:visible').first()
  if(!await p.count()){await page.keyboard.press('Escape');return 'NOT OFFERED'}
  await p.click(); await page.waitForTimeout(600); await page.keyboard.press('Escape'); return 'dropped'
}
const state = async (tag) => { const s = await page.evaluate(i => {
  const b=document.querySelector('#schedBoard')||document
  const sel=[...b.querySelectorAll('[data-sign]')].filter(e=>e.offsetParent!==null).map(e=>`${e.dataset.sign}=${e.value||'—'}`)
  const nys=[...b.querySelectorAll('.nysmark')].filter(e=>e.offsetParent!==null).map(e=>(e.innerText||'').trim())
  const ver=[...b.querySelectorAll('.verchip,.dhver')].filter(e=>e.offsetParent!==null).map(e=>(e.innerText||'').replace(/\s+/g,' ').trim())
  const al=[...b.querySelectorAll('[data-alc],[data-alcount],.alchip,[data-alpub]')].filter(e=>e.offsetParent!==null).map(e=>(e.innerText||'').replace(/\s+/g,' ').trim()).filter(Boolean)
  return { signatures: sel, notYetSigned: nys, version: ver, amendment: al } }, di)
  console.log(tag, JSON.stringify(s)); return s }

console.log('placeholder on the SDO desk ->', await dropPH(`d:${di}.0.0.+`))
await state('BEFORE PUBLISH:')
console.log('PUBLISH ->', JSON.stringify(await publish(page, di)))
const signed = await state('AFTER PUBLISH:')
const chips0 = await allChips(page); console.log('chips:', JSON.stringify(chips0.map(c=>c.txt)))
await shot(page, 'RULE-06-published-signed')

/* ---- an AVAILABILITY change: put a man from the crowd on another event ---- */
console.log('\n=== AVAILABILITY CHANGE (a new ground row over the same hours) ===')
await tap(page, `[data-gradd="${di}"]`)
await page.waitForTimeout(600)
const gi = await page.evaluate(i=>window.DAYS[i].ground.length-1, di)
await type(page, `[data-bfld="gr:${di}.${gi}.prog"]`, 'RANGE DETAIL')
await type(page, `[data-bfld="gr:${di}.${gi}.str"]`, '08:00')
await type(page, `[data-bfld="gr:${di}.${gi}.end"]`, '18:00')
/* name three men who are in the SDO crowd */
const who = await page.evaluate(()=>[...document.querySelectorAll('#sbRoster .rpuck[data-person]')]
  .filter(e=>e.offsetParent!==null).map(e=>e.dataset.person).filter(v=>v!=='allavail'&&v!=='all').slice(0,3))
for (const w of who) { const box = await page.evaluate(k=>{const b=document.querySelector('#schedBoard')
    const z=[...b.querySelectorAll(`[data-fill="${k}"]`)].find(e=>e.offsetParent!==null); if(!z)return null
    z.scrollIntoView({block:'center'}); const r=z.getBoundingClientRect()
    const p=[...z.querySelectorAll('[data-person]')].map(x=>x.getBoundingClientRect())
    const off=p.length?Math.max(...p.map(x=>x.right))-r.left:0
    return {x:r.left+Math.min(off+8,r.width-4),y:r.top+r.height/2}}, `g:${di}.${gi}.+`)
  if(!box) continue
  await page.mouse.click(box.x, box.y); await page.waitForTimeout(250)
  const el=page.locator(`#sbRoster .rpuck[data-person="${w}"]:visible`).first()
  if(await el.count()){ await el.click(); await page.waitForTimeout(450) }
  await page.keyboard.press('Escape') }
await page.waitForTimeout(900)
console.log('put on the new row:', JSON.stringify(who))
const avail = await state('AFTER THE AVAILABILITY CHANGE:')
const chips1 = await allChips(page); console.log('chips:', JSON.stringify(chips1.map(c=>c.txt)))
console.log('warnings:', JSON.stringify((await warnings(page)).lines))
await shot(page, 'RULE-06-after-availability-change')
console.log('SIGNATURES SURVIVED?', JSON.stringify(signed.signatures) === JSON.stringify(avail.signatures))

/* ---- an OIL DECISION change ---------------------------------------------- */
console.log('\n=== OIL DECISION CHANGE ===')
await oilMode(page, true)
const sw = (await allSwitches(page)).find(s=>s.item && /SDO/.test(s.txt))
console.log('tapping the SDO switch:', JSON.stringify(sw))
if (sw) { await tap(page, `[data-oilitem="${sw.item}"]`); await page.waitForTimeout(700); console.log('said:', await toast(page)) }
await oilMode(page, false)
await page.waitForTimeout(600)
const oil = await state('AFTER THE OIL DECISION:')
console.log('SIGNATURES SURVIVED?', JSON.stringify(signed.signatures) === JSON.stringify(oil.signatures))
await shot(page, 'RULE-06-after-oil-decision')
console.log('\nerrors:', errors.slice(0,8))
await browser.close()
