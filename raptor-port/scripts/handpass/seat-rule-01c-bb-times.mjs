/* RULES SWEEP 1c — a BB line minted by + Wave comes up with NO TIMES, so it
   reads "nothing here can earn". D24 is about a BB line that CAN be measured:
   give it times, crew it, and read the switch. */
import { open, board, tap, type, shot, oilMode, STATE } from './lib.mjs'
import { allPucks } from './seat-lib.mjs'
const di = 5
const { browser, page, errors } = await open({ state: STATE })
await board(page, di)
await tap(page, `[data-wvadd="${di}"]`); await page.waitForTimeout(400)
await page.locator('[data-wmkind="bb"]:visible').first().click(); await page.waitForTimeout(800)
const gi = await page.evaluate(i => window.DAYS[i].waves.findIndex(w=>w.kind==='bb'), di)
/* what boxes does the BB line actually offer? */
const flds = await page.evaluate(([i,g]) => [...document.querySelectorAll(`#schedBoard [data-bfld^="ff:${i}.${g}."]`)]
  .filter(e=>e.offsetParent!==null).map(e=>e.dataset.bfld), [di,gi])
console.log('BB line boxes:', JSON.stringify(flds))
for (const f of flds) if (/\.(to|ld|str|end|shift)$/.test(f)) {
  await type(page, `[data-bfld="${f}"]`, /\.(to|str)$/.test(f) ? '08:00' : '16:00')
}
async function putReal(key) {
  await tap(page, `[data-slot="${key}"], [data-fill="${key}"]`); await page.waitForTimeout(200)
  if (!await page.evaluate(() => (window.ARM&&window.ARM.key)||null)) return 'NOT ARMED'
  const ids = await page.evaluate(() => [...document.querySelectorAll('#sbRoster .rpuck[data-person]')]
    .filter(e=>e.offsetParent!==null).map(e=>e.dataset.person).filter(v=>v!=='allavail'&&v!=='all'))
  if (!ids.length) { await page.keyboard.press('Escape'); return 'NOBODY OFFERED' }
  const el = page.locator(`#sbRoster .rpuck[data-person="${ids[0]}"]:visible`).first()
  await el.evaluate(e=>e.scrollIntoView({block:'center'})); await page.waitForTimeout(100)
  try { await el.click({timeout:2500}) } catch { const b=await el.boundingBox(); if(b) await page.mouse.click(b.x+b.width/2,b.y+b.height/2) }
  await page.waitForTimeout(400); await page.keyboard.press('Escape'); return ids[0]
}
console.log('BB P:', await putReal(`${di}.${gi}.0.0.p`), 'BB W:', await putReal(`${di}.${gi}.0.0.w`))
console.log('BB now:', (await page.evaluate(([i,g])=>JSON.stringify(window.DAYS[i].waves[g].formations[0]),[di,gi])).slice(0,260))
await oilMode(page, true)
await shot(page, 'RULE-01c-bb-with-times')
const raw = await page.evaluate(() => [...document.querySelectorAll('#schedBoard .oilitem')].filter(e=>e.offsetParent!==null)
  .map(e=>({txt:(e.innerText||'').trim().slice(0,16),cls:e.className,bg:getComputedStyle(e).backgroundColor,title:(e.getAttribute('title')||'').slice(0,110)})))
for (const r of raw) if (/^BB/.test(r.txt)) console.log('BB SWITCH:', JSON.stringify(r))
for (const p of await allPucks(page)) if (p.cs && ['dj','shaft'].includes(p.who)) console.log('BB PUCK:', JSON.stringify(p))
const byItem={}; for(const p of await allPucks(page)) (byItem[p.item]||=[]).push(`${p.cs}${p.on?'':'(OFF)'}`)
for(const k of Object.keys(byItem)) if(byItem[k].length<6) console.log(' ',k,'->',byItem[k].join(', '))
console.log('errors:', errors.slice(0,6))
await browser.close()
