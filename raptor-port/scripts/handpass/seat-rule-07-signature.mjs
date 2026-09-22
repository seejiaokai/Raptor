/* RULES SWEEP 7 — D45 with a REAL signature on the day.
   Sign all four, publish, then (a) change availability and (b) change an OIL
   decision, reading the signatures after each. */
import { open, board, tap, type, shot, publish, oilMode, STATE } from './lib.mjs'
import { allChips, allSwitches, toast } from './seat-lib.mjs'
const di = 5
const { browser, page, errors } = await open({ state: STATE })
await board(page, di)
const sig = async (tag) => { const s = await page.evaluate(i => { const b=document.querySelector('#schedBoard')||document
  return { sign:[...b.querySelectorAll(`[data-sign][data-signday="${i}"]`)].filter(e=>e.offsetParent!==null).map(e=>`${e.dataset.sign}=${e.value||'—'}`),
    nys:[...b.querySelectorAll('.nysmark')].filter(e=>e.offsetParent!==null).length,
    ver:[...b.querySelectorAll('.verchip')].filter(e=>e.offsetParent!==null).map(e=>(e.innerText||'').trim()),
    al:[...b.querySelectorAll('[data-alpub],[data-alc],.alchip')].filter(e=>e.offsetParent!==null).map(e=>(e.innerText||'').replace(/\s+/g,' ').trim()).filter(Boolean) } }, di)
  console.log(tag, JSON.stringify(s)); return s }
async function dropPH(key) {
  const box = await page.evaluate(k=>{const b=document.querySelector('#schedBoard')
    const z=[...b.querySelectorAll(`[data-fill="${k}"]`)].find(e=>e.offsetParent!==null); if(!z)return null
    z.scrollIntoView({block:'center'}); const r=z.getBoundingClientRect()
    const p=[...z.querySelectorAll('[data-person]')].map(x=>x.getBoundingClientRect())
    const off=p.length?Math.max(...p.map(x=>x.right))-r.left:0
    return {x:r.left+Math.min(off+8,r.width-4),y:r.top+r.height/2}},key)
  if(!box) return 'NO ZONE'
  await page.mouse.click(box.x,box.y); await page.waitForTimeout(300)
  if(!await page.evaluate(()=>(window.ARM&&window.ARM.key)||null)) return 'NOT ARMED'
  const p=page.locator('#sbRoster .rpuck[data-person="allavail"]:visible').first()
  if(!await p.count()){await page.keyboard.press('Escape');return 'NOT OFFERED'}
  await p.click(); await page.waitForTimeout(600); await page.keyboard.press('Escape'); return 'dropped'
}
console.log('placeholder on the SDO desk ->', await dropPH(`d:${di}.0.0.+`))
/* SIGN, through the day's own sign strip */
const sels = page.locator(`#schedBoard [data-sign][data-signday="${di}"]`)
const n = await sels.count(); console.log('sign boxes on the day:', n)
for (let i=0;i<n;i++) { const o = await sels.nth(i).locator('option').evaluateAll(os=>os.map(x=>x.value).filter(Boolean))
  if (o.length) await sels.nth(i).selectOption(o[Math.min(i,o.length-1)]); await page.waitForTimeout(200) }
await page.waitForTimeout(600)
const s0 = await sig('SIGNED (before publish):')
await shot(page, 'RULE-07-signed')
console.log('PUBLISH ->', JSON.stringify(await publish(page, di)))
const s1 = await sig('AFTER PUBLISH:')
console.log('chips:', JSON.stringify((await allChips(page)).map(c=>c.txt+' | '+c.title.slice(0,50))))

/* (a) AVAILABILITY change */
console.log('\n=== (a) an availability change ===')
await tap(page, `[data-gradd="${di}"]`); await page.waitForTimeout(600)
const gi = await page.evaluate(i=>window.DAYS[i].ground.length-1, di)
await type(page, `[data-bfld="gr:${di}.${gi}.prog"]`, 'RANGE DETAIL')
await type(page, `[data-bfld="gr:${di}.${gi}.str"]`, '08:00')
await type(page, `[data-bfld="gr:${di}.${gi}.end"]`, '18:00')
const who = await page.evaluate(()=>[...document.querySelectorAll('#sbRoster .rpuck[data-person]')].filter(e=>e.offsetParent!==null)
  .map(e=>e.dataset.person).filter(v=>v!=='allavail'&&v!=='all').slice(0,3))
for (const w of who) { const box=await page.evaluate(k=>{const b=document.querySelector('#schedBoard')
    const z=[...b.querySelectorAll(`[data-fill="${k}"]`)].find(e=>e.offsetParent!==null); if(!z)return null
    z.scrollIntoView({block:'center'}); const r=z.getBoundingClientRect()
    const p=[...z.querySelectorAll('[data-person]')].map(x=>x.getBoundingClientRect())
    const off=p.length?Math.max(...p.map(x=>x.right))-r.left:0
    return {x:r.left+Math.min(off+8,r.width-4),y:r.top+r.height/2}}, `g:${di}.${gi}.+`)
  if(!box) continue
  await page.mouse.click(box.x,box.y); await page.waitForTimeout(250)
  const el=page.locator(`#sbRoster .rpuck[data-person="${w}"]:visible`).first()
  if(await el.count()){await el.click();await page.waitForTimeout(400)}
  await page.keyboard.press('Escape') }
await page.waitForTimeout(900)
const s2 = await sig('AFTER THE AVAILABILITY CHANGE:')
console.log('chips:', JSON.stringify((await allChips(page)).map(c=>c.txt)))
console.log('SIGNATURES SURVIVED?', JSON.stringify(s1.sign)===JSON.stringify(s2.sign))
console.log('the new row got an id (the freeze has something to hold)?',
  await page.evaluate(([i,g])=>!!window.DAYS[i].ground[g].rid, [di,gi]))
await shot(page, 'RULE-07-after-availability')

/* (b) OIL DECISION change */
console.log('\n=== (b) an OIL decision change ===')
await oilMode(page, true)
const sw = (await allSwitches(page)).find(s=>s.item && /SDO/.test(s.txt))
if (sw) { await tap(page, `[data-oilitem="${sw.item}"]`); await page.waitForTimeout(800); console.log('said:', await toast(page)) }
await oilMode(page, false); await page.waitForTimeout(800)
const s3 = await sig('AFTER THE OIL DECISION:')
console.log('SIGNATURES SURVIVED?', JSON.stringify(s2.sign)===JSON.stringify(s3.sign))
await shot(page, 'RULE-07-after-oil-decision')
console.log('\nerrors:', errors.slice(0,8))
await browser.close()
