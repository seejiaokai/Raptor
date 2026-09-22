/* RULES SWEEP 1b — D24's two unwalked halves: a BB LINE and an SC SPARE, crewed
   with REAL people (the placeholder is refused on a cockpit seat, D33, so the
   first attempt left both lines empty and both marks unearned). */
import { open, board, tap, shot, oilMode, STATE } from './lib.mjs'
import { allSwitches, allPucks, toast } from './seat-lib.mjs'

const di = 5
const { browser, page, errors } = await open({ state: STATE })
await board(page, di)

async function putReal(page, key) {
  await tap(page, `[data-slot="${key}"], [data-fill="${key}"]`)
  await page.waitForTimeout(200)
  const armed = await page.evaluate(() => (window.ARM && window.ARM.key) || null)
  if (!armed) return 'NOT ARMED'
  const p = page.locator('#sbRoster .rpuck[data-person]:visible').filter({ hasNot: page.locator('x') })
  const ids = await page.evaluate(() => [...document.querySelectorAll('#sbRoster .rpuck[data-person]')]
    .filter(e=>e.offsetParent!==null).map(e=>e.dataset.person).filter(v=>v!=='allavail'&&v!=='all'))
  if (!ids.length) { await page.keyboard.press('Escape'); return 'NOBODY OFFERED' }
  const who = ids[0]
  const el = page.locator(`#sbRoster .rpuck[data-person="${who}"]:visible`).first()
  await el.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(100)
  try { await el.click({ timeout: 2500 }) } catch { const b = await el.boundingBox(); if (b) await page.mouse.click(b.x+b.width/2, b.y+b.height/2) }
  await page.waitForTimeout(400); await page.keyboard.press('Escape')
  const held = await page.evaluate(k => { const b=document.querySelector('#schedBoard')
    const h=b.querySelector(`[data-slot="${k}"]`)||b.querySelector(`[data-fill="${k}"]`)
    return h ? [...h.querySelectorAll('[data-person]')].map(e=>e.dataset.person) : ['NO HOST'] }, key)
  return `${who} -> seat now [${held}]`
}

/* BB wave through + Wave */
await tap(page, `[data-wvadd="${di}"]`); await page.waitForTimeout(400)
await page.locator('[data-wmkind="bb"]:visible').first().click(); await page.waitForTimeout(800)
const gi = await page.evaluate(i => window.DAYS[i].waves.findIndex(w=>w.kind==='bb'), di)
console.log('BB wave at index', gi)
console.log('BB P:', await putReal(page, `${di}.${gi}.0.0.p`))
console.log('BB W:', await putReal(page, `${di}.${gi}.0.0.w`))
/* SC SPARE — jet 4 of the 06:00 formation, and jet 3 of the 13:00 one */
console.log('SC SPARE (wave1 f0 jet4 P):', await putReal(page, `${di}.1.0.3.p`))
console.log('SC SPARE (wave1 f1 jet3 P):', await putReal(page, `${di}.1.1.2.p`))
const bbShape = await page.evaluate(([i,g]) => JSON.stringify(window.DAYS[i].waves[g]), [di,gi])
console.log('BB wave now:', bbShape.slice(0,400))

await shot(page, 'RULE-01b-bb-and-spare-crewed')
console.log('\n=== MODE ON ==='); await oilMode(page, true)
await shot(page, 'RULE-01b-switches')
const raw = await page.evaluate(() => [...document.querySelectorAll('#schedBoard .oilitem')].filter(e=>e.offsetParent!==null)
  .map(e=>({txt:(e.innerText||'').trim().slice(0,20),cls:e.className,bg:getComputedStyle(e).backgroundColor,title:(e.getAttribute('title')||'').slice(0,110)})))
for (const r of raw) if (/BB|SC|AV/.test(r.txt)) console.log(' ', JSON.stringify(r))
console.log('\n--- PUCKS on the lines that matter ---')
const byItem = {}; for (const p of await allPucks(page)) (byItem[p.item] ||= []).push(`${p.cs}${p.on?'':'(OFF)'}`)
for (const k of Object.keys(byItem)) { const v = byItem[k]; if (v.length<8) console.log(' ', k, '->', v.join(', ')) }
console.log('\nerrors:', errors.slice(0,6))
await browser.close()
