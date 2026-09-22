/* RULES SWEEP 7b — D45 where a live signature actually exists: publishing
   consumes the signatures, so the one to test is the AMENDMENT's. Publish,
   raise an amendment, sign it, THEN change availability and an OIL decision. */
import { open, board, tap, type, shot, publish, oilMode, STATE } from './lib.mjs'
import { allChips, allSwitches, toast } from './seat-lib.mjs'
const di = 5
const { browser, page, errors } = await open({ state: STATE })
await board(page, di)
const sig = async (tag) => { const s = await page.evaluate(i=>{const b=document.querySelector('#schedBoard')||document
  return { sign:[...b.querySelectorAll(`[data-sign][data-signday="${i}"]`)].filter(e=>e.offsetParent!==null).map(e=>`${e.dataset.sign}=${e.value||'—'}`),
    ver:[...b.querySelectorAll('.verchip')].filter(e=>e.offsetParent!==null).map(e=>(e.innerText||'').trim()),
    al:[...b.querySelectorAll('[data-alpub],[data-alc],.alchip')].filter(e=>e.offsetParent!==null).map(e=>(e.innerText||'').replace(/\s+/g,' ').trim()).filter(Boolean) }}, di)
  console.log(tag, JSON.stringify(s)); return s }
const signAll = async () => { const s=page.locator(`#schedBoard [data-sign][data-signday="${di}"]`); const n=await s.count()
  for(let i=0;i<n;i++){const o=await s.nth(i).locator('option').evaluateAll(x=>x.map(y=>y.value).filter(Boolean))
    if(o.length) await s.nth(i).selectOption(o[Math.min(i,o.length-1)]); await page.waitForTimeout(160)} await page.waitForTimeout(500) }
async function dropOn(key, who) {
  const box=await page.evaluate(k=>{const b=document.querySelector('#schedBoard')
    const z=[...b.querySelectorAll(`[data-fill="${k}"]`)].find(e=>e.offsetParent!==null); if(!z)return null
    z.scrollIntoView({block:'center'}); const r=z.getBoundingClientRect()
    const p=[...z.querySelectorAll('[data-person]')].map(x=>x.getBoundingClientRect())
    const off=p.length?Math.max(...p.map(x=>x.right))-r.left:0
    return {x:r.left+Math.min(off+8,r.width-4),y:r.top+r.height/2}},key)
  if(!box) return 'NO ZONE'
  await page.mouse.click(box.x,box.y); await page.waitForTimeout(280)
  if(!await page.evaluate(()=>(window.ARM&&window.ARM.key)||null)) return 'NOT ARMED'
  const sel = who ? `#sbRoster .rpuck[data-person="${who}"]:visible` : '#sbRoster .rpuck[data-person="allavail"]:visible'
  const p=page.locator(sel).first(); if(!await p.count()){await page.keyboard.press('Escape');return 'NOT OFFERED'}
  await p.click(); await page.waitForTimeout(550); await page.keyboard.press('Escape'); return 'dropped'
}
console.log('placeholder on the SDO desk ->', await dropOn(`d:${di}.0.0.+`))
await signAll(); console.log('PUBLISH ->', JSON.stringify(await publish(page, di)))
await sig('after ORIG:')
/* raise an amendment and sign it */
await tap(page, `[data-gradd="${di}"]`); await page.waitForTimeout(600)
const gi = await page.evaluate(i=>window.DAYS[i].ground.length-1, di)
await type(page, `[data-bfld="gr:${di}.${gi}.prog"]`, 'RANGE DETAIL')
await type(page, `[data-bfld="gr:${di}.${gi}.str"]`, '08:00')
await type(page, `[data-bfld="gr:${di}.${gi}.end"]`, '18:00')
await page.waitForTimeout(600)
await signAll()
const s1 = await sig('AL SIGNED:')
await shot(page, 'RULE-07b-al-signed')
console.log('chips:', JSON.stringify((await allChips(page)).map(c=>c.txt)))

console.log('\n=== (a) an availability change while the AL is signed ===')
const who = await page.evaluate(()=>[...document.querySelectorAll('#sbRoster .rpuck[data-person]')].filter(e=>e.offsetParent!==null)
  .map(e=>e.dataset.person).filter(v=>v!=='allavail'&&v!=='all').slice(0,2))
for (const w of who) console.log('  put', w, '->', await dropOn(`g:${di}.${gi}.+`, w))
await page.waitForTimeout(900)
const s2 = await sig('AFTER:')
console.log('chips:', JSON.stringify((await allChips(page)).map(c=>c.txt)))
console.log('SIGNATURES SURVIVED THE AVAILABILITY CHANGE?', JSON.stringify(s1.sign)===JSON.stringify(s2.sign))
await shot(page, 'RULE-07b-after-availability')

console.log('\n=== (b) an OIL decision while the AL is signed ===')
await signAll(); const s3 = await sig('re-signed:')
await oilMode(page, true)
const sw = (await allSwitches(page)).find(s=>s.item && /SDO/.test(s.txt))
if (sw) { await tap(page, `[data-oilitem="${sw.item}"]`); await page.waitForTimeout(800); console.log('said:', await toast(page)) }
await oilMode(page, false); await page.waitForTimeout(900)
const s4 = await sig('AFTER THE OIL DECISION:')
console.log('SIGNATURES SURVIVED THE OIL DECISION?', JSON.stringify(s3.sign)===JSON.stringify(s4.sign))
await shot(page, 'RULE-07b-after-oil-decision')
console.log('\nerrors:', errors.slice(0,8))
await browser.close()
