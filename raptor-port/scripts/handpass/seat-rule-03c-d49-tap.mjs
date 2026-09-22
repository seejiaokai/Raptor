/* RULES SWEEP 3c — tap the nought-minute warning and see what it lights, on a
   weekend day and on a weekday. D49: "on the line, on any day". */
import { open, board, type, shot, warnings, STATE } from './lib.mjs'
const { browser, page, errors } = await open({ state: STATE })
for (const [di, what, g, l] of [[5,'SATURDAY',0,0],[2,'WEDNESDAY',0,0]]) {
  console.log('\n######', what, 'day', di, '######')
  await board(page, di)
  await type(page, `[data-bfld="ff:${di}.${g}.${l}.ld"]`, await page.evaluate(([i,gg,ll])=>window.DAYS[i].waves[gg].formations[ll].to,[di,g,l]))
  await page.waitForTimeout(800)
  const w = await page.evaluate(() => [...document.querySelectorAll('.wln')].filter(e=>e.offsetParent!==null)
    .map(e=>({ sev:e.className.replace('wln','').trim(), d:JSON.stringify(e.dataset), txt:(e.innerText||'').replace(/\s+/g,' ').slice(0,95) })))
  console.log('warning rows:'); for (const x of w) console.log('  ', JSON.stringify(x))
  const hit = w.findIndex(x=>/takes off and lands at the same time/.test(x.txt))
  console.log('the nought-minute row is at index', hit, hit>=0?('severity: '+w[hit].sev):'')
  if (hit < 0) { console.log('NOT DRAWN ON THIS DAY'); continue }
  await page.evaluate(i => { const els=[...document.querySelectorAll('.wln')].filter(e=>e.offsetParent!==null); els[i].click() }, hit)
  await page.waitForTimeout(1000)
  const lit = await page.evaluate(() => { const b=document.querySelector('#schedBoard')||document
    return { marked: [...b.querySelectorAll('.wfoc,.advf,.wtgt,.warnfoc,[class*=foc]')].filter(e=>e.offsetParent!==null)
        .map(e=>({cls:e.className.slice(0,46), fld:e.dataset.bfld||e.dataset.person||e.dataset.slot||'', val:(e.value||e.innerText||'').slice(0,20)})).slice(0,12),
      rowMark: [...b.querySelectorAll('.sb-line,.lin')].filter(e=>e.offsetParent!==null&&/foc|warn|adv/.test(e.className))
        .map(e=>e.className.slice(0,50)).slice(0,6) } })
  console.log('WHAT LIT:', JSON.stringify(lit, null, 1))
  await shot(page, `RULE-03c-d49-tapped-day${di}`)
}
console.log('\nerrors:', errors.slice(0,6))
await browser.close()
