/* RULES SWEEP 12b — D42 with a PLAIN overnight duty row that really earns. */
import { open, board, tap, type, shot, STATE } from './lib.mjs'
import { allChips, toast } from './seat-lib.mjs'
const di = 5
const { browser, page, errors } = await open({ state: STATE })
await board(page, di)
await tap(page, `[data-dradd="${di}.0"]`)
await page.waitForTimeout(700)
const flds = await page.evaluate(i => [...document.querySelectorAll(`#schedBoard [data-bfld^="dr:${i}.0."]`)]
  .filter(e=>e.offsetParent!==null).map(e=>e.dataset.bfld), di)
console.log('duty-row boxes:', JSON.stringify([...new Set(flds)]))
const r = await page.evaluate(i=>window.DAYS[i].dutywaves[0].rows.length-1, di)
for (const [suffix, val] of [['role','NIGHT SDO'],['str','19:00'],['end','07:00']]) {
  const f = [...new Set(flds)].find(k=>k.startsWith(`dr:${di}.0.${r}.`) && k.endsWith(suffix))
  if (f) { await type(page, `[data-bfld="${f}"]`, val); console.log('typed', f, '=', val) }
  else console.log('NO BOX for', suffix, 'on row', r) }
await page.waitForTimeout(600)
console.log('row now:', await page.evaluate(([i,rr])=>JSON.stringify(window.DAYS[i].dutywaves[0].rows[rr]), [di,r]))
const box=await page.evaluate(k=>{const b=document.querySelector('#schedBoard')
  const z=[...b.querySelectorAll(`[data-fill="${k}"]`)].find(e=>e.offsetParent!==null); if(!z)return null
  z.scrollIntoView({block:'center'}); const rr=z.getBoundingClientRect(); return {x:rr.left+8,y:rr.top+rr.height/2}}, `d:${di}.0.${r}.+`)
if (box) { await page.mouse.click(box.x,box.y); await page.waitForTimeout(280)
  const p=page.locator('#sbRoster .rpuck[data-person="allavail"]:visible').first()
  if (await p.count()) { await p.click(); await page.waitForTimeout(650) } await page.keyboard.press('Escape') }
const chips = await allChips(page)
console.log('SATURDAY chips:'); for (const c of chips) console.log('  ', c.txt, '|', c.title.slice(0,70))
if (chips.length) { await tap(page, '.oilcount', chips.length-1); await page.waitForTimeout(600)
  console.log('the overnight row pays:', (await toast(page)||'').slice(0,200)) }
await shot(page, 'RULE-12b-d42-saturday')
await board(page, 6)
console.log('SUNDAY chips:', JSON.stringify((await allChips(page)).map(c=>c.txt)))
console.log('Sunday duty rows:', await page.evaluate(()=>JSON.stringify((window.DAYS[6].dutywaves||[]).map(b=>b.rows.map(x=>`${x.role} ${x.str}-${x.end} ${x.id||''}`)))))
await shot(page, 'RULE-12b-d42-sunday')
console.log('\nerrors:', errors.slice(0,6))
await browser.close()
