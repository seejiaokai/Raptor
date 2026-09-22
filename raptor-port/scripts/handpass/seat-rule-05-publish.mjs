/* RULES SWEEP 5 — everything that only exists across the publish boundary:
   D44 (who was behind a puck is written down when the day is published),
   D44-the-tap (an issued page lists the men THAT page went out with),
   D44-the-mark (the day reads as pending when the crowd changes),
   D45 (availability never invalidates a signature; an OIL decision does),
   D37-which-answer on the issued page, and "no amendment nobody made". */
import { open, board, tap, type, shot, publish, signState, readDay, warnings, oilMode, STATE } from './lib.mjs'
import { allChips, toast } from './seat-lib.mjs'
const di = 5
const { browser, page, errors } = await open({ state: STATE })
await board(page, di)

/* which days already carry an issued copy? */
console.log('published days:', await page.evaluate(()=>{
  const S=window.SCHED||{}; return JSON.stringify(Object.keys(S).filter(k=>/appr|ver|pub/i.test(k)).slice(0,6)) }))
console.log('day 5 version before:', (await readDay(page, di)).version)

/* a crowd to freeze: a placeholder on the SDO duty desk */
async function dropPH(key) {
  const box = await page.evaluate(k => { const b=document.querySelector('#schedBoard')
    const z=[...b.querySelectorAll(`[data-fill="${k}"]`)].find(e=>e.offsetParent!==null); if(!z) return null
    z.scrollIntoView({block:'center'}); const r=z.getBoundingClientRect()
    const p=[...z.querySelectorAll('[data-person]')].map(x=>x.getBoundingClientRect())
    const off=p.length?Math.max(...p.map(x=>x.right))-r.left:0
    return {x:r.left+Math.min(off+8,r.width-4), y:r.top+r.height/2} }, key)
  if(!box) return 'NO ZONE'
  await page.mouse.click(box.x, box.y); await page.waitForTimeout(300)
  const a = await page.evaluate(()=>(window.ARM&&window.ARM.key)||null)
  if(!a) return 'NOT ARMED'
  const p=page.locator('#sbRoster .rpuck[data-person="allavail"]:visible').first()
  if(!await p.count()){await page.keyboard.press('Escape');return 'NOT OFFERED'}
  await p.click(); await page.waitForTimeout(600); await page.keyboard.press('Escape'); return 'dropped'
}
console.log('placeholder on the SDO duty desk ->', await dropPH(`d:${di}.0.0.+`))
const before = await allChips(page)
console.log('chips BEFORE publishing:'); for(const c of before) console.log(' ', JSON.stringify(c))
await shot(page, 'RULE-05-before-publish')

/* ---- PUBLISH ------------------------------------------------------------ */
const pub = await publish(page, di)
console.log('\nPUBLISH ->', JSON.stringify(pub))
console.log('sign state:', JSON.stringify(await signState(page, di)))
const after = await allChips(page)
console.log('chips AFTER publishing:'); for(const c of after) console.log(' ', JSON.stringify(c))
await shot(page, 'RULE-05-after-publish')
console.log('warnings after publish:', JSON.stringify((await warnings(page)).lines))

/* ---- THE ISSUED PAGE ---------------------------------------------------- */
console.log('\n=== the issued page ===')
await tap(page, `[data-planmenu="${di}"]`)
await page.waitForTimeout(700)
const pv = await page.evaluate(()=>[...document.querySelectorAll('[data-planpv]')].filter(e=>e.offsetParent!==null)
  .map(e=>({pv:e.dataset.planpv, txt:(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,60)})))
console.log('issued rows offered:', JSON.stringify(pv))
if (pv.length) {
  await page.locator(`[data-planpv="${pv[0].pv}"]:visible`).first().click()
  await page.waitForTimeout(1200)
  await shot(page, 'RULE-05-issued-page')
  const ic = await allChips(page)
  console.log('chips ON THE ISSUED PAGE:'); for(const c of ic) console.log(' ', JSON.stringify(c))
  if (ic.length) { await tap(page, '.oilcount'); await page.waitForTimeout(700)
    console.log('ISSUED TAP said:', await toast(page)); await shot(page, 'RULE-05-issued-tap') }
  /* back to the working copy */
  await tap(page, `[data-planmenu="${di}"]`); await page.waitForTimeout(700)
  const live = await page.evaluate(()=>{const e=[...document.querySelectorAll('[data-planpv],[data-draftgo],[data-golive]')].filter(x=>x.offsetParent!==null)
    .find(x=>/work|live|current/i.test(x.innerText||'')); if(e){e.click();return (e.innerText||'').trim()} return 'NO WORKING-COPY ROW'})
  console.log('back to:', live); await page.waitForTimeout(1200)
}
console.log('\nerrors:', errors.slice(0,8))
await page.context().storageState({ path: 'C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor/452c9a40-7b26-422e-9ca2-a0d0af9f90eb/scratchpad/state-published.json' })
await browser.close()
