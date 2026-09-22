/* RULES SWEEP 3d — is "nothing lights" peculiar to the nought-minute warning,
   or is that how every warning behaves on this board? Tap one that names crew
   and one that names the line, and compare. Also: does the board even scroll
   to the line? */
import { open, board, type, shot, STATE } from './lib.mjs'
const di = 5
const { browser, page, errors } = await open({ state: STATE })
await board(page, di)
await type(page, `[data-bfld="ff:${di}.0.0.ld"]`, '10:00')
await page.waitForTimeout(800)
const rows = async () => page.evaluate(() => [...document.querySelectorAll('.wln')].filter(e=>e.offsetParent!==null)
  .map(e=>(e.innerText||'').replace(/\s+/g,' ').slice(0,70)))
const snap = async () => page.evaluate(() => { const b=document.querySelector('#schedBoard')
  const wrap=b.querySelector('.sb-boardwrap')||b
  return { lit:[...b.querySelectorAll('.wfoc,.advf')].filter(e=>e.offsetParent!==null).map(e=>e.dataset.person||e.className.slice(0,30)),
    scrollTop: Math.round(wrap.scrollTop||window.scrollY), y: Math.round(window.scrollY) } })
const list = await rows(); console.log('rows:'); list.forEach((t,i)=>console.log(' ', i, t))
for (const [label, want] of [['names CREW (Basher)', /Basher/], ['names the LINE (nought-minute)', /takes off and lands/]]) {
  const ix = list.findIndex(t=>want.test(t)); if (ix<0) { console.log(label, '— NOT PRESENT'); continue }
  /* clear any previous focus by tapping elsewhere */
  await page.evaluate(()=>{const b=document.querySelector('#schedBoard');b.click()}); await page.waitForTimeout(400)
  const before = await snap()
  await page.evaluate(i=>{const els=[...document.querySelectorAll('.wln')].filter(e=>e.offsetParent!==null);els[i].click()}, ix)
  await page.waitForTimeout(1100)
  const after = await snap()
  console.log(`\n${label}: before ${JSON.stringify(before)}\n   after  ${JSON.stringify(after)}`)
  await shot(page, 'RULE-03d-' + (want.source.includes('Basher')?'crew':'line') + '-tapped')
}
console.log('\nerrors:', errors.slice(0,6))
await browser.close()
