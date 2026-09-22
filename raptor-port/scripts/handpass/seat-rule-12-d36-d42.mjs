/* RULES SWEEP 12 — D36 (the crowd's window stays NARROW — step to dekit — and
   never borrows the flying rules' wider report→debrief window) and D42 (an
   overnight row earns the day it SITS ON; the day the hours spill into earns
   nothing from it). */
import { open, board, tap, type, shot, STATE } from './lib.mjs'
import { allChips, toast } from './seat-lib.mjs'
const di = 5
const { browser, page, errors } = await open({ state: STATE })
await board(page, di)
async function dropPH(key) {
  const box=await page.evaluate(k=>{const b=document.querySelector('#schedBoard')
    const z=[...b.querySelectorAll(`[data-fill="${k}"]`)].find(e=>e.offsetParent!==null); if(!z)return null
    z.scrollIntoView({block:'center'}); const r=z.getBoundingClientRect()
    const p=[...z.querySelectorAll('[data-person]')].map(x=>x.getBoundingClientRect())
    const off=p.length?Math.max(...p.map(x=>x.right))-r.left:0
    return {x:r.left+Math.min(off+8,r.width-4),y:r.top+r.height/2}},key)
  if(!box)return 'NO ZONE'; await page.mouse.click(box.x,box.y); await page.waitForTimeout(280)
  if(!await page.evaluate(()=>(window.ARM&&window.ARM.key)||null))return 'NOT ARMED'
  const p=page.locator('#sbRoster .rpuck[data-person="allavail"]:visible').first()
  if(!await p.count()){await page.keyboard.press('Escape');return 'NOT OFFERED'}
  await p.click(); await page.waitForTimeout(600); await page.keyboard.press('Escape'); return 'dropped' }
const chipTap = async (i) => { await tap(page, '.oilcount', i); await page.waitForTimeout(600); return await toast(page) }

/* VIPER flies 10:00–11:00 with Ranger + Echo. Its REPORT starts 07:00 and its
   DEBRIEF ends 13:00; its step-to-dekit window is roughly 09:00–11:30. */
console.log('VIPER:', await page.evaluate(i=>JSON.stringify(window.DAYS[i].waves[0].formations[0]).slice(0,200), di))
console.log('\n=== D36 — a row at 07:30–08:00, inside the REPORT padding, outside step-to-dekit ===')
await tap(page, `[data-gradd="${di}"]`); await page.waitForTimeout(600)
let gi = await page.evaluate(i=>window.DAYS[i].ground.length-1, di)
await type(page, `[data-bfld="gr:${di}.${gi}.prog"]`, 'EARLY BRIEF')
await type(page, `[data-bfld="gr:${di}.${gi}.str"]`, '07:30')
await type(page, `[data-bfld="gr:${di}.${gi}.end"]`, '08:00')
console.log('placeholder ->', await dropPH(`g:${di}.${gi}.+`))
let chips = await allChips(page)
const iEarly = chips.length - 1
console.log('EARLY BRIEF chip:', JSON.stringify(chips[iEarly]))
const saidEarly = await chipTap(iEarly)
console.log('its crowd:', (saidEarly||'').slice(0,400))
console.log('  Ranger in it?', /Ranger/.test(saidEarly||''), '| Echo in it?', /Echo/.test(saidEarly||''))
await shot(page, 'RULE-12-d36-early')

/* the control: a row at 10:15–10:30, INSIDE the flight — the crew must be out */
await tap(page, `[data-gradd="${di}"]`); await page.waitForTimeout(600)
gi = await page.evaluate(i=>window.DAYS[i].ground.length-1, di)
await type(page, `[data-bfld="gr:${di}.${gi}.prog"]`, 'MID BRIEF')
await type(page, `[data-bfld="gr:${di}.${gi}.str"]`, '10:15')
await type(page, `[data-bfld="gr:${di}.${gi}.end"]`, '10:30')
console.log('\nplaceholder ->', await dropPH(`g:${di}.${gi}.+`))
chips = await allChips(page)
const saidMid = await chipTap(chips.length-1)
console.log('MID BRIEF crowd:', (saidMid||'').slice(0,300))
console.log('  Ranger in it?', /Ranger/.test(saidMid||''), '| Echo in it?', /Echo/.test(saidMid||''))
await shot(page, 'RULE-12-d36-mid')

/* ---- D42 — a PLAIN (non-exempt) duty row running 19:00–07:00 ------------- */
console.log('\n=== D42 — a plain overnight duty row on the Saturday ===')
await tap(page, `[data-dradd="${di}.0"]`).catch(()=>{})
await page.waitForTimeout(600)
const rows = await page.evaluate(i=>window.DAYS[i].dutywaves[0].rows.length, di)
console.log('plain duty block rows now:', rows)
const r = rows-1
await type(page, `[data-bfld="dl:${di}.0.${r}.role"]`, 'NIGHT SDO').catch(()=>{})
await type(page, `[data-bfld="dl:${di}.0.${r}.str"]`, '19:00').catch(()=>{})
await type(page, `[data-bfld="dl:${di}.0.${r}.end"]`, '07:00').catch(()=>{})
await page.waitForTimeout(500)
console.log('the row now:', await page.evaluate(([i,rr])=>JSON.stringify(window.DAYS[i].dutywaves[0].rows[rr]), [di,r]))
console.log('placeholder ->', await dropPH(`d:${di}.0.${r}.+`))
chips = await allChips(page)
console.log('SATURDAY chips:'); for (const c of chips) console.log('  ', c.txt, '|', c.title.slice(0,64))
await shot(page, 'RULE-12-d42-saturday')
await board(page, 6)
console.log('SUNDAY chips:', JSON.stringify((await allChips(page)).map(c=>c.txt+' | '+c.title.slice(0,50))))
console.log('Sunday duty rows:', await page.evaluate(i=>JSON.stringify((window.DAYS[i].dutywaves||[]).map(b=>b.rows.map(x=>`${x.role} ${x.str}-${x.end}`))), 6))
await shot(page, 'RULE-12-d42-sunday')
console.log('\nerrors:', errors.slice(0,8))
await browser.close()
