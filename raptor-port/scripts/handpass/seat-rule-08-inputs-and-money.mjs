/* RULES SWEEP 8 — (a) D45's first half through the board's own "+ INPUTS" door,
   which is the nearest thing to a pure availability change the board offers,
   and (b) the MONEY: what each kind of event actually pays (D28), read off the
   count chip's own tap, one mark per kind. */
import { open, board, tap, type, shot, publish, oilMode, openInputs, STATE } from './lib.mjs'
import { allChips, allSwitches, toast } from './seat-lib.mjs'
const di = 5
const { browser, page, errors } = await open({ state: STATE })
await board(page, di)
const sig = async (t) => { const s=await page.evaluate(i=>{const b=document.querySelector('#schedBoard')||document
  return {sign:[...b.querySelectorAll(`[data-sign][data-signday="${i}"]`)].filter(e=>e.offsetParent!==null).map(e=>`${e.dataset.sign}=${e.value||'—'}`),
   al:[...b.querySelectorAll('[data-alpub],.alchip')].filter(e=>e.offsetParent!==null).map(e=>(e.innerText||'').replace(/\s+/g,' ').trim()).filter(Boolean)}},di)
  console.log(t, JSON.stringify(s)); return s }
const signAll = async () => { const s=page.locator(`#schedBoard [data-sign][data-signday="${di}"]`); const n=await s.count()
  for(let i=0;i<n;i++){const o=await s.nth(i).locator('option').evaluateAll(x=>x.map(y=>y.value).filter(Boolean))
    if(o.length) await s.nth(i).selectOption(o[Math.min(i,o.length-1)]); await page.waitForTimeout(150)} await page.waitForTimeout(450) }
async function dropPH(key){ const box=await page.evaluate(k=>{const b=document.querySelector('#schedBoard')
    const z=[...b.querySelectorAll(`[data-fill="${k}"]`)].find(e=>e.offsetParent!==null); if(!z)return null
    z.scrollIntoView({block:'center'}); const r=z.getBoundingClientRect()
    const p=[...z.querySelectorAll('[data-person]')].map(x=>x.getBoundingClientRect())
    const off=p.length?Math.max(...p.map(x=>x.right))-r.left:0
    return {x:r.left+Math.min(off+8,r.width-4),y:r.top+r.height/2}},key)
  if(!box)return 'NO ZONE'; await page.mouse.click(box.x,box.y); await page.waitForTimeout(280)
  if(!await page.evaluate(()=>(window.ARM&&window.ARM.key)||null))return 'NOT ARMED'
  const p=page.locator('#sbRoster .rpuck[data-person="allavail"]:visible').first()
  if(!await p.count()){await page.keyboard.press('Escape');return 'NOT OFFERED'}
  await p.click(); await page.waitForTimeout(550); await page.keyboard.press('Escape'); return 'dropped' }

/* ---- (b) THE MONEY FIRST, on the draft: what each kind pays --------------- */
console.log('=== placeholders on one of every kind, then read what each pays ===')
for (const k of [`d:${di}.0.0.+`, `g:${di}.0.+`, `a:${di}.1.+`, `s:${di}.oft.0.+`, `s:${di}.amt.1.+`])
  console.log(' ', k, '->', await dropPH(k))
const chips = await allChips(page)
console.log('\nCHIPS (mode off):'); for (const c of chips) console.log(' ', c.txt, '|', c.title)
console.log('\nWHAT EACH ONE PAYS (the chip\'s own tap):')
for (let i=0;i<chips.length;i++) {
  await tap(page, '.oilcount', i); await page.waitForTimeout(600)
  const said = await toast(page)
  console.log(` [${chips[i].txt}] ->`, (said||'(nothing)').slice(0,150))
}
await shot(page, 'RULE-08-money-per-kind')

/* ---- D42: the overnight AVALON desk rows (19:00-07:00) ------------------- */
console.log('\n=== D42 — an overnight row earns the day it sits on ===')
console.log('the AVALON desk rows:', await page.evaluate(i=>JSON.stringify(window.DAYS[i].dutywaves[1].rows.map(r=>`${r.role} ${r.str}-${r.end} ${r.id||'(empty)'}`)), di))
console.log('put a placeholder on the overnight OPS O row ->', await dropPH(`d:${di}.1.1.+`))
const c2 = await allChips(page)
console.log('chips now:'); for (const c of c2) console.log(' ', c.txt, '|', c.title.slice(0,70))
await board(page, 6)
console.log('\nSUNDAY (day 6) chips — nothing may come from Saturday\'s overnight row:')
for (const c of await allChips(page)) console.log(' ', c.txt, '|', c.title.slice(0,70))
console.log('Sunday duty rows:', await page.evaluate(i=>JSON.stringify((window.DAYS[i].dutywaves||[]).map(b=>b.label)), 6))
await shot(page, 'RULE-08-sunday')

/* ---- (a) D45's first half through the board's + INPUTS door -------------- */
console.log('\n=== D45 first half — a request filed on a published day ===')
await board(page, di)
await signAll(); console.log('PUBLISH ->', JSON.stringify(await publish(page, di)))
await tap(page, `[data-gradd="${di}"]`); await page.waitForTimeout(500)
const gi = await page.evaluate(i=>window.DAYS[i].ground.length-1, di)
await type(page, `[data-bfld="gr:${di}.${gi}.prog"]`, 'AL1 ROW'); await page.waitForTimeout(400)
await signAll(); const s1 = await sig('AL signed:')
console.log('chips before:', JSON.stringify((await allChips(page)).map(c=>c.txt)))
await openInputs(page, di)
const door = await page.locator(`#schedBoard [data-inpadd="${di}.g"]:visible`).count()
console.log('+ INPUTS door present?', door)
if (door) {
  await tap(page, `[data-inpadd="${di}.g"]`); await page.waitForTimeout(700)
  await shot(page, 'RULE-08-input-form')
  const form = await page.evaluate(()=>{const r=document.querySelector('.sheet,[role=dialog],.modal')||document
    return { fields:[...r.querySelectorAll('input,select,textarea')].filter(e=>e.offsetParent!==null)
      .map(e=>({tag:e.tagName,d:JSON.stringify(e.dataset),ph:e.placeholder||'',opts:e.tagName==='SELECT'?[...e.options].map(o=>o.value).slice(0,10):undefined})).slice(0,12),
      btns:[...r.querySelectorAll('button')].filter(e=>e.offsetParent!==null).map(e=>(e.innerText||'').trim()).slice(0,14) }})
  console.log('the form offers:', JSON.stringify(form).slice(0,900))
}
console.log('\nerrors:', errors.slice(0,8))
await browser.close()
