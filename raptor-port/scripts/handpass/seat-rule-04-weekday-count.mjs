/* RULES SWEEP 4 — D27 "the count shows on every seat, on EVERY DAY, with the
   earn mode off" and D37 "on a day that earns nothing it does not mention OIL
   at all". Walked on a WEEKDAY, and the tap checked as well as the chip.
   Also: does the nought-minute line carry any mark on the WEEK? */
import { open, board, tap, type, shot, go, STATE } from './lib.mjs'
import { allChips, toast } from './seat-lib.mjs'
const di = 2   // Wednesday
const { browser, page, errors } = await open({ state: STATE })
await board(page, di)
console.log('day', di, await page.evaluate(i=>window.DAYS[i].dow, di))
console.log('is there an OIL Earn door on a weekday?', await page.locator('#sbOil').count())

async function armZone(key) {
  const box = await page.evaluate(k => { const b=document.querySelector('#schedBoard')
    const z=[...b.querySelectorAll(`[data-fill="${k}"],[data-slot="${k}"]`)].find(e=>e.offsetParent!==null); if(!z) return null
    z.scrollIntoView({block:'center'}); const r=z.getBoundingClientRect()
    const pucks=[...z.querySelectorAll('[data-person]')].map(p=>p.getBoundingClientRect())
    const off = pucks.length ? Math.max(...pucks.map(p=>p.right))-r.left : 0
    return { x:r.left+Math.min(off+8, r.width-4), y:r.top+r.height/2, full: off > r.width-6 } }, key)
  if (!box) return 'NO ZONE'; if (box.full) return 'ZONE FULL'
  await page.mouse.click(box.x, box.y); await page.waitForTimeout(300)
  return await page.evaluate(()=>(window.ARM&&window.ARM.key)||null) || 'NOT ARMED'
}
async function dropPH(key, who='allavail') {
  const a = await armZone(key); if (!String(a).includes(':') && !/^\d/.test(String(a))) return a
  const p = page.locator(`#sbRoster .rpuck[data-person="${who}"]:visible`).first()
  if (!await p.count()) { await page.keyboard.press('Escape'); return 'NOT OFFERED' }
  await p.click(); await page.waitForTimeout(600); await page.keyboard.press('Escape'); return 'dropped'
}
/* what rows does the Wednesday have? */
const shape = await page.evaluate(i=>({g:window.DAYS[i].ground.length, a:window.DAYS[i].allhands.length,
  d:window.DAYS[i].dutywaves.map(b=>b.rows.length), s:{oft:window.DAYS[i].sims.oft.length, amt:window.DAYS[i].sims.amt.length}}), di)
console.log('shape:', JSON.stringify(shape))
for (const k of [`g:${di}.0.+`, `a:${di}.0.+`, `d:${di}.0.0.+`, `s:${di}.oft.0.+`]) console.log(k, '->', await dropPH(k))
await shot(page, 'RULE-04-weekday-placeholders')
console.log('\n=== CHIPS on a WEEKDAY (mode is off — there is no mode here) ===')
const chips = await allChips(page)
for (const c of chips) console.log(' ', JSON.stringify(c))
console.log('any chip that mentions OIL?', chips.filter(c=>/OIL|earn/i.test(c.txt+c.title)).length)

/* the TAP must use the same words as the chip (D37, step 10) */
if (chips.length) {
  await tap(page, `.oilcount`)
  await page.waitForTimeout(700)
  console.log('TAP said:', await toast(page))
  await shot(page, 'RULE-04-weekday-chip-tap')
}

/* the nought-minute line on the WEEK surface */
console.log('\n=== the nought-minute line on the WEEK ===')
await type(page, `[data-bfld="ff:${di}.0.0.ld"]`, await page.evaluate(i=>window.DAYS[i].waves[0].formations[0].to, di))
await page.waitForTimeout(700)
await page.evaluate(()=>{const b=document.querySelector('#schedBoard');const x=[...b.querySelectorAll('button')].find(e=>/Close/.test(e.innerText||''));if(x)x.click()})
await page.waitForTimeout(900)
await go(page, 'editsched')
await page.waitForTimeout(800)
const wk = await page.evaluate(i => { const d=document.querySelector(`#eWeek .day[data-day="${i}"]`)||document.querySelector(`.day[data-day="${i}"]`)
  if(!d) return 'NO DAY CARD'
  const t=(d.innerText||'')
  return { mentionsIt: /same time|takes off and lands/.test(t), warnHead: (t.match(/[^\n]*issue[^\n]*/)||[''])[0],
    lineCells: [...d.querySelectorAll('[data-slot],[data-txt]')].filter(e=>/foc|warn|adv|bad/.test(e.className)).map(e=>e.className.slice(0,40)).slice(0,6) } }, di)
console.log('week day card:', JSON.stringify(wk))
await shot(page, 'RULE-04-week-day-card')
console.log('\nerrors:', errors.slice(0,6))
await browser.close()
