/* RULES SWEEP 2c — OIL7 done properly (switch the row OFF first, THEN add a
   man), OIL8 on a duty desk / a sim row / an extras line, and Undo walking an
   OIL decision back. */
import { open, board, tap, shot, oilMode, STATE } from './lib.mjs'
import { allSwitches, allPucks, toast } from './seat-lib.mjs'
const di = 5
const { browser, page, errors } = await open({ state: STATE })
await board(page, di)
const pk = async () => { const o={}; for(const p of await allPucks(page)) (o[p.item]||=[]).push(`${p.cs}${p.on?'':'(OFF)'}`); return o }
const putReal = async (key) => { await tap(page, `[data-slot="${key}"], [data-fill="${key}"]`); await page.waitForTimeout(220)
  if(!await page.evaluate(()=>(window.ARM&&window.ARM.key)||null)) return 'NOT ARMED'
  const ids=await page.evaluate(()=>[...document.querySelectorAll('#sbRoster .rpuck[data-person]')].filter(e=>e.offsetParent!==null).map(e=>e.dataset.person).filter(v=>v!=='allavail'&&v!=='all'))
  if(!ids.length){await page.keyboard.press('Escape');return 'NOBODY'}
  await page.locator(`#sbRoster .rpuck[data-person="${ids[0]}"]:visible`).first().click(); await page.waitForTimeout(500)
  await page.keyboard.press('Escape'); return ids[0] }
const putPH = async (key) => { await tap(page, `[data-slot="${key}"], [data-fill="${key}"]`); await page.waitForTimeout(220)
  if(!await page.evaluate(()=>(window.ARM&&window.ARM.key)||null)) return 'NOT ARMED'
  const p=page.locator('#sbRoster .rpuck[data-person="allavail"]:visible').first()
  if(!await p.count()){await page.keyboard.press('Escape');return 'NO PLACEHOLDER OFFERED'}
  await p.click(); await page.waitForTimeout(600); await page.keyboard.press('Escape'); return 'allavail' }

/* ---- OIL7: switch the OCU REVIEW ground row OFF, then add a man ---------- */
const GR = 'r:rmubcm5adgaphyo'
await oilMode(page, true)
console.log('OCU REVIEW before:', ((await pk())[GR]||[]).join(', '))
await tap(page, `[data-oilitem="${GR}"]`); await page.waitForTimeout(500)
console.log('tapped the row name — said:', await toast(page))
console.log(' switch:', (await allSwitches(page)).filter(s=>s.item===GR).map(s=>s.state+' :: '+s.title).join(''))
console.log(' pucks while OFF:', ((await pk())[GR]||[]).join(', ') || '(NONE DRAWN)')
await shot(page, 'RULE-02c-ground-row-off')
await oilMode(page, false)
console.log('add a man to that switched-off row ->', await putPH(`g:${di}.0.+`))
await oilMode(page, true)
console.log(' OCU REVIEW after the late add:', ((await pk())[GR]||[]).join(', ') || '(NONE DRAWN)')
console.log(' switch after:', (await allSwitches(page)).filter(s=>s.item===GR).map(s=>s.state+' :: '+s.title).join(''))
await shot(page, 'RULE-02c-oil7-late-add')

/* ---- OIL8 on a DUTY DESK, a SIM row, and an EXTRAS line ------------------ */
await oilMode(page, false)
console.log('\nplaceholder onto the AVALON duty desk OPS O ->', await putPH(`d:${di}.1.1.+`))
console.log('placeholder onto the OFT sim extras (EP-6) ->', await putPH(`s:${di}.oft.0.+`))
console.log('placeholder onto the AMT passenger line (BOX) ->', await putPH(`s:${di}.amt.1.+`))
console.log('placeholder onto the Common Programme extras (MASS BRIEF) ->', await putPH(`a:${di}.1.+`))
await oilMode(page, true)
const crowds = await pk()
for (const [k,v] of Object.entries(crowds)) if (v.length>3) console.log(' crowd', k, '->', v.length, 'pucks;', v.slice(0,3).join(', '), '...')
await shot(page, 'RULE-02c-oil8-crowds')
/* take one man off each crowd through its own puck */
for (const [k,v] of Object.entries(crowds)) { if (v.length<4) continue
  const who = await page.evaluate(it=>{const e=document.querySelector(`#schedBoard [data-oilp][data-oilitem="${it}"]`);return e?e.dataset.oilp:null}, k)
  if(!who) { console.log(' NO PUCK to tap on', k); continue }
  await tap(page, `[data-oilp="${who}"][data-oilitem="${k}"]`); await page.waitForTimeout(450)
  console.log(' one off', k, '->', await toast(page)) }
await shot(page, 'RULE-02c-oil8-one-off-each')

/* ---- Undo actually walks an OIL decision back ---------------------------- */
const before = (await pk())
const u = await page.evaluate(()=>{const b=document.querySelector('#schedBoard')
  const btn=[...b.querySelectorAll('button')].find(x=>/Undo/i.test(x.innerText||''));return btn?{title:btn.title,dis:btn.disabled}:'NONE'})
console.log('\nUndo reads:', JSON.stringify(u))
await page.evaluate(()=>{const b=document.querySelector('#schedBoard');const btn=[...b.querySelectorAll('button')].find(x=>/Undo/i.test(x.innerText||''));if(btn)btn.click()})
await page.waitForTimeout(800)
console.log('after Undo — said:', await toast(page))
const after = await pk()
for (const k of Object.keys(before)) { const b=before[k].filter(s=>/OFF/.test(s)).length, a=(after[k]||[]).filter(s=>/OFF/.test(s)).length
  if (b!==a) console.log('  ', k, 'men switched off:', b, '->', a) }
await shot(page, 'RULE-02c-after-undo')
console.log('\nerrors:', errors.slice(0,6))
await browser.close()
