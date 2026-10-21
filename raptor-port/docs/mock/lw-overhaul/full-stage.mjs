// Stage the full mock-up's sample squadron in the REAL build (clock Thu 8 Jan 26), through the app's own controls where
// they exist: Saber (admin) sets Ranger's LVE, approves / refuses / acks by the bid window and the drag-selection window;
// bids are placed by the war's own cell door (lwSetCell); leave and medical filed on the Inputs page go through the real
// inputs door (fileInput). Saves the browser state for the picture scripts, and takes today's pictures.
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium, newPage, signIn, shot, q, esc, dragCells, errs, OUT } from './full-lib.mjs'
const browser = await chromium.launch()
let { ctx, p } = await newPage(browser, 1536, 860, false)
await signIn(p, 'admin')
const set = (who, d, code) => p.evaluate(([w, d, c]) => window.lwSetCell(w, d, c), [who, d, code])
const decide = async (who, d, how) => { await p.click(q(`cell-${who}-${d}`)); await p.waitForTimeout(400); await p.click(q(`decide-${how}`)); await p.waitForTimeout(350); await esc(p) }
const block = async (who, a, b, how) => { await dragCells(p, `cell-${who}-${a}`, `cell-${who}-${b}`); await p.click(q(`sel-${how}`)); await p.waitForTimeout(400); await esc(p) }

// Ranger's LVE, as round 1 (the person window's Set)
await p.click(q('person-bane')); await p.waitForTimeout(400)
await p.click(q('lve-edit')); await p.fill(q('lve-input'), '20'); await p.click(q('lve-save')); await p.waitForTimeout(300); await esc(p)
await p.click(q('person-dice')); await p.waitForTimeout(400)
await p.click(q('lve-edit')); await p.fill(q('lve-input'), '18'); await p.click(q('lve-save')); await p.waitForTimeout(300); await esc(p)

// the bids
for (const d of ['2026-01-19', '2026-01-20', '2026-01-21', '2026-02-02']) await set('bane', d, 'LL')
for (const d of ['2026-01-19', '2026-01-20', '2026-01-21', '2026-01-22', '2026-01-23']) await set('dice', d, 'OL')
await set('dice', '2026-01-27', 'LL'); await set('slipway', '2026-01-27', 'LL'); await set('glass', '2026-01-27', 'LL'); await set('shaft', '2026-01-27', 'LL')
await set('shaft', '2026-01-20', '*LL')
await set('snap', '2026-01-22', 'LL'); await set('snap', '2026-01-23', 'LL')
await set('nact', '2026-01-23', 'LL*')
await set('stiff', '2026-01-30', 'LL')
await p.waitForTimeout(500)
await block('bane', '2026-01-19', '2026-01-21', 'approve')
await block('dice', '2026-01-19', '2026-01-23', 'approve')
await decide('bane', '2026-02-02', 'refuse')
await decide('shaft', '2026-01-20', 'approve')
await decide('snap', '2026-01-22', 'ack')
await decide('stiff', '2026-01-30', 'approve')
// a second entry on Anvil's Tue 20 Jan: the free afternoon, OIL, through the bid window
await p.click(q('cell-shaft-2026-01-20')); await p.waitForTimeout(500)
const second = await p.evaluate(() => [...document.querySelectorAll('.bidsheet button')].map(b => (b.dataset.testid || '') + ':' + b.textContent.trim()).join(' | '))
console.log('Anvil 20 Jan window:', second)
if (await p.locator(q('bid-heldhalf')).count()) { await p.click(q('bid-heldhalf')); await p.waitForTimeout(300) }
if (await p.locator(q('portion-pm')).count()) { await p.click(q('portion-pm')); await p.waitForTimeout(200) }
if (await p.locator(q('bid-OIL')).count()) { await p.click(q('bid-OIL')); await p.waitForTimeout(400) }
await esc(p)
// leave filed on the Inputs page (the blue edge), and a medical
await p.evaluate(() => {
  window.fileInput({ person: 'pump', date: 'Jan 26', endDate: 'Jan 28', allday: true, type: 'LL', remarks: 'Local leave', yr: 2026, by: 'pump', at: Date.now(), modBy: 'pump', modAt: Date.now() })
  window.fileInput({ person: 'mamba', date: 'Jan 21', endDate: 'Jan 22', allday: true, type: 'ATT C', remarks: 'Medically down', yr: 2026, by: 'mamba', at: Date.now(), modBy: 'mamba', modAt: Date.now() })
})
await p.waitForTimeout(800)
await p.click('button:has-text("Logout")'); await p.waitForSelector('#luser')
// Ranger's own two waiting days and an AM, placed by him through the bid window
await signIn(p, 'member')
for (const d of ['2026-01-26', '2026-01-27']) { await p.click(q(`cell-bane-${d}`)); await p.waitForTimeout(400); await p.click(q('bid-LL')); await p.waitForTimeout(400); await esc(p) }
await p.click(q('cell-bane-2026-01-29')); await p.waitForTimeout(400); await p.click(q('portion-am')); await p.click(q('bid-LL')); await p.waitForTimeout(400); await esc(p)
const cells = await p.evaluate(() => {
  const out = {}
  for (const id of ['bane', 'dice', 'shaft', 'snap', 'pump', 'mamba', 'nact', 'slipway', 'glass', 'stiff']) {
    out[id] = [...document.querySelectorAll(`[data-testid^="cell-${id}-2026-01-"], [data-testid^="cell-${id}-2026-02-0"]`)].filter(e => e.innerText.trim()).map(e => e.dataset.testid.slice(-5) + ' ' + e.innerText.trim().replace(/\s+/g, '/') + ' [' + [...e.querySelectorAll('.c')].map(c => c.className).join(';') + ']').join(', ')
  }
  return out
})
console.log(JSON.stringify(cells, null, 1))
const state = await ctx.storageState({ indexedDB: true })
writeFileSync(join(OUT, 'state.json'), JSON.stringify(state))
await ctx.close(); await browser.close(); console.log('errors:', errs)
