/* RULES SWEEP 3b — D49's "the day says it ON THE LINE". Does anything appear on
   the line itself, and does tapping the warning light that line? */
import { open, board, tap, type, shot, warnings, STATE } from './lib.mjs'
const di = 5
const { browser, page, errors } = await open({ state: STATE })
await board(page, di)
const boxes = async (tag) => { const r = await page.evaluate(i => { const b=document.querySelector('#schedBoard')
  const out={}
  for (const f of ['to','ld','cs']) { const e=[...b.querySelectorAll(`[data-bfld="ff:${i}.0.0.${f}"]`)].find(x=>x.offsetParent!==null)
    out[f]= e ? { cls:e.className, title:e.getAttribute('title')||'', bd:getComputedStyle(e).borderColor, bg:getComputedStyle(e).backgroundColor } : 'ABSENT' }
  const row=[...b.querySelectorAll('.sb-line')].find(x=>x.offsetParent!==null&&/VIPER/.test(x.innerText||''))
  out.row = row ? { cls:row.className, title:row.getAttribute('title')||'', txt:(row.innerText||'').replace(/\s+/g,' ').slice(0,120) } : 'NO ROW'
  return out }, di)
  console.log(tag, JSON.stringify(r, null, 1)); return r }

await boxes('BEFORE:')
await type(page, `[data-bfld="ff:${di}.0.0.to"]`, '10:00')
await type(page, `[data-bfld="ff:${di}.0.0.ld"]`, '10:00')
await page.waitForTimeout(800)
await boxes('AFTER the same-time typing:')
await shot(page, 'RULE-03b-line-after')

/* the warning entry itself, and what it does when tapped */
const entries = await page.evaluate(() => [...document.querySelectorAll('#sbSide li, #sbSide .wrow, #sbSide [data-warn], #sbSide [data-wi]')]
  .filter(e=>e.offsetParent!==null).map((e,i)=>({i, txt:(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,90), d:JSON.stringify(e.dataset), cls:e.className.slice(0,40)})))
console.log('\nWARNING LIST ENTRIES:'); for (const e of entries) console.log(' ', JSON.stringify(e))
const idx = entries.findIndex(e=>/takes off and lands at the same time/.test(e.txt))
console.log('the nought-minute entry is at', idx)
if (idx >= 0) {
  await page.evaluate(i => { const els=[...document.querySelectorAll('#sbSide li, #sbSide .wrow, #sbSide [data-warn], #sbSide [data-wi]')].filter(e=>e.offsetParent!==null); els[i].click() }, idx)
  await page.waitForTimeout(900)
  await shot(page, 'RULE-03b-warning-tapped')
  const lit = await page.evaluate(() => { const b=document.querySelector('#schedBoard')
    return { focused: [...b.querySelectorAll('.wfoc,.advf,.wtgt,[class*=foc]')].filter(e=>e.offsetParent!==null)
        .map(e=>({cls:e.className.slice(0,50), fld:e.dataset.bfld||e.dataset.person||'', txt:(e.value||e.innerText||'').slice(0,24)})).slice(0,10),
      focus: JSON.stringify(window.WFOCUS||null) } })
  console.log('\nWHAT LIT UP:', JSON.stringify(lit, null, 1))
}
console.log('\nerrors:', errors.slice(0,6))
await browser.close()
