/* RULES SWEEP 2d — the EXTRAS lines. An extras zone that already holds people
   must be pressed on its EMPTY part: its centre is a puck, and pressing a puck
   selects the man instead of arming the zone. */
import { open, board, tap, shot, oilMode, STATE } from './lib.mjs'
import { allPucks, allSwitches, allChips, toast } from './seat-lib.mjs'
const di = 5
const { browser, page, errors } = await open({ state: STATE })
await board(page, di)
const pk = async () => { const o={}; for(const p of await allPucks(page)) (o[p.item]||=[]).push(`${p.cs}${p.on?'':'(OFF)'}`); return o }

/** press a fill zone where no puck is drawn */
async function armZone(page, key) {
  const box = await page.evaluate(k => { const b=document.querySelector('#schedBoard')
    const z=[...b.querySelectorAll(`[data-fill="${k}"]`)].find(e=>e.offsetParent!==null); if(!z) return null
    const r=z.getBoundingClientRect(); const pucks=[...z.querySelectorAll('[data-person]')].map(p=>p.getBoundingClientRect())
    const right = pucks.length ? Math.max(...pucks.map(p=>p.right)) : r.left
    z.scrollIntoView({block:'center'})
    const r2=z.getBoundingClientRect()
    const off = pucks.length ? (Math.max(...pucks.map(p=>p.right)) - r.left) : 0
    return { x:r2.left+Math.min(off+8, r2.width-4), y:r2.top+r2.height/2, w:r2.width, used:off } }, key)
  if (!box) return 'NO ZONE'
  if (box.used > box.w - 6) return 'ZONE FULL — no empty pixels to press'
  await page.mouse.click(box.x, box.y); await page.waitForTimeout(300)
  return await page.evaluate(()=>(window.ARM&&window.ARM.key)||null) || 'NOT ARMED'
}
async function dropPH(page, key) {
  const armed = await armZone(page, key)
  if (typeof armed === 'string' && !armed.startsWith('5') && !armed.includes(':')) return armed
  const p = page.locator('#sbRoster .rpuck[data-person="allavail"]:visible').first()
  if (!await p.count()) { await page.keyboard.press('Escape'); return 'NO PLACEHOLDER OFFERED (armed '+armed+')' }
  await p.click(); await page.waitForTimeout(600)
  const said = await toast(page)
  await page.keyboard.press('Escape')
  const holds = await page.evaluate(k=>{const b=document.querySelector('#schedBoard')
    const z=[...b.querySelectorAll(`[data-fill="${k}"]`)].find(e=>e.offsetParent!==null)
    return z?[...z.querySelectorAll('[data-person]')].map(e=>e.dataset.person):[]}, key)
  return `armed=${armed} holds=[${holds}]` + (said?` SAID: ${said}`:'')
}

for (const k of [`s:${di}.oft.0.+`, `s:${di}.amt.1.+`, `a:${di}.1.+`, `g:${di}.0.+`, `d:${di}.0.0.+`]) {
  console.log(k, '->', await dropPH(page, k))
}
await shot(page, 'RULE-02d-extras-placeholders')

console.log('\n=== chips, mode OFF (D27 — the count on every seat) ===')
for (const c of await allChips(page)) console.log(' ', JSON.stringify(c))
console.log('\n=== mode ON ==='); await oilMode(page, true)
const crowds = await pk()
for (const [k,v] of Object.entries(crowds)) if (v.length>3) console.log(' crowd', k, '->', v.length, 'pucks;', v.slice(0,3).join(', '), '...')
console.log('\n--- switches on the rows that took a placeholder ---')
for (const s of await allSwitches(page)) if (/EP-6|BOX|MASS|OCU|SDO/.test(s.txt)) console.log(' ', JSON.stringify(s))
await shot(page, 'RULE-02d-mode-on')
console.log('\nerrors:', errors.slice(0,6))
await browser.close()
