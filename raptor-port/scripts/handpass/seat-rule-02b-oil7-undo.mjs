/* RULES SWEEP 2b — OIL7's "a man added later does not earn silently", OIL8's
   crowds, and what Undo calls an OIL decision. */
import { open, board, tap, shot, oilMode, STATE } from './lib.mjs'
import { allSwitches, allPucks, toast } from './seat-lib.mjs'
const di = 5
const { browser, page, errors } = await open({ state: STATE })
await board(page, di)
await oilMode(page, true)
const pk = async () => { const o={}; for(const p of await allPucks(page)) (o[p.item]||=[]).push(`${p.cs}${p.on?'':'(OFF)'}`); return o }
const SC = 'r:rmubclgntiqurs0'
console.log('SC row before:', ((await pk())[SC]||[]).join(', '))
await tap(page, `[data-oilitem="${SC}"]`); await page.waitForTimeout(500)
console.log('after tapping the SC row name — said:', await toast(page))
console.log(' pucks now:', ((await pk())[SC]||[]).join(', ') || '(NO PUCKS DRAWN)')
console.log(' switch:', (await allSwitches(page)).filter(s=>s.item===SC).map(s=>s.state+' :: '+s.title).join(''))
await shot(page, 'RULE-02b-sc-switched-off')

/* OIL7 — now add a man to an EMPTY seat on that same switched-off row */
await oilMode(page, false)
await tap(page, `[data-slot="${di}.1.0.1.p"], [data-fill="${di}.1.0.1.p"]`); await page.waitForTimeout(250)
const armed = await page.evaluate(()=>(window.ARM&&window.ARM.key)||null)
const ids = await page.evaluate(()=>[...document.querySelectorAll('#sbRoster .rpuck[data-person]')].filter(e=>e.offsetParent!==null).map(e=>e.dataset.person).filter(v=>v!=='allavail'&&v!=='all'))
console.log('armed the empty SC MAIN jet2 seat?', armed, '| offered', ids.length, 'people')
if (armed && ids.length) { await page.locator(`#sbRoster .rpuck[data-person="${ids[0]}"]:visible`).first().click(); await page.waitForTimeout(600) }
await page.keyboard.press('Escape')
await oilMode(page, true)
const after = (await pk())[SC]||[]
console.log('SC row AFTER the late add ->', after.join(', ') || '(NO PUCKS DRAWN)')
const late = await page.evaluate(([i,k])=>{ const b=document.querySelector('#schedBoard')
  const h=b.querySelector(`[data-slot="${k}"]`)||b.querySelector(`[data-fill="${k}"]`)
  return h? [...h.querySelectorAll('[data-person]')].map(e=>e.dataset.person):[] }, [di,`${di}.1.0.1.p`])
console.log('the seat holds:', JSON.stringify(late))
await shot(page, 'RULE-02b-oil7-late-add')

console.log('\n=== OIL8 — crowds that open into real pucks ===')
for (const [k,v] of Object.entries(await pk())) if (v.length>4) console.log(' ', k, '->', v.length, 'pucks:', v.slice(0,4).join(', '), '...')
/* take ONE man off a crowd */
const big = Object.entries(await pk()).sort((a,b)=>b[1].length-a[1].length)[0]
if (big) { const item=big[0]
  const who = await page.evaluate(it=>{const e=document.querySelector(`#schedBoard [data-oilp][data-oilitem="${it}"]`); return e?e.dataset.oilp:null}, item)
  await tap(page, `[data-oilp="${who}"][data-oilitem="${item}"]`); await page.waitForTimeout(500)
  console.log(' took one man off the crowd — said:', await toast(page))
  const now=(await pk())[item]||[]; console.log(' that crowd now:', now.filter(s=>/OFF/.test(s)).join(', ')||'(none off)', '| total', now.length)
  await shot(page, 'RULE-02b-oil8-one-man-off') }

console.log('\n=== OIL-UNDO-WORDS ===')
const u = await page.evaluate(()=>{const b=document.querySelector('#schedBoard')
  const btn=[...b.querySelectorAll('button')].find(x=>/Undo/i.test(x.innerText||''))
  return btn?{txt:(btn.innerText||'').trim(),title:btn.title,disabled:btn.disabled}:'NONE'})
console.log(' Undo button:', JSON.stringify(u))
await page.evaluate(()=>{const b=document.querySelector('#schedBoard');const h=[...b.querySelectorAll('button')].find(x=>/History/i.test(x.innerText||''));if(h)h.click()})
await page.waitForTimeout(1000)
const rows = await page.evaluate(()=>[...document.querySelectorAll('.sheet li,.sheet tr,.hrow,[class*=hist] li,[class*=hist] tr,[class*=log] li')]
  .filter(e=>e.offsetParent!==null).map(e=>(e.innerText||'').replace(/\s+/g,' ').trim()).filter(Boolean).slice(0,16))
console.log(' History rows:\n   ' + rows.join('\n   '))
await shot(page, 'RULE-02b-history')
console.log('\nerrors:', errors.slice(0,6))
await browser.close()
