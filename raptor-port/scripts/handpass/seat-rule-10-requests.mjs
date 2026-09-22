/* RULES SWEEP 10 — D46 (a placeholder is allowed on an accepted request row and
   credits by default, in the NAME BOX and the EXTRAS alike; taking the puck off
   takes the crediting with it) and D18 extended (the man who filed the request
   still answers for himself). */
import { open, board, tap, shot, oilMode, openInputs, STATE } from './lib.mjs'
import { allChips, allPucks, allSwitches, toast } from './seat-lib.mjs'
const di = 5
const { browser, page, errors } = await open({ state: STATE })
await board(page, di)
await openInputs(page, di)
const pk = async () => { const o={}; for(const p of await allPucks(page)) (o[p.item]||=[]).push(`${p.cs}${p.on?'':'(OFF)'}`); return o }
const zones = await page.evaluate(() => { const b=document.querySelector('#schedBoard')
  return [...b.querySelectorAll('[data-fill],[data-slot]')].filter(e=>e.offsetParent!==null)
    .map(e=>({k:e.dataset.fill||e.dataset.slot, holds:[...e.querySelectorAll('[data-person]')].map(x=>x.dataset.person).join(',')}))
    .filter(z=>/^(g|a):/.test(z.k)) })
console.log('ground / programme zones:', JSON.stringify(zones))
/* which ground rows came from a request? */
const req = await page.evaluate(i => window.DAYS[i].ground.map((g,ix)=>({ix, prog:g.prog, who:g.who, fromInput:!!(g.inp||g.iid||g.acc)})), di)
console.log('ground rows:', JSON.stringify(req))

async function dropAt(key, who='allavail') {
  const box=await page.evaluate(k=>{const b=document.querySelector('#schedBoard')
    const z=[...b.querySelectorAll(`[data-fill="${k}"],[data-slot="${k}"]`)].find(e=>e.offsetParent!==null); if(!z)return null
    z.scrollIntoView({block:'center'}); const r=z.getBoundingClientRect()
    const p=[...z.querySelectorAll('[data-person]')].map(x=>x.getBoundingClientRect())
    const off=p.length?Math.max(...p.map(x=>x.right))-r.left:0
    return {x:r.left+Math.min(off+8,r.width-4),y:r.top+r.height/2}},key)
  if(!box) return 'NO ZONE'
  await page.mouse.click(box.x,box.y); await page.waitForTimeout(280)
  const a=await page.evaluate(()=>(window.ARM&&window.ARM.key)||null); if(!a) return 'NOT ARMED'
  const p=page.locator(`#sbRoster .rpuck[data-person="${who}"]:visible`).first()
  if(!await p.count()){await page.keyboard.press('Escape');return 'NOT OFFERED'}
  await p.click(); await page.waitForTimeout(600); const said=await toast(page); await page.keyboard.press('Escape')
  const holds=await page.evaluate(k=>{const b=document.querySelector('#schedBoard')
    const z=[...b.querySelectorAll(`[data-fill="${k}"],[data-slot="${k}"]`)].find(e=>e.offsetParent!==null)
    return z?[...z.querySelectorAll('[data-person]')].map(e=>e.dataset.person):[]},key)
  return `holds=[${holds}] SAID: ${said||'-'}` }

/* TRAINING is row 2 (Talisman, an accepted request); its NAME BOX is g:5.2, its extras g:5.2.+ */
console.log('\n=== D46 — a placeholder on an accepted request row ===')
console.log(' extras g:5.2.+ ->', await dropAt(`g:${di}.2.+`))
const c1 = await allChips(page); console.log(' chips:', JSON.stringify(c1.map(c=>c.txt+' | '+c.title.slice(0,60))))
await shot(page, 'RULE-10-request-extras')
await oilMode(page, true)
const p1 = await pk()
for (const [k,v] of Object.entries(p1)) if (/^i:/.test(k) || v.length>3) console.log('  crowd', k, '->', v.length, ':', v.slice(0,4).join(', '), v.length>4?'...':'')
console.log('\n=== D18 extended — the man who filed it answers for himself ===')
for (const [k,v] of Object.entries(p1)) if (/^i:/.test(k)) console.log('  request', k, '->', v.join(', '))
const sws = (await allSwitches(page)).filter(s=>/TRAINING|MEETING|DUTY|Training|Meeting|Duty/.test(s.txt))
console.log('  request-row switches:'); for (const s of sws) console.log('   ', JSON.stringify(s))
await shot(page, 'RULE-10-request-mode')
await oilMode(page, false)

/* take the puck off again — the crediting must go with it */
console.log('\n=== taking the placeholder off again ===')
const removed = await page.evaluate(k=>{ const b=document.querySelector('#schedBoard')
  const z=[...b.querySelectorAll(`[data-fill="${k}"]`)].find(e=>e.offsetParent!==null); if(!z) return 'NO ZONE'
  const p=[...z.querySelectorAll('[data-person="allavail"]')].pop(); if(!p) return 'NO PLACEHOLDER'
  const x=p.querySelector('.x,.rm,[data-del]'); if(x){x.click(); return 'clicked its ✕'}
  const ev=new MouseEvent('contextmenu',{bubbles:true}); p.dispatchEvent(ev); return 'right-clicked it' }, `g:${di}.2.+`)
console.log(' ', removed); await page.waitForTimeout(800)
const c2 = await allChips(page)
console.log(' chips after:', JSON.stringify(c2.map(c=>c.txt)))
console.log(' the row now holds:', await page.evaluate(k=>{const b=document.querySelector('#schedBoard')
  const z=[...b.querySelectorAll(`[data-fill="${k}"]`)].find(e=>e.offsetParent!==null)
  return z?[...z.querySelectorAll('[data-person]')].map(e=>e.dataset.person):[]}, `g:${di}.2.+`))
await shot(page, 'RULE-10-after-removal')
console.log('\nerrors:', errors.slice(0,8))
await browser.close()
