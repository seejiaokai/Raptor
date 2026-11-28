// shr-a-probe3 — walker A's look (no assertions): the Inputs window's Dates calendar and kind-specific fields.
import { L, J, sleep, world } from './shr-a-lib.mjs'
import { writeFileSync } from 'node:fs'
console.log('shr-a-probe3 v1')
const w = await world(); const p = w.page
await L.openDay(w, '2026-07-13'); await L.press(w, '#icPopAdd'); await p.locator('#inpEditPop #inpEditType').waitFor()
for (const t of ['OD', 'CSE', 'Attach', 'Other', 'Appointment']) {
  await p.selectOption('#inpEditPop #inpEditType', t); await sleep(400)
  const info = await p.evaluate(() => { const win = document.querySelector('#inpEditPop'); return { inputs: [...win.querySelectorAll('input,select,textarea')].filter(b => b.offsetWidth).map(b => `${b.id}|${b.type}|${b.value}|${b.getAttribute('data-testid') || ''}`), spans: [...win.querySelectorAll('[data-span]')].map(b => b.getAttribute('data-span')), testids: [...new Set([...win.querySelectorAll('[data-testid]')].filter(b => b.offsetWidth).map(b => b.getAttribute('data-testid')))].slice(0, 40), heads: [...win.querySelectorAll('.inped-k, h3, h4, label')].filter(b => b.offsetWidth).map(b => b.textContent.trim()).slice(0, 30) } })
  console.log('TYPE', t, J(info))
}
const html = await p.evaluate(() => document.querySelector('[data-testid="range-picker"]')?.outerHTML || 'none')
writeFileSync(`${L.OUT}/range.html`, html)
await p.screenshot({ path: `${L.OUT}/win.png`, fullPage: false })
await L.finish()
