/* F2, the missing half — tap the count chip in the MIXED state and read the
   list; and settle whether the board draws that chip at all. */
import { open, board, tap, type, shot, oilMode, go } from './lib.mjs'
import { modeRead, putSure } from './ef.mjs'
const STATE='C:/Users/User/AppData/Local/Temp/claude/C--Users-User-projects-Raptor/f98d5224-18e3-4e42-8a4f-bd4fe1b84782/scratchpad/hp/state-sat.json'
const di=6, R={}
const { browser, page, errors } = await open({ state: STATE })
await board(page,di)
await tap(page,`[data-padd="${di}"]`); await page.waitForTimeout(400)
await type(page,`[data-bfld="ap:${di}.0.prog"]`,'ALL HANDS')
await type(page,`[data-bfld="ap:${di}.0.str"]`,'08:00')
await type(page,`[data-bfld="ap:${di}.0.end"]`,'12:00')
R.put = await putSure(page,`[data-fill="a:${di}.0.+"]`,'allavail',id=>JSON.stringify(window.DAYS[6].allhands[0]).includes('"'+id+'"'))

/* exactly what the board draws around the sentinel — every node, so a chip
   under any other name would show up */
R.boardRow = await page.evaluate(() => {
  const pk=[...document.querySelectorAll('#schedBoard .puck.allavail')].find(e=>!e.closest('#sbRoster'))
  if(!pk) return 'NO SENTINEL'
  const cell=pk.closest('.ppl')||pk.parentElement
  return { seatHtml:(pk.closest('.seat')||pk.parentElement).outerHTML.slice(0,400), cellHtml:cell.outerHTML.slice(0,600) }
})
await shot(page,'EF-F2B-01-board-sentinel')

await oilMode(page,true)
const denied = await page.evaluate(()=>{ const el=[...document.querySelectorAll('#schedBoard [data-oilp]')].find(e=>{
  const row=e.closest('.sb-arow,.sb-row,tr,li'); if(!row||!/ALL HANDS/i.test(row.innerText||''))return false
  const pk=e.matches('[data-person]')?e:e.querySelector('[data-person]'); return pk&&pk.dataset.person==='bane'})
  if(!el)return null; el.scrollIntoView({block:'center'}); el.click(); return true })
R.denied = denied
await page.waitForTimeout(800)
await oilMode(page,false)

const x=page.locator('#sbClose:visible').first(); if(await x.count()){await x.click();await page.waitForTimeout(700)}
await go(page,'viewsched'); await page.waitForTimeout(800)
R.chips = await page.evaluate(()=>[...document.querySelectorAll('#vWeek .oilcount')].map(c=>({day:c.dataset.oilday,text:(c.innerText||'').trim(),title:c.getAttribute('title'),sent:c.dataset.oilsent})))
const c = page.locator('#vWeek .oilcount[data-oilday="6"]:visible').first()
R.found = await c.count()
if (await c.count()) { await c.evaluate(e=>e.scrollIntoView({block:'center'})); await page.waitForTimeout(200); await c.click(); await page.waitForTimeout(900) }
R.list = await page.evaluate(()=>{const t=document.getElementById('toastEl');return t?(t.innerText||'').replace(/\s+/g,' ').trim():'NO LIST'})
await shot(page,'EF-F2B-02-mixed-list')
R.errors = errors.slice(0,8)
const { writeFileSync } = await import('node:fs')
writeFileSync('C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/ef-f2b.json', JSON.stringify(R,null,1))
console.log('sentinel placed:',R.put,'| denied Ranger:',R.denied)
console.log('\nWHAT THE BOARD DRAWS AROUND THE SENTINEL:')
console.log('  seat: '+R.boardRow.seatHtml)
console.log('  cell: '+R.boardRow.cellHtml)
console.log('\nchips on the View-only week:',JSON.stringify(R.chips))
console.log('\nthe list the mixed chip shows:\n  '+R.list)
console.log('errors',R.errors)
await browser.close()
