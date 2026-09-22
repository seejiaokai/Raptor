/* RULES SWEEP block 1 — D24, D35, D31, and the five switch sentences.
   Every kind that is supposed to OFFER the switch and START OFF is created
   through the app's own add controls, crewed by hand, then read off the screen. */
import { open, board, tap, type, shot, oilMode, STATE } from './lib.mjs'
import { allSwitches, allPucks, toast } from './seat-lib.mjs'

const di = 5
const { browser, page, errors } = await open({ state: STATE })
await board(page, di)

/* arm a seat and drop the first person the palette offers */
async function putAny(page, key) {
  await tap(page, `[data-slot="${key}"], [data-fill="${key}"]`)
  await page.waitForTimeout(200)
  const armed = await page.evaluate(() => (window.ARM && window.ARM.key) || null)
  if (!armed) return 'NOT ARMED'
  const p = page.locator('#sbRoster .rpuck[data-person]:visible').first()
  if (!await p.count()) { await page.keyboard.press('Escape'); return 'NOBODY OFFERED' }
  const who = await p.getAttribute('data-person')
  await p.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(100)
  try { await p.click({ timeout: 2500 }) } catch { const b = await p.boundingBox(); if (b) await page.mouse.click(b.x+b.width/2, b.y+b.height/2) }
  await page.waitForTimeout(400)
  await page.keyboard.press('Escape')
  return who
}

/* ---- 1. the BB line D24 has no fixture for: made through + Wave ---------- */
await tap(page, `[data-wvadd="${di}"]`)
await page.waitForTimeout(400)
const kinds = await page.evaluate(() => [...document.querySelectorAll('[data-wmkind]')].filter(e=>e.offsetParent!==null).map(e=>({k:e.dataset.wmkind,t:(e.innerText||'').trim()})))
console.log('+ Wave offers:', JSON.stringify(kinds))
if (kinds.some(k=>k.k==='bb')) { await page.locator('[data-wmkind="bb"]:visible').first().click(); await page.waitForTimeout(800); console.log('BB wave ADDED') }
else { await page.keyboard.press('Escape'); console.log('NO BB KIND OFFERED') }
await page.waitForTimeout(400)

/* ---- 2. the AVALON-template duty block (D35) ----------------------------- */
await tap(page, `[data-dwadd="${di}"]`)
await page.waitForTimeout(400)
const tpls = await page.evaluate(() => [...document.querySelectorAll('[data-blktpl]')].filter(e=>e.offsetParent!==null).map(e=>({id:e.dataset.blktpl,t:(e.innerText||'').replace(/\n/g,' · ').trim()})))
console.log('+ Block offers:', JSON.stringify(tpls))
const av = tpls.find(t => /AVALON desk/i.test(t.t))
if (av) { await page.locator(`[data-blktpl="${av.id}"]:visible`).first().click(); await page.waitForTimeout(800); console.log('AVALON-template block ADDED:', av.t) }
else { await page.keyboard.press('Escape'); console.log('NO AVALON-wave duty template in the library') }
await page.waitForTimeout(400)

/* ---- 3. what the day now holds ------------------------------------------ */
const shape = await page.evaluate(i => ({
  waves: window.DAYS[i].waves.map((w,gi)=>`[${gi}] ${w.label} kind=${w.kind||'fly'}`),
  duties: window.DAYS[i].dutywaves.map((b,bi)=>`[${bi}] ${b.label} sa=${b.sa||'-'} rows=${b.rows.length}`),
}), di)
console.log('SHAPE NOW:', JSON.stringify(shape, null, 1))

/* crew the new BB line and the new AVALON desk row, so the switches mean something */
const bbGi = shape.waves.findIndex(s=>/kind=bb/.test(s))
if (bbGi >= 0) {
  console.log('BB P seat ->', await putAny(page, `${di}.${bbGi}.0.0.p`))
  console.log('BB W seat ->', await putAny(page, `${di}.${bbGi}.0.0.w`))
}
const newBlk = shape.duties.length - 1
if (av) console.log('new AVALON desk row 0 ->', await putAny(page, `d:${di}.${newBlk}.0.+`))
/* crew the empty AVALON desk row already on the day (block 1, row 1 OPS O) */
console.log('existing AVALON desk OPS O ->', await putAny(page, `d:${di}.1.1.+`))
/* crew the SC SPARE second jet (D24 — SC SPARE offers the switch, starts off) */
console.log('SC SPARE jet4 P ->', await putAny(page, `${di}.1.0.3.p`))

await shot(page, 'RULE-01-day-with-bb-and-avalon-desk')

/* ---- 4. the switches, read off the screen -------------------------------- */
console.log('\n=== MODE ON ==='); console.log(JSON.stringify(await oilMode(page, true)))
await shot(page, 'RULE-01-switches-mode-on')
const raw = await page.evaluate(() => [...document.querySelectorAll('#schedBoard .oilitem')].filter(e=>e.offsetParent!==null).map(e=>{
  const cs = getComputedStyle(e)
  return { txt:(e.innerText||'').trim().slice(0,22), cls:e.className, item:e.dataset.oilitem||null,
    bg:cs.backgroundColor, fg:cs.color, bd:cs.borderColor, title:(e.getAttribute('title')||'').slice(0,120) }
}))
for (const r of raw) console.log(' ', JSON.stringify(r))
console.log('\n--- PUCKS ---')
const byItem = {}; for (const p of await allPucks(page)) (byItem[p.item] ||= []).push(`${p.cs}${p.on?'':'(OFF)'}`)
for (const k of Object.keys(byItem)) console.log(' ', k, '->', byItem[k].join(', '))
console.log('\nSENTENCES, unique:')
console.log([...new Set(raw.map(r=>r.title))].map(s=>'  · '+s).join('\n'))

/* ---- 5. phone width ------------------------------------------------------ */
await page.setViewportSize({ width: 390, height: 844 })
await page.waitForTimeout(900)
await shot(page, 'RULE-01-phone-switches')
const ph = await page.evaluate(() => [...document.querySelectorAll('.oilitem')].filter(e=>e.offsetParent!==null).length)
console.log('phone: switches visible =', ph)
console.log('\nerrors:', errors.slice(0,8))
await browser.close()
