/* THE PICKED PERSON CHIP OF THE INPUTS CALENDAR'S PEOPLE PICKER, DRAWN FOR HIS LOOK ([GLOW-OFF], D877's reading: "not
   drawn, put to him with a picture in that job before it changes"). Reached through the app's own controls: the Inputs
   calendar → a day → + Note → + people → two people tapped. Then the SAME frame with only the glow taken off by one
   override (printed below) — nothing in the app is changed. A wider frame marks where it is with a dashed amber box.
   usage: DL_BASE=http://localhost:4181 DL_SHOTS=docs/mock/2026-10-15-glow-places node scripts/handpass/glowoff-pickchip.mjs [phone|desk] */
import * as L from './dl-lib.mjs'

console.log('glowoff-pickchip v1')
const SIZE = process.argv[2] === 'phone' ? 'phone' : 'desk', T = SIZE
const NOGLOW = '.ic-pickp.on{box-shadow:0 0 0 1px var(--accent) !important}'
const w = await L.world(SIZE), p = w.page
try {
  await L.go(w, 'inputs')
  if (await p.locator('#inCalBtn').getAttribute('aria-pressed') !== 'true') await w.press('#inCalBtn')
  await p.waitForSelector('#inpCal'); await L.sleep(300)
  console.log('   inputs calendar on', (await p.locator('#inpCal .ic-mon').innerText()).trim())
  const iso = await p.evaluate(() => { const c = [...document.querySelectorAll('#inpCal [data-icday]')].find(c => new Date(c.dataset.icday + 'T12:00:00').getDay() === 3); return c ? c.dataset.icday : null })
  await p.locator(`#inpCal [data-icday="${iso}"]`).click({ position: { x: 8, y: 8 } }); await L.sleep(400)
  await w.press('#icAddPuck'); await L.sleep(250)
  await w.press('#icNewNotePpl'); await p.waitForSelector('.ic-pick'); await L.sleep(300)
  for (const n of [0, 1]) { await p.locator('.ic-pick .ic-pickp[data-pickp]:not(.already)').nth(n).click(); await L.sleep(150) }
  const on = await p.evaluate(() => { const e = document.querySelector('.ic-pickp.on'); if (!e) return null; e.setAttribute('data-mk', 'a'); return getComputedStyle(e).boxShadow })
  console.log('   day', iso, '— picked chip shadow today:', on)
  const style = c => p.evaluate(c => { let s = document.getElementById('mk-noglow'); if (!s) { s = document.createElement('style'); s.id = 'mk-noglow'; document.head.appendChild(s) } s.textContent = c }, c)
  await style(''); await L.sleep(120); await L.pic(w, `G9-pick-chip-today-${T}`, { around: '[data-mk="a"]', pad: 28 })
  await style(NOGLOW); await L.sleep(120); await L.pic(w, `G9-pick-chip-noglow-${T}`, { around: '[data-mk="a"]', pad: 28 })
  console.log('   no-glow shadow:', await p.evaluate(() => getComputedStyle(document.querySelector('[data-mk="a"]')).boxShadow))
  await style('')
  await p.evaluate(() => { const r = document.querySelector('[data-mk="a"]').getBoundingClientRect(); const b = document.createElement('div'); b.id = 'mk-box'; Object.assign(b.style, { position: 'fixed', left: (r.left - 8) + 'px', top: (r.top - 8) + 'px', width: (r.width + 16) + 'px', height: (r.height + 16) + 'px', border: '2px dashed #FFB020', borderRadius: '8px', zIndex: 99999, pointerEvents: 'none' }); document.body.appendChild(b) })
  await L.pic(w, `G9-pick-chip-where-${T}`)
} finally { await L.close(w) }
